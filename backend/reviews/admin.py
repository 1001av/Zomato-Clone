# reviews/admin.py
from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ['customer', 'restaurant', 'rating', 'is_visible', 'created_at']
    list_filter   = ['rating', 'is_visible']
    list_editable = ['is_visible']