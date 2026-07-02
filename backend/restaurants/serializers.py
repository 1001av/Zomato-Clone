# restaurants/serializers.py
# backend/restaurants/serializers.py
from rest_framework import serializers
from .models import Restaurant, Category, MenuItem, Cuisine, Favourite
from users.serializers import UserDetailSerializer


class CuisineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuisine
        fields = ['id', 'name', 'image']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'order']


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'description', 'price', 'image',
            'food_type', 'is_available', 'is_bestseller',
            'calories', 'category', 'category_name'
        ]

class RestaurantListSerializer(serializers.ModelSerializer):
    cuisines = CuisineSerializer(many=True, read_only=True)
    is_favourite = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'cuisines', 'city', 'banner', 'logo',
            'avg_rating', 'total_reviews', 'delivery_time',
            'delivery_fee', 'min_order', 'is_open', 'is_favourite'
        ]

    def get_is_favourite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favourited_by.filter(user=request.user).exists()
        return False


class RestaurantDetailSerializer(serializers.ModelSerializer):
    cuisines = CuisineSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    menu_items = MenuItemSerializer(many=True, read_only=True)
    owner = UserDetailSerializer(read_only=True)
    is_favourite = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = '__all__'

    def get_is_favourite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favourited_by.filter(user=request.user).exists()
        return False

class RestaurantCreateUpdateSerializer(serializers.ModelSerializer):
    cuisine_ids = serializers.PrimaryKeyRelatedField(
        queryset=Cuisine.objects.all(), many=True, source='cuisines', required=False
    )

    class Meta:
        model = Restaurant
        exclude = ['owner', 'avg_rating', 'total_reviews', 'status', 'created_at', 'updated_at']