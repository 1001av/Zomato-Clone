# restaurants/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('',                          views.RestaurantListView.as_view(),       name='restaurant-list'),
    path('cuisines/',                 views.CuisineListView.as_view(),           name='cuisine-list'),
    path('create/',                   views.RestaurantCreateView.as_view(),      name='restaurant-create'),
    path('manage/',                   views.RestaurantManageView.as_view(),      name='restaurant-manage'),
    path('favourites/',               views.FavouriteListView.as_view(),         name='favourites'),
    path('admin/all/',                views.admin_restaurant_list,               name='restaurant-admin-list'),
    path('<int:pk>/',                 views.RestaurantDetailView.as_view(),      name='restaurant-detail'),
    path('<int:pk>/approve/',         views.approve_restaurant,                  name='restaurant-approve'),
    path('<int:pk>/favourite/',       views.toggle_favourite,                    name='toggle-favourite'),
    path('<int:restaurant_id>/menu/', views.MenuItemListCreateView.as_view(),    name='menu-list'),
    path('menu/<int:pk>/',            views.MenuItemDetailView.as_view(),        name='menu-detail'),
    path('<int:restaurant_id>/categories/',  views.category_create,              name='category-create'),
    path('categories/<int:pk>/',      views.category_delete,                     name='category-delete'),
]