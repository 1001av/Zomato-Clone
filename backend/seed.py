# backend/seed.py
import os
import django
import sys
import requests
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def fetch_image(url, filename):
    """Download image from URL and return a Django ContentFile, or None on failure."""
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        return ContentFile(resp.content, name=filename)
    except Exception as e:
        print(f"  ⚠️  Could not fetch image {filename}: {e}")
        return None

from django.utils import timezone
from users.models import User, Address
from restaurants.models import Restaurant, Category, MenuItem, Cuisine
from reviews.models import Review

print("🌱 Starting seed...")

# ── Users ──────────────────────────────────────────────────────
admin, _ = User.objects.get_or_create(email='admin@foodrush.com', defaults={
    'first_name': 'Admin', 'last_name': 'User',
    'role': 'admin', 'is_staff': True, 'is_superuser': True,
})
admin.set_password('admin123')
admin.save()
print("✅ Admin: admin@foodrush.com / admin123")

owner1, _ = User.objects.get_or_create(email='owner1@foodrush.com', defaults={
    'first_name': 'Rahul', 'last_name': 'Sharma', 'role': 'owner', 'phone': '9876543210',
})
owner1.set_password('owner123')
owner1.save()

owner2, _ = User.objects.get_or_create(email='owner2@foodrush.com', defaults={
    'first_name': 'Priya', 'last_name': 'Patel', 'role': 'owner', 'phone': '9876543211',
})
owner2.set_password('owner123')
owner2.save()

owner3, _ = User.objects.get_or_create(email='owner3@foodrush.com', defaults={
    'first_name': 'Chen', 'last_name': 'Wei', 'role': 'owner', 'phone': '9876543212',
})
owner3.set_password('owner123')
owner3.save()

print("✅ Owners: owner1@foodrush.com, owner2@foodrush.com, owner3@foodrush.com / owner123")

customer, _ = User.objects.get_or_create(email='customer@foodrush.com', defaults={
    'first_name': 'John', 'last_name': 'Doe', 'role': 'customer', 'phone': '9123456789',
})
customer.set_password('customer123')
customer.save()
print("✅ Customer: customer@foodrush.com / customer123")

# ── Address for customer ────────────────────────────────────────
Address.objects.get_or_create(user=customer, label='Home', defaults={
    'street': '42 MG Road', 'city': 'Bangalore',
    'state': 'Karnataka', 'pincode': '560001', 'is_default': True,
})
Address.objects.get_or_create(user=customer, label='Work', defaults={
    'street': '100 Whitefield Main Road', 'city': 'Bangalore',
    'state': 'Karnataka', 'pincode': '560066', 'is_default': False,
})

# ── Cuisines ────────────────────────────────────────────────────
cuisine_names = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai',
                 'Pizza', 'Burger', 'Sushi', 'Biryani', 'North Indian']
cuisines = {}
for name in cuisine_names:
    c, _ = Cuisine.objects.get_or_create(name=name)
    cuisines[name] = c
print(f"✅ {len(cuisines)} cuisines created")

# ── Restaurant 1: Spice Garden ──────────────────────────────────

r1, created = Restaurant.objects.get_or_create(owner=owner1, defaults={
    'name': 'Spice Garden',
    'description': 'Authentic North Indian cuisine with rich gravies and tandoor specialties. Family recipes passed down for generations.',
    'address': '123 MG Road, Brigade Road',
    'city': 'Bangalore', 'state': 'Karnataka', 'pincode': '560001',
    'phone': '080-41234567', 'email': 'spicegarden@foodrush.com',
    'status': 'approved', 'is_open': True,
    'opening_time': '09:00', 'closing_time': '23:00',
    'delivery_fee': 30, 'delivery_time': 35, 'min_order': 150,
    'avg_rating': 4.3, 'total_reviews': 128,
})
r1.cuisines.set([cuisines['Indian'], cuisines['North Indian'], cuisines['Biryani']])
if not r1.logo:
    img = fetch_image('https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80', 'spice_garden_logo.jpg')
    if img: r1.logo.save('spice_garden_logo.jpg', img, save=False)
if not r1.banner:
    img = fetch_image('https://images.unsplash.com/photo-1567337710282-00832b415979?w=1200&q=80', 'spice_garden_banner.jpg')
    if img: r1.banner.save('spice_garden_banner.jpg', img, save=False)
r1.save()

