# orders/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('',                       views.PlaceOrderView.as_view(),          name='place-order'),
    path('my-orders/',             views.CustomerOrderListView.as_view(),    name='my-orders'),
    path('restaurant-orders/',     views.RestaurantOrderListView.as_view(),  name='restaurant-orders'),
    path('<uuid:pk>/',             views.OrderDetailView.as_view(),          name='order-detail'),
    path('<uuid:pk>/cancel/',      views.cancel_order,                       name='cancel-order'),
    path('<uuid:pk>/update-status/', views.update_order_status,              name='update-order-status'),
]
