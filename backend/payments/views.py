# payments/views.py
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from orders.models import Order
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment_intent(request):
    """Create a Stripe PaymentIntent for an order."""
    order_id = request.data.get('order_id')

    if not order_id:
        return Response({'detail': 'order_id is required.'}, status=400)

    # Check Stripe key is configured
    if not settings.STRIPE_SECRET_KEY:
        return Response({'detail': 'Payment not configured on server.'}, status=500)

    try:
        order = Order.objects.get(
            id=order_id,
            customer=request.user,
            status='pending'
        )
    except Order.DoesNotExist:
        return Response(
            {'detail': 'Order not found or already paid.'},
            status=404
        )

    # Stripe requires amount in smallest unit — paise for INR
    amount_paise = int(order.total * 100)

    if amount_paise < 50:  # Stripe minimum is 50 paise
        return Response({'detail': 'Order amount too small for payment.'}, status=400)

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_paise,
            currency='inr',
            metadata={
                'order_id':    str(order.id),
                'order_number': order.order_number,
                'user_id':     str(request.user.id),
            },
            automatic_payment_methods={'enabled': True},
        )
    except stripe.AuthenticationError:
        return Response(
            {'detail': 'Stripe authentication failed. Check your secret key.'},
            status=500
        )
    except stripe.StripeError as e:
        return Response({'detail': str(e)}, status=500)

    # Save pending payment record
    Payment.objects.update_or_create(
        order=order,
        defaults={
            'user':                     request.user,
            'amount':                   order.total,
            'stripe_payment_intent_id': intent.id,
            'status':                   'pending',
        }
    )

    return Response({
        'client_secret':   intent.client_secret,
        'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
        'amount':          str(order.total),
        'order_number':    order.order_number,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_payment(request):
    """Called by frontend after Stripe confirms payment on their side."""
    payment_intent_id = request.data.get('payment_intent_id')

    if not payment_intent_id:
        return Response({'detail': 'payment_intent_id is required.'}, status=400)

    try:
        payment = Payment.objects.get(
            stripe_payment_intent_id=payment_intent_id
        )
    except Payment.DoesNotExist:
        # Fallback: try finding by order via Stripe metadata
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            order_id = intent.metadata.get('order_id')
            if order_id:
                order = Order.objects.get(id=order_id, customer=request.user)
                payment, _ = Payment.objects.update_or_create(
                    order=order,
                    defaults={
                        'user': request.user,
                        'amount': order.total,
                        'stripe_payment_intent_id': payment_intent_id,
                        'status': 'pending',
                    }
                )
            else:
                return Response({'detail': 'Payment record not found.'}, status=404)
        except Exception as e:
            return Response({'detail': f'Payment record not found: {str(e)}'}, status=404)

    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    except stripe.StripeError as e:
        return Response({'detail': str(e)}, status=500)

    if intent.status == 'succeeded':
        payment.status = 'success'
        payment.stripe_charge_id = intent.latest_charge or ''
        payment.save()

        order = payment.order
        order.status = 'confirmed'
        order.save()

        return Response({
            'status':       'success',
            'order_id':     str(order.id),
            'order_number': order.order_number,
        })

    else:
        payment.status = 'failed'
        payment.failure_reason = intent.status
        payment.save()
        return Response({'status': 'failed', 'reason': intent.status}, status=400)


@csrf_exempt
def stripe_webhook(request):
    """Stripe sends events here after payment. No auth needed."""
    payload    = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse('Invalid payload', status=400)
    except stripe.SignatureVerificationError:
        return HttpResponse('Invalid signature', status=400)

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
            payment.failure_reason = (
                pi.get('last_payment_error', {}).get('message', 'Unknown')
            )
            payment.save()
        except Payment.DoesNotExist:
            pass

    return HttpResponse(status=200)