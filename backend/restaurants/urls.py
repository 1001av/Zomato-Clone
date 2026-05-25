# restaurants/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('',                          views.RestaurantListView.as_view(),       name='restaurant-list'),
    path('cuisines/',                 views.CuisineListView.as_view(),           name='cuisine-list'),
    path('create/',                   views.RestaurantCreateView.as_view(),      name='restaurant-create'),
    path('manage/',                   views.RestaurantManageView.as_view(),      name='restaurant-manage'),
    path('favourites/',               views.FavouriteListView.as_view(),         name='favourites'),
    path('<int:pk>/',                 views.RestaurantDetailView.as_view(),      name='restaurant-detail'),
    path('<int:pk>/favourite/',       views.toggle_favourite,                    name='toggle-favourite'),
    path('<int:restaurant_id>/menu/', views.MenuItemListCreateView.as_view(),    name='menu-list'),
    path('menu/<int:pk>/',            views.MenuItemDetailView.as_view(),        name='menu-detail'),
]
