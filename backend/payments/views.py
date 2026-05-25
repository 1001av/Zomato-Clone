# payments/views.py
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from orders.models import Order
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment_intent(request):
    """Create a Stripe PaymentIntent for an order"""
    order_id = request.data.get('order_id')
    try:
        order = Order.objects.get(id=order_id, customer=request.user, status='pending')
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found.'}, status=404)

    # Stripe amount is in smallest currency unit (paise for INR)
    amount_in_paise = int(order.total * 100)

    intent = stripe.PaymentIntent.create(
        amount=amount_in_paise,
        currency='inr',
        metadata={'order_id': str(order.id), 'user_id': str(request.user.id)},
        automatic_payment_methods={'enabled': True},
    )

    # Create pending payment record
    Payment.objects.get_or_create(
        order=order,
        defaults={
            'user': request.user,
            'amount': order.total,
            'stripe_payment_intent_id': intent.id,
        }
    )

    return Response({
        'client_secret': intent.client_secret,
        'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
        'amount': order.total,
        'order_number': order.order_number,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_payment(request):
    """Called by frontend after successful Stripe payment"""
    payment_intent_id = request.data.get('payment_intent_id')
    try:
        payment = Payment.objects.get(
            stripe_payment_intent_id=payment_intent_id,
            user=request.user
        )
    except Payment.DoesNotExist:
        return Response({'detail': 'Payment not found.'}, status=404)

    # Verify with Stripe
    intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    if intent.status == 'succeeded':
        payment.status = 'success'
        payment.stripe_charge_id = intent.latest_charge or ''
        payment.save()
        # Confirm the order
        payment.order.status = 'confirmed'
        payment.order.save()
        return Response({'status': 'success', 'order_number': payment.order.order_number})
    else:
        payment.status = 'failed'
        payment.failure_reason = intent.status
        payment.save()
        return Response({'status': 'failed'}, status=400)


@csrf_exempt
def stripe_webhook(request):
    """Handle Stripe webhook events"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    if event['type'] == 'payment_intent.succeeded':
        pi = event['data']['object']
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=pi['id'])
            payment.status = 'success'
            payment.save()
            payment.order.status = 'confirmed'
            payment.order.save()
        except Payment.DoesNotExist:
            pass

    elif event['type'] == 'payment_intent.payment_failed':
        pi = event['data']['object']
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=pi['id'])
            payment.status = 'failed'
            payment.failure_reason = pi.get('last_payment_error', {}).get('message', '')
            payment.save()
        except Payment.DoesNotExist:
            pass

    return HttpResponse(status=200)