# reviews/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from restaurants.models import Restaurant
from orders.models import Order


class Review(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews')
    order = models.OneToOneField(
        Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='review'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    is_reported = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        unique_together = ('customer', 'restaurant')  # one review per customer per restaurant

    def __str__(self):
        return f'{self.customer.full_name} → {self.restaurant.name} ({self.rating}★)'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._update_restaurant_rating()

    def _update_restaurant_rating(self):
        """Recalculate restaurant's avg rating after every save/delete"""
        from django.db.models import Avg, Count
        agg = Review.objects.filter(
            restaurant=self.restaurant, is_visible=True
        ).aggregate(avg=Avg('rating'), count=Count('id'))
        self.restaurant.avg_rating = round(agg['avg'] or 0, 2)
        self.restaurant.total_reviews = agg['count']
        self.restaurant.save(update_fields=['avg_rating', 'total_reviews'])