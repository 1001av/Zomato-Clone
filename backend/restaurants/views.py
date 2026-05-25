# restaurants/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Restaurant, Category, MenuItem, Cuisine, Favourite
from .serializers import (
    RestaurantListSerializer, RestaurantDetailSerializer,
    RestaurantCreateUpdateSerializer, MenuItemSerializer,
    CategorySerializer, CuisineSerializer
)
from .permissions import IsOwnerOrAdmin, IsRestaurantOwner


class RestaurantListView(generics.ListAPIView):
    serializer_class = RestaurantListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'is_open']
    search_fields = ['name', 'cuisines__name', 'city']
    ordering_fields = ['avg_rating', 'delivery_time', 'delivery_fee', 'created_at']
    ordering = ['-avg_rating']

    def get_queryset(self):
        qs = Restaurant.objects.filter(status='approved').prefetch_related('cuisines')
        # Filter by cuisine
        cuisine = self.request.query_params.get('cuisine')
        if cuisine:
            qs = qs.filter(cuisines__name__icontains=cuisine)
        # Filter by rating
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            qs = qs.filter(avg_rating__gte=min_rating)
        # Filter by max delivery fee
        max_fee = self.request.query_params.get('max_fee')
        if max_fee:
            qs = qs.filter(delivery_fee__lte=max_fee)
        return qs.distinct()


class RestaurantDetailView(generics.RetrieveAPIView):
    queryset = Restaurant.objects.filter(status='approved')
    serializer_class = RestaurantDetailSerializer
    permission_classes = [permissions.AllowAny]


class RestaurantCreateView(generics.CreateAPIView):
    serializer_class = RestaurantCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class RestaurantManageView(generics.RetrieveUpdateAPIView):
    serializer_class = RestaurantCreateUpdateSerializer
    permission_classes = [IsRestaurantOwner]

    def get_object(self):
        return self.request.user.restaurant


# Menu item CRUD for restaurant owner
class MenuItemListCreateView(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsRestaurantOwner()]

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return MenuItem.objects.filter(restaurant_id=restaurant_id)

    def perform_create(self, serializer):
        restaurant = self.request.user.restaurant
        serializer.save(restaurant=restaurant)


class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsRestaurantOwner()]

    def get_queryset(self):
        return MenuItem.objects.filter(restaurant=self.request.user.restaurant)


@api_view(['POST', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def toggle_favourite(request, restaurant_id):
    try:
        restaurant = Restaurant.objects.get(pk=restaurant_id, status='approved')
    except Restaurant.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)

    fav, created = Favourite.objects.get_or_create(user=request.user, restaurant=restaurant)
    if not created:
        fav.delete()
        return Response({'is_favourite': False})
    return Response({'is_favourite': True}, status=201)


class FavouriteListView(generics.ListAPIView):
    serializer_class = RestaurantListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Restaurant.objects.filter(favourited_by__user=self.request.user)


class CuisineListView(generics.ListAPIView):
    queryset = Cuisine.objects.all()
    serializer_class = CuisineSerializer
    permission_classes = [permissions.AllowAny]