# Categories
s1_starters, _ = Category.objects.get_or_create(restaurant=r1, name='Starters',       defaults={'order': 1})
s1_mains,    _ = Category.objects.get_or_create(restaurant=r1, name='Main Course',    defaults={'order': 2})
s1_breads,   _ = Category.objects.get_or_create(restaurant=r1, name='Breads',         defaults={'order': 3})
s1_rice,     _ = Category.objects.get_or_create(restaurant=r1, name='Rice & Biryani', defaults={'order': 4})
s1_drinks,   _ = Category.objects.get_or_create(restaurant=r1, name='Drinks',         defaults={'order': 5})

# Menu items
spice_items = [
    {'name': 'Paneer Tikka',    'price': 220, 'type': 'veg',     'cat': s1_starters, 'best': True,  'cal': 280, 'desc': 'Grilled cottage cheese with bell peppers and spices',        'img': ('https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', 'paneer_tikka.jpg')},
    {'name': 'Veg Seekh Kebab', 'price': 180, 'type': 'veg',     'cat': s1_starters, 'best': False, 'cal': 210, 'desc': 'Spiced vegetable kebabs grilled in tandoor',                 'img': ('https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', 'veg_seekh_kebab.jpg')},
    {'name': 'Chicken Wings',   'price': 280, 'type': 'non_veg', 'cat': s1_starters, 'best': False, 'cal': 340, 'desc': 'Crispy wings tossed in our secret spice blend',              'img': ('https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=80', 'chicken_wings.jpg')},
    {'name': 'Butter Chicken',  'price': 320, 'type': 'non_veg', 'cat': s1_mains,    'best': True,  'cal': 420, 'desc': 'Tender chicken in rich tomato-butter gravy',                 'img': ('https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', 'butter_chicken.jpg')},
    {'name': 'Dal Makhani',     'price': 180, 'type': 'veg',     'cat': s1_mains,    'best': True,  'cal': 310, 'desc': 'Slow-cooked black lentils with cream and butter',             'img': ('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80', 'dal_makhani.jpg')},
    {'name': 'Palak Paneer',    'price': 200, 'type': 'veg',     'cat': s1_mains,    'best': False, 'cal': 290, 'desc': 'Fresh cottage cheese in smooth spinach gravy',               'img': ('https://images.unsplash.com/photo-1645177628172-a94c1f96debb?w=400&q=80', 'palak_paneer.jpg')},
    {'name': 'Chicken Biryani', 'price': 280, 'type': 'non_veg', 'cat': s1_rice,     'best': True,  'cal': 580, 'desc': 'Fragrant basmati rice with spiced chicken',                  'img': ('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', 'chicken_biryani.jpg')},
    {'name': 'Veg Biryani',     'price': 220, 'type': 'veg',     'cat': s1_rice,     'best': False, 'cal': 490, 'desc': 'Aromatic rice with fresh vegetables and saffron',             'img': ('https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&q=80', 'veg_biryani.jpg')},
    {'name': 'Butter Naan',     'price': 40,  'type': 'veg',     'cat': s1_breads,   'best': False, 'cal': 150, 'desc': 'Soft leavened bread baked in tandoor with butter',            'img': ('https://images.unsplash.com/photo-1586456248323-3b4f673b69c5?w=400&q=80', 'butter_naan.jpg')},
    {'name': 'Garlic Naan',     'price': 50,  'type': 'veg',     'cat': s1_breads,   'best': True,  'cal': 160, 'desc': 'Naan topped with fresh garlic and coriander',                 'img': ('https://images.unsplash.com/photo-1617692855027-33b14f061079?w=400&q=80', 'garlic_naan.jpg')},
    {'name': 'Mango Lassi',     'price': 80,  'type': 'veg',     'cat': s1_drinks,   'best': True,  'cal': 180, 'desc': 'Chilled yogurt drink blended with fresh mango',               'img': ('https://images.unsplash.com/photo-1527549993586-dff825b37782?w=400&q=80', 'mango_lassi.jpg')},
    {'name': 'Masala Chai',     'price': 40,  'type': 'veg',     'cat': s1_drinks,   'best': False, 'cal': 60,  'desc': 'Spiced Indian tea with ginger and cardamom',                  'img': ('https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', 'masala_chai.jpg')},
]
for item in spice_items:
    obj, _ = MenuItem.objects.get_or_create(restaurant=r1, name=item['name'], defaults={
        'price': item['price'], 'food_type': item['type'],
        'category': item['cat'], 'is_available': True,
        'is_bestseller': item['best'], 'calories': item['cal'],
        'description': item['desc'],
    })
    if not obj.image and item.get('img'):
        img = fetch_image(item['img'][0], item['img'][1])
        if img: obj.image.save(item['img'][1], img, save=True)

