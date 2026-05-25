# orders/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer
from restaurants.permissions import IsRestaurantOwner


class PlaceOrderView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        return serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = self.perform_create(serializer)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class CustomerOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).select_related(
            'restaurant', 'delivery_address'
        ).prefetch_related('items')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return Order.objects.filter(customer=user)
        elif user.role == 'owner':
            return Order.objects.filter(restaurant__owner=user)
        return Order.objects.all()  # admin


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, pk):
    try:
        order = Order.objects.get(pk=pk, customer=request.user)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found.'}, status=404)

    if order.status not in ['pending', 'confirmed']:
        return Response({'detail': 'Order cannot be cancelled at this stage.'}, status=400)

    order.status = 'cancelled'
    order.save()
    return Response(OrderSerializer(order).data)


class RestaurantOrderListView(generics.ListAPIView):
    """Owner sees their restaurant's incoming orders"""
    serializer_class = OrderSerializer
    permission_classes = [IsRestaurantOwner]

    def get_queryset(self):
        return Order.objects.filter(
            restaurant__owner=self.request.user
        ).select_related('customer', 'delivery_address').prefetch_related('items')


@api_view(['PATCH'])
@permission_classes([IsRestaurantOwner])
def update_order_status(request, pk):
    VALID_TRANSITIONS = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'cancelled'],
        'preparing': ['out_for_delivery'],
        'out_for_delivery': ['delivered'],
    }
    try:
        order = Order.objects.get(pk=pk, restaurant__owner=request.user)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found.'}, status=404)

    new_status = request.data.get('status')
    allowed = VALID_TRANSITIONS.get(order.status, [])
    if new_status not in allowed:
        return Response({'detail': f'Invalid transition from {order.status} to {new_status}.'}, status=400)

    order.status = new_status
    order.save()
    return Response(OrderSerializer(order).data)