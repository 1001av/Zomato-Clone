# core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from payments.views import stripe_webhook

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/',          include('users.urls')),
    path('api/v1/restaurants/',   include('restaurants.urls')),
    path('api/v1/orders/',        include('orders.urls')),
    path('api/v1/payments/',      include('payments.urls')),
    path('api/v1/reviews/',       include('reviews.urls')),

    # Stripe webhook (no auth, no CSRF)
    path('api/v1/payments/webhook/', stripe_webhook, name='stripe-webhook'),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)