# ── Restaurant 2: The Pasta House ──────────────────────────────
r2, _ = Restaurant.objects.get_or_create(owner=owner2, defaults={
    'name': 'The Pasta House',
    'description': 'Authentic Italian pasta and wood-fired pizzas made with imported ingredients.',
    'address': '45 Indiranagar 100ft Road',
    'city': 'Bangalore', 'state': 'Karnataka', 'pincode': '560038',
    'phone': '080-41234568', 'email': 'pastahouse@foodrush.com',
    'status': 'approved', 'is_open': True,
    'opening_time': '11:00', 'closing_time': '23:30',
    'delivery_fee': 40, 'delivery_time': 25, 'min_order': 200,
    'avg_rating': 4.5, 'total_reviews': 89,
})
r2.cuisines.set([cuisines['Italian'], cuisines['Pizza']])
if not r2.logo:
    img = fetch_image('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', 'pasta_house_logo.jpg')
    if img: r2.logo.save('pasta_house_logo.jpg', img, save=False)
if not r2.banner:
    img = fetch_image('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80', 'pasta_house_banner.jpg')
    if img: r2.banner.save('pasta_house_banner.jpg', img, save=False)
r2.save()

p2_pasta,  _ = Category.objects.get_or_create(restaurant=r2, name='Pasta',     defaults={'order': 1})
p2_pizza,  _ = Category.objects.get_or_create(restaurant=r2, name='Pizza',     defaults={'order': 2})
p2_sides,  _ = Category.objects.get_or_create(restaurant=r2, name='Sides',     defaults={'order': 3})
p2_drinks, _ = Category.objects.get_or_create(restaurant=r2, name='Beverages', defaults={'order': 4})

pasta_items = [
    {'name': 'Spaghetti Carbonara', 'price': 320, 'type': 'non_veg', 'cat': p2_pasta,  'best': True,  'cal': 520, 'desc': 'Classic Roman pasta with eggs, pancetta and pecorino', 'img': ('https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80', 'spaghetti_carbonara.jpg')},
    {'name': 'Penne Arrabbiata',    'price': 260, 'type': 'veg',     'cat': p2_pasta,  'best': False, 'cal': 410, 'desc': 'Spicy tomato sauce with garlic and red chillies',       'img': ('https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80', 'penne_arrabbiata.jpg')},
    {'name': 'Fettuccine Alfredo',  'price': 300, 'type': 'veg',     'cat': p2_pasta,  'best': True,  'cal': 580, 'desc': 'Rich creamy white sauce with parmesan',                 'img': ('https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&q=80', 'fettuccine_alfredo.jpg')},
    {'name': 'Chicken Pesto Pasta', 'price': 340, 'type': 'non_veg', 'cat': p2_pasta,  'best': False, 'cal': 490, 'desc': 'Grilled chicken with fresh basil pesto',                'img': ('https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80', 'chicken_pesto.jpg')},
    {'name': 'Margherita Pizza',    'price': 280, 'type': 'veg',     'cat': p2_pizza,  'best': True,  'cal': 680, 'desc': 'Classic tomato, mozzarella and fresh basil',            'img': ('https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', 'margherita_pizza.jpg')},
    {'name': 'Pepperoni Pizza',     'price': 360, 'type': 'non_veg', 'cat': p2_pizza,  'best': True,  'cal': 820, 'desc': 'Loaded with premium pepperoni and cheese',               'img': ('https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', 'pepperoni_pizza.jpg')},
    {'name': 'BBQ Chicken Pizza',   'price': 380, 'type': 'non_veg', 'cat': p2_pizza,  'best': False, 'cal': 790, 'desc': 'Smoky BBQ sauce with grilled chicken',                   'img': ('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', 'bbq_chicken_pizza.jpg')},
    {'name': 'Garlic Bread',        'price': 120, 'type': 'veg',     'cat': p2_sides,  'best': False, 'cal': 280, 'desc': 'Toasted bread with herb butter and garlic',              'img': ('https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&q=80', 'garlic_bread.jpg')},
    {'name': 'Tiramisu',            'price': 180, 'type': 'veg',     'cat': p2_sides,  'best': True,  'cal': 350, 'desc': 'Classic Italian dessert with mascarpone',                'img': ('https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', 'tiramisu.jpg')},
    {'name': 'Sparkling Water',     'price': 80,  'type': 'veg',     'cat': p2_drinks, 'best': False, 'cal': 0,   'desc': 'Chilled sparkling mineral water',                        'img': None},
    {'name': 'Fresh Lemonade',      'price': 120, 'type': 'veg',     'cat': p2_drinks, 'best': True,  'cal': 90,  'desc': 'Freshly squeezed lemon with mint',                       'img': ('https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80', 'fresh_lemonade.jpg')},
]
for item in pasta_items:
    obj, _ = MenuItem.objects.get_or_create(restaurant=r2, name=item['name'], defaults={
        'price': item['price'], 'food_type': item['type'],
        'category': item['cat'], 'is_available': True,
        'is_bestseller': item['best'], 'calories': item['cal'],
        'description': item['desc'],
    })
    if not obj.image and item.get('img'):
        img = fetch_image(item['img'][0], item['img'][1])
        if img: obj.image.save(item['img'][1], img, save=True)

