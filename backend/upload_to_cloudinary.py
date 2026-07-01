import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import cloudinary
import cloudinary.uploader
from restaurants.models import Restaurant, MenuItem

cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
)

MEDIA_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media')

print("Uploading restaurant images...")
for r in Restaurant.objects.all():
    if r.logo:
        try:
            local_path = os.path.join(MEDIA_ROOT, str(r.logo))
            if os.path.exists(local_path):
                result = cloudinary.uploader.upload(local_path)
                r.logo = result['secure_url']
                r.save()
                print(f"✅ {r.name} logo uploaded")
            else:
                print(f"⚠️ {r.name} logo file not found at {local_path}")
        except Exception as e:
            print(f"⚠️ {r.name} logo failed: {e}")

    if r.banner:
        try:
            local_path = os.path.join(MEDIA_ROOT, str(r.banner))
            if os.path.exists(local_path):
                result = cloudinary.uploader.upload(local_path)
                r.banner = result['secure_url']
                r.save()
                print(f"✅ {r.name} banner uploaded")
            else:
                print(f"⚠️ {r.name} banner file not found at {local_path}")
        except Exception as e:
            print(f"⚠️ {r.name} banner failed: {e}")

print("Uploading menu item images...")
for item in MenuItem.objects.all():
    if item.image:
        try:
            local_path = os.path.join(MEDIA_ROOT, str(item.image))
            if os.path.exists(local_path):
                result = cloudinary.uploader.upload(local_path)
                item.image = result['secure_url']
                item.save()
                print(f"✅ {item.name} image uploaded")
            else:
                print(f"⚠️ {item.name} file not found at {local_path}")
        except Exception as e:
            print(f"⚠️ {item.name} failed: {e}")

print("🎉 Done! All images uploaded to Cloudinary.")