# reviews/serializers.py
from rest_framework import serializers
from .models import Review
from users.serializers import UserDetailSerializer


class ReviewSerializer(serializers.ModelSerializer):
    customer = UserDetailSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'customer', 'rating', 'comment', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment', 'order']

    def validate(self, attrs):
        request = self.context['request']
        restaurant_id = self.context['view'].kwargs['restaurant_id']
        if Review.objects.filter(customer=request.user, restaurant_id=restaurant_id).exists():
            raise serializers.ValidationError('You have already reviewed this restaurant.')
        return attrs