# ── Restaurant 3: Dragon Wok ────────────────────────────────────
r3, _ = Restaurant.objects.get_or_create(owner=owner3, defaults={
    'name': 'Dragon Wok',
    'description': 'Authentic Chinese cuisine with traditional recipes and fresh ingredients.',
    'address': '78 Koramangala 5th Block',
    'city': 'Bangalore', 'state': 'Karnataka', 'pincode': '560095',
    'phone': '080-41234569', 'email': 'dragonwok@foodrush.com',
    'status': 'approved', 'is_open': True,
    'opening_time': '11:30', 'closing_time': '22:30',
    'delivery_fee': 25, 'delivery_time': 40, 'min_order': 180,
    'avg_rating': 4.1, 'total_reviews': 67,
})
r3.cuisines.set([cuisines['Chinese'], cuisines['Thai']])
if not r3.logo:
    img = fetch_image('https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', 'dragon_wok_logo.jpg')
    if img: r3.logo.save('dragon_wok_logo.jpg', img, save=False)
if not r3.banner:
    img = fetch_image('https://images.unsplash.com/photo-1552611052-33e04de081de?w=1200&q=80', 'dragon_wok_banner.jpg')
    if img: r3.banner.save('dragon_wok_banner.jpg', img, save=False)
r3.save()

d3_soups,  _ = Category.objects.get_or_create(restaurant=r3, name='Soups',          defaults={'order': 1})
d3_mains,  _ = Category.objects.get_or_create(restaurant=r3, name='Main Course',    defaults={'order': 2})
d3_rice,   _ = Category.objects.get_or_create(restaurant=r3, name='Rice & Noodles', defaults={'order': 3})
d3_drinks, _ = Category.objects.get_or_create(restaurant=r3, name='Drinks',         defaults={'order': 4})

