# orders/serializers.py
from rest_framework import serializers
from decimal import Decimal
from .models import Order, OrderItem, Coupon
from restaurants.models import MenuItem


class OrderItemInputSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=20)


class OrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'name', 'quantity', 'price', 'total_price']


class OrderCreateSerializer(serializers.Serializer):
    restaurant_id = serializers.IntegerField()
    items = OrderItemInputSerializer(many=True, min_length=1)
    delivery_address_id = serializers.IntegerField()
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    special_instructions = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        from restaurants.models import Restaurant
        from users.models import Address

        # Validate restaurant
        try:
            restaurant = Restaurant.objects.get(pk=attrs['restaurant_id'], status='approved', is_open=True)
        except Restaurant.DoesNotExist:
            raise serializers.ValidationError({'restaurant_id': 'Restaurant not found or closed.'})

        # Validate address belongs to user
        user = self.context['request'].user
        try:
            address = Address.objects.get(pk=attrs['delivery_address_id'], user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError({'delivery_address_id': 'Address not found.'})

        # Validate all items belong to restaurant
        item_ids = [i['menu_item_id'] for i in attrs['items']]
        items = MenuItem.objects.filter(
            id__in=item_ids, restaurant=restaurant, is_available=True
        )
        if items.count() != len(set(item_ids)):
            raise serializers.ValidationError({'items': 'One or more items are invalid or unavailable.'})

        attrs['_restaurant'] = restaurant
        attrs['_address'] = address
        attrs['_items'] = {item.id: item for item in items}
        return attrs

    def create(self, validated_data):
        from django.utils import timezone
        restaurant = validated_data['_restaurant']
        address = validated_data['_address']
        items_data = validated_data['items']
        item_map = validated_data['_items']
        user = self.context['request'].user

        # Calculate subtotal
        subtotal = Decimal('0')
        for item_data in items_data:
            menu_item = item_map[item_data['menu_item_id']]
            subtotal += menu_item.price * item_data['quantity']

        # Tax (5%)
        tax = (subtotal * Decimal('0.05')).quantize(Decimal('0.01'))
        delivery_fee = restaurant.delivery_fee
        discount = Decimal('0')

        # Apply coupon
        coupon = None
        coupon_code = validated_data.get('coupon_code', '')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(
                    code=coupon_code, is_active=True,
                    valid_from__lte=timezone.now(), valid_to__gte=timezone.now()
                )
                if subtotal >= coupon.min_order_amount:
                    if coupon.discount_type == 'flat':
                        discount = coupon.discount_value
                    else:
                        discount = (subtotal * coupon.discount_value / 100)
                        if coupon.max_discount:
                            discount = min(discount, coupon.max_discount)
                    coupon.times_used += 1
                    coupon.save()
            except Coupon.DoesNotExist:
                pass

        total = subtotal + tax + delivery_fee - discount

        order = Order.objects.create(
            customer=user,
            restaurant=restaurant,
            delivery_address=address,
            coupon=coupon,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            tax=tax,
            discount=discount,
            total=total,
            special_instructions=validated_data.get('special_instructions', ''),
            estimated_delivery_time=timezone.now() + timezone.timedelta(minutes=restaurant.delivery_time),
        )

        for item_data in items_data:
            menu_item = item_map[item_data['menu_item_id']]
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item_data['quantity'],
                price=menu_item.price,
                name=menu_item.name,
            )

        return order


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_logo = serializers.ImageField(source='restaurant.logo', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'restaurant', 'restaurant_name', 'restaurant_logo',
            'status', 'status_display', 'items', 'subtotal', 'delivery_fee',
            'tax', 'discount', 'total', 'special_instructions',
            'estimated_delivery_time', 'created_at',
        ]