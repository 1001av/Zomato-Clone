# orders/models.py
import uuid
from django.db import models
from users.models import User, Address
from restaurants.models import Restaurant, MenuItem


class Coupon(models.Model):
    FLAT = 'flat'
    PERCENT = 'percent'
    DISCOUNT_TYPES = [(FLAT, 'Flat'), (PERCENT, 'Percentage')]

    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, default=FLAT)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.code


class Order(models.Model):
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    PREPARING = 'preparing'
    OUT_FOR_DELIVERY = 'out_for_delivery'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (CONFIRMED, 'Confirmed'),
        (PREPARING, 'Preparing'),
        (OUT_FOR_DELIVERY, 'Out for Delivery'),
        (DELIVERED, 'Delivered'),
        (CANCELLED, 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.PROTECT, related_name='orders')
    delivery_address = models.ForeignKey(
        Address, on_delete=models.SET_NULL, null=True, related_name='orders'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)

    # Pricing breakdown
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    special_instructions = models.TextField(blank=True)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
        # Count existing orders and increment safely
            count = Order.objects.count()
            self.order_number = f'ORD-{count + 1:04d}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.order_number} — {self.customer.email}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)  # snapshot at order time
    name = models.CharField(max_length=200)  # snapshot

    class Meta:
        db_table = 'order_items'

    @property
    def total_price(self):
        return self.price * self.quantity