dragon_items = [
    {'name': 'Hot & Sour Soup',    'price': 120, 'type': 'veg',     'cat': d3_soups,  'best': True,  'cal': 90,  'desc': 'Spicy tangy soup with vegetables and tofu',            'img': ('https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80', 'hot_sour_soup.jpg')},
    {'name': 'Chicken Sweet Corn', 'price': 140, 'type': 'non_veg', 'cat': d3_soups,  'best': False, 'cal': 130, 'desc': 'Creamy corn soup with shredded chicken',                'img': ('https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&q=80', 'sweet_corn_soup.jpg')},
    {'name': 'Kung Pao Chicken',   'price': 280, 'type': 'non_veg', 'cat': d3_mains,  'best': True,  'cal': 380, 'desc': 'Spicy stir-fry with peanuts and vegetables',            'img': ('https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=80', 'kung_pao_chicken.jpg')},
    {'name': 'Veg Manchurian',     'price': 200, 'type': 'veg',     'cat': d3_mains,  'best': True,  'cal': 280, 'desc': 'Crispy vegetable balls in tangy Manchurian sauce',      'img': ('https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', 'veg_manchurian.jpg')},
    {'name': 'Schezwan Paneer',    'price': 240, 'type': 'veg',     'cat': d3_mains,  'best': False, 'cal': 320, 'desc': 'Cottage cheese in fiery Schezwan sauce',                'img': ('https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', 'schezwan_paneer.jpg')},
    {'name': 'Chicken Fried Rice', 'price': 220, 'type': 'non_veg', 'cat': d3_rice,   'best': True,  'cal': 480, 'desc': 'Wok-tossed rice with chicken and vegetables',           'img': ('https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', 'chicken_fried_rice.jpg')},
    {'name': 'Veg Hakka Noodles',  'price': 180, 'type': 'veg',     'cat': d3_rice,   'best': False, 'cal': 390, 'desc': 'Stir-fried noodles with fresh vegetables',              'img': ('https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80', 'hakka_noodles.jpg')},
    {'name': 'Prawn Fried Rice',   'price': 280, 'type': 'non_veg', 'cat': d3_rice,   'best': True,  'cal': 520, 'desc': 'Fragrant rice with fresh prawns and egg',               'img': ('https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', 'prawn_fried_rice.jpg')},
    {'name': 'Green Tea',          'price': 80,  'type': 'veg',     'cat': d3_drinks, 'best': False, 'cal': 5,   'desc': 'Premium Chinese green tea',                             'img': None},
    {'name': 'Lychee Juice',       'price': 100, 'type': 'veg',     'cat': d3_drinks, 'best': True,  'cal': 110, 'desc': 'Fresh lychee juice served chilled',                     'img': ('https://images.unsplash.com/photo-1527549993586-dff825b37782?w=400&q=80', 'lychee_juice.jpg')},
]
for item in dragon_items:
    obj, _ = MenuItem.objects.get_or_create(restaurant=r3, name=item['name'], defaults={
        'price': item['price'], 'food_type': item['type'],
        'category': item['cat'], 'is_available': True,
        'is_bestseller': item['best'], 'calories': item['cal'],
        'description': item['desc'],
    })
    if not obj.image and item.get('img'):
        img = fetch_image(item['img'][0], item['img'][1])
        if img: obj.image.save(item['img'][1], img, save=True)

# ── Restaurant 4: Burger Republic ──────────────────────────────
owner4, _ = User.objects.get_or_create(email='owner4@foodrush.com', defaults={
    'first_name': 'Mike', 'last_name': 'Johnson', 'role': 'owner',
})
owner4.set_password('owner123')
owner4.save()

r4, _ = Restaurant.objects.get_or_create(owner=owner4, defaults={
    'name': 'Burger Republic',
    'description': 'Gourmet burgers made with 100% fresh beef patties and house-made sauces.',
    'address': '22 HSR Layout Sector 4',
    'city': 'Bangalore', 'state': 'Karnataka', 'pincode': '560102',
    'phone': '080-41234570', 'email': 'burgerrepublic@foodrush.com',
    'status': 'approved', 'is_open': True,
    'opening_time': '10:00', 'closing_time': '23:00',
    'delivery_fee': 0, 'delivery_time': 20, 'min_order': 150,
    'avg_rating': 4.4, 'total_reviews': 203,
})
r4.cuisines.set([cuisines['Burger']])
if not r4.logo:
    img = fetch_image('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', 'burger_republic_logo.jpg')
    if img: r4.logo.save('burger_republic_logo.jpg', img, save=False)
if not r4.banner:
    img = fetch_image('https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80', 'burger_republic_banner.jpg')
    if img: r4.banner.save('burger_republic_banner.jpg', img, save=False)
r4.save()

b4_burgers, _ = Category.objects.get_or_create(restaurant=r4, name='Burgers', defaults={'order': 1})
b4_sides,   _ = Category.objects.get_or_create(restaurant=r4, name='Sides',   defaults={'order': 2})
b4_drinks,  _ = Category.objects.get_or_create(restaurant=r4, name='Drinks',  defaults={'order': 3})
b4_combos,  _ = Category.objects.get_or_create(restaurant=r4, name='Combos',  defaults={'order': 4})

