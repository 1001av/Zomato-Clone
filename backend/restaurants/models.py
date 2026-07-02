# restaurants/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User


class Cuisine(models.Model):
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to='cuisines/', null=True, blank=True)

    def __str__(self):
        return self.name


class Restaurant(models.Model):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    STATUS_CHOICES = [(PENDING, 'Pending'), (APPROVED, 'Approved'), (REJECTED, 'Rejected')]

    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='restaurant')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cuisines = models.ManyToManyField(Cuisine, related_name='restaurants', blank=True)
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    logo   = models.URLField(max_length=500, blank=True, null=True)
    banner = models.URLField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    is_open = models.BooleanField(default=True)
    opening_time = models.TimeField(default='09:00')
    closing_time = models.TimeField(default='22:00')
    delivery_time = models.PositiveIntegerField(default=30, help_text='Minutes')
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    min_order = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    avg_rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'restaurants'

    def __str__(self):
        return self.name


class Category(models.Model):
    """Menu categories within a restaurant (e.g. Starters, Main Course)"""
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'categories'
        ordering = ['order']
        verbose_name_plural = 'categories'

    def __str__(self):
        return f'{self.restaurant.name} — {self.name}'


class MenuItem(models.Model):
    VEG = 'veg'
    NON_VEG = 'non_veg'
    VEGAN = 'vegan'
    TYPE_CHOICES = [(VEG, 'Vegetarian'), (NON_VEG, 'Non-Vegetarian'), (VEGAN, 'Vegan')]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.URLField(max_length=500, blank=True, null=True)
    food_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=VEG)
    is_available = models.BooleanField(default=True)
    is_bestseller = models.BooleanField(default=False)
    calories = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'menu_items'

    def __str__(self):
        return f'{self.name} — ₹{self.price}'


class Favourite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favourites')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='favourited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favourites'
        unique_together = ('user', 'restaurant')