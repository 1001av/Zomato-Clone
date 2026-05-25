# reviews/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('<int:restaurant_id>/',        views.ReviewListView.as_view(),   name='review-list'),
    path('<int:restaurant_id>/create/', views.ReviewCreateView.as_view(), name='review-create'),
]