burger_items = [
    {'name': 'Classic Beef Burger',   'price': 220, 'type': 'non_veg', 'cat': b4_burgers, 'best': True,  'cal': 580, 'desc': 'Juicy beef patty with lettuce, tomato and special sauce', 'img': ('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', 'classic_beef_burger.jpg')},
    {'name': 'Crispy Chicken Burger', 'price': 200, 'type': 'non_veg', 'cat': b4_burgers, 'best': True,  'cal': 520, 'desc': 'Crispy fried chicken with coleslaw and mayo',              'img': ('https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80', 'crispy_chicken_burger.jpg')},
    {'name': 'Veggie Supreme',        'price': 160, 'type': 'veg',     'cat': b4_burgers, 'best': False, 'cal': 420, 'desc': 'Grilled veggie patty with avocado and greens',             'img': ('https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80', 'veggie_supreme.jpg')},
    {'name': 'BBQ Bacon Burger',      'price': 280, 'type': 'non_veg', 'cat': b4_burgers, 'best': True,  'cal': 720, 'desc': 'Double patty with bacon, BBQ sauce and cheese',            'img': ('https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', 'bbq_bacon_burger.jpg')},
    {'name': 'Cheese Fries',          'price': 120, 'type': 'veg',     'cat': b4_sides,   'best': True,  'cal': 350, 'desc': 'Crispy fries loaded with melted cheddar',                  'img': ('https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', 'cheese_fries.jpg')},
    {'name': 'Onion Rings',           'price': 100, 'type': 'veg',     'cat': b4_sides,   'best': False, 'cal': 280, 'desc': 'Beer-battered crispy onion rings',                         'img': ('https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80', 'onion_rings.jpg')},
    {'name': 'Coleslaw',              'price': 60,  'type': 'veg',     'cat': b4_sides,   'best': False, 'cal': 120, 'desc': 'Creamy homemade coleslaw',                                 'img': None},
    {'name': 'Chocolate Milkshake',   'price': 150, 'type': 'veg',     'cat': b4_drinks,  'best': True,  'cal': 420, 'desc': 'Thick creamy chocolate shake',                             'img': ('https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', 'chocolate_milkshake.jpg')},
    {'name': 'Classic Combo',         'price': 320, 'type': 'non_veg', 'cat': b4_combos,  'best': True,  'cal': 920, 'desc': 'Beef burger + fries + drink — best value!',               'img': ('https://images.unsplash.com/photo-1561758033-7e924f619b47?w=400&q=80', 'classic_combo.jpg')},
    {'name': 'Veg Combo',             'price': 260, 'type': 'veg',     'cat': b4_combos,  'best': False, 'cal': 740, 'desc': 'Veggie burger + onion rings + lemonade',                   'img': None},
]
for item in burger_items:
    obj, _ = MenuItem.objects.get_or_create(restaurant=r4, name=item['name'], defaults={
        'price': item['price'], 'food_type': item['type'],
        'category': item['cat'], 'is_available': True,
        'is_bestseller': item['best'], 'calories': item['cal'],
        'description': item['desc'],
    })
    if not obj.image and item.get('img'):
        img = fetch_image(item['img'][0], item['img'][1])
        if img: obj.image.save(item['img'][1], img, save=True)

# ── Sample Reviews ──────────────────────────────────────────────
review_data = [
    {'restaurant': r1, 'rating': 5, 'comment': 'Best butter chicken in Bangalore! The dal makhani is to die for.'},
    {'restaurant': r1, 'rating': 4, 'comment': 'Great food, fast delivery. Garlic naan was perfect.'},
    {'restaurant': r2, 'rating': 5, 'comment': 'Authentic Italian taste. The carbonara was incredible!'},
    {'restaurant': r2, 'rating': 4, 'comment': 'Lovely ambiance and great pasta. Will order again.'},
    {'restaurant': r3, 'rating': 4, 'comment': 'Kung Pao chicken was spicy and delicious!'},
    {'restaurant': r4, 'rating': 5, 'comment': 'Best burgers in the city, hands down. Free delivery is a bonus!'},
]

customer2, _ = User.objects.get_or_create(email='reviewer@foodrush.com', defaults={
    'first_name': 'Sara', 'last_name': 'Khan', 'role': 'customer',
})
customer2.set_password('customer123')
customer2.save()

for i, rev in enumerate(review_data):
    reviewer = customer if i % 2 == 0 else customer2
    Review.objects.get_or_create(
        customer=reviewer,
        restaurant=rev['restaurant'],
        defaults={'rating': rev['rating'], 'comment': rev['comment']},
    )

print("✅ Reviews added")
print()
print("=" * 50)
print("🎉 Seed complete! Test accounts:")
print("=" * 50)
print("Admin:    admin@foodrush.com     / admin123")
print("Owner 1:  owner1@foodrush.com    / owner123")
print("Owner 2:  owner2@foodrush.com    / owner123")
print("Owner 3:  owner3@foodrush.com    / owner123")
print("Owner 4:  owner4@foodrush.com    / owner123")
print("Customer: customer@foodrush.com  / customer123")
print("=" * 50)
print(f"Restaurants: {Restaurant.objects.count()}")
print(f"Menu items:  {MenuItem.objects.count()}")
print(f"Reviews:     {Review.objects.count()}")