# orders/admin.py
from django.contrib import admin
from .models import Order, OrderItem, Coupon

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ['order_number', 'customer', 'restaurant', 'status', 'total', 'created_at']
    list_filter   = ['status']
    search_fields = ['order_number', 'customer__email']
    list_editable = ['status']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'name', 'quantity', 'price']

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'is_active']