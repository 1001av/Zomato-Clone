# payments/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('create-intent/',  views.create_payment_intent, name='create-intent'),
    path('confirm/',        views.confirm_payment,        name='confirm-payment'),
]