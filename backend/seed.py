# backend/seed.py
# Run: python seed.py
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from restaurants.models import Restaurant, Category, MenuItem, Cuisine

print("Seeding database...")

# Admin
admin, _ = User.objects.get_or_create(email='admin@foodrush.com', defaults={
    'first_name': 'Admin', 'last_name': 'User', 'role': 'admin',
    'is_staff': True, 'is_superuser': True,
})
admin.set_password('admin123'); admin.save()
print(f"Admin: admin@foodrush.com / admin123")

# Owner
owner, _ = User.objects.get_or_create(email='owner@foodrush.com', defaults={
    'first_name': 'Restaurant', 'last_name': 'Owner', 'role': 'owner',
})
owner.set_password('owner123'); owner.save()
print(f"Owner: owner@foodrush.com / owner123")

# Customer
customer, _ = User.objects.get_or_create(email='customer@foodrush.com', defaults={
    'first_name': 'John', 'last_name': 'Doe', 'role': 'customer',
})
customer.set_password('customer123'); customer.save()
print(f"Customer: customer@foodrush.com / customer123")

# Cuisines
for name in ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Pizza', 'Burger', 'Sushi']:
    Cuisine.objects.get_or_create(name=name)

# Restaurant
indian, north = Cuisine.objects.get(name='Indian'), None
rest, _ = Restaurant.objects.get_or_create(owner=owner, defaults={
    'name': 'Spice Garden',
    'description': 'Authentic Indian cuisine with a modern twist.',
    'address': '123 MG Road', 'city': 'Bangalore', 'state': 'Karnataka', 'pincode': '560001',
    'phone': '9876543210', 'email': 'spicegarden@foodrush.com',
    'status': 'approved', 'is_open': True,
    'delivery_fee': 30, 'delivery_time': 35, 'min_order': 150,
})
rest.cuisines.add(Cuisine.objects.get(name='Indian'))

# Categories + Items
starters, _ = Category.objects.get_or_create(restaurant=rest, name='Starters', defaults={'order': 1})
mains, _ = Category.objects.get_or_create(restaurant=rest, name='Main Course', defaults={'order': 2})
drinks, _ = Category.objects.get_or_create(restaurant=rest, name='Drinks', defaults={'order': 3})

for item in [
    {'name': 'Paneer Tikka', 'price': 220, 'food_type': 'veg', 'category': starters, 'is_bestseller': True},
    {'name': 'Chicken Wings', 'price': 280, 'food_type': 'non_veg', 'category': starters},
    {'name': 'Butter Chicken', 'price': 320, 'food_type': 'non_veg', 'category': mains, 'is_bestseller': True},
    {'name': 'Dal Makhani', 'price': 180, 'food_type': 'veg', 'category': mains},
    {'name': 'Palak Paneer', 'price': 200, 'food_type': 'veg', 'category': mains},
    {'name': 'Naan', 'price': 40, 'food_type': 'veg', 'category': mains},
    {'name': 'Mango Lassi', 'price': 80, 'food_type': 'veg', 'category': drinks},
    {'name': 'Masala Chai', 'price': 40, 'food_type': 'veg', 'category': drinks},
]:
    MenuItem.objects.get_or_create(restaurant=rest, name=item['name'], defaults={
        'price': item['price'], 'food_type': item['food_type'],
        'category': item['category'], 'is_available': True,
        'is_bestseller': item.get('is_bestseller', False),
    })

print("Seed complete!")