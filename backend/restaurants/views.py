# restaurants/views.py
from rest_framework import generics, permissions, status, filters, parsers
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
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status='pending')
        
class RestaurantManageView(generics.RetrieveUpdateAPIView):
    serializer_class = RestaurantCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_object(self):
        try:
            return self.request.user.restaurant
        except Exception:
            from rest_framework.exceptions import NotFound
            raise NotFound('No restaurant found for this owner.')

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception:
            return Response(None, status=200)


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

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])

def admin_restaurant_list(request):
    if request.user.role != 'admin':
        return Response({'detail': 'Forbidden.'}, status=403)
    qs = Restaurant.objects.all().select_related('owner').order_by('-created_at')
    data = []
    for r in qs:
        data.append({
            'id':         r.id,
            'name':       r.name,
            'city':       r.city,
            'status':     r.status,
            'logo':       request.build_absolute_uri(r.logo.url) if r.logo else None,
            'owner_name': f"{r.owner.first_name} {r.owner.last_name}" if r.owner else '',
            'avg_rating': r.avg_rating,
            'created_at': r.created_at,
        })
    return Response(data)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])

def approve_restaurant(request, pk):
    if request.user.role != 'admin':
        return Response({'detail': 'Forbidden.'}, status=403)
    try:
        restaurant = Restaurant.objects.get(pk=pk)
    except Restaurant.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)
    new_status = request.data.get('status')
    if new_status not in ['approved', 'rejected']:
        return Response({'detail': 'Invalid status.'}, status=400)
    restaurant.status = new_status
    restaurant.save()
    return Response({'id': restaurant.id, 'status': restaurant.status})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def category_create(request, restaurant_id):
    try:
        restaurant = Restaurant.objects.get(pk=restaurant_id, owner=request.user)
    except Restaurant.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)
    from .models import Category
    from .serializers import CategorySerializer
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(restaurant=restaurant)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def category_delete(request, pk):
    from .models import Category
    try:
        cat = Category.objects.get(pk=pk, restaurant__owner=request.user)
    except Category.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)
    cat.delete()
    return Response(status=204)