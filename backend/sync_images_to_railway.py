import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Get all image URLs from local database
from restaurants.models import Restaurant, MenuItem

local_data = {}
for r in Restaurant.objects.all():
    local_data[r.name] = {
        'logo': str(r.logo) if r.logo else None,
        'banner': str(r.banner) if r.banner else None,
    }

menu_data = {}
for item in MenuItem.objects.all():
    menu_data[item.name] = str(item.image) if item.image else None

print("Local Cloudinary URLs collected:")
for name, data in local_data.items():
    print(f"  {name}: logo={data['logo'][:50] if data['logo'] else None}")

# Now switch to Railway database and update
import dj_database_url
from django.db import connections

railway_url = os.environ.get('RAILWAY_DATABASE_URL')
if not railway_url:
    print("❌ RAILWAY_DATABASE_URL not set!")
    exit()

# Update restaurants
from django.db import connection
with connection.cursor() as cursor:
    for name, data in local_data.items():
        if data['logo']:
            cursor.execute(
                "UPDATE restaurants_restaurant SET logo=%s WHERE name=%s",
                [data['logo'], name]
            )
            print(f"✅ Updated {name} logo")
        if data['banner']:
            cursor.execute(
                "UPDATE restaurants_restaurant SET banner=%s WHERE name=%s",
                [data['banner'], name]
            )
            print(f"✅ Updated {name} banner")

    for name, url in menu_data.items():
        if url:
            cursor.execute(
                "UPDATE restaurants_menuitem SET image=%s WHERE name=%s",
                [url, name]
            )
            print(f"✅ Updated {name} image")

print("🎉 All Railway database images synced!")