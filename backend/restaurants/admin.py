# restaurants/admin.py
from django.contrib import admin
from .models import Restaurant, Category, MenuItem, Cuisine, Favourite

@admin.register(Cuisine)
class CuisineAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display  = ['name', 'owner', 'city', 'status', 'is_open', 'avg_rating']
    list_filter   = ['status', 'is_open']
    search_fields = ['name', 'city']
    list_editable = ['status', 'is_open']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'order']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display  = ['name', 'restaurant', 'price', 'food_type', 'is_available']
    list_filter   = ['food_type', 'is_available']
    search_fields = ['name']
    list_editable = ['is_available']

@admin.register(Favourite)
class FavouriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant']