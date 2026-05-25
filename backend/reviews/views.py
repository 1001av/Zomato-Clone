# reviews/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Review
from restaurants.models import Restaurant
from .serializers import ReviewSerializer, ReviewCreateSerializer


class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return Review.objects.filter(
            restaurant_id=restaurant_id, is_visible=True
        ).select_related('customer').order_by('-created_at')


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        restaurant = Restaurant.objects.get(pk=self.kwargs['restaurant_id'])
        serializer.save(customer=self.request.user, restaurant=restaurant)