import os
import django
import dj_database_url

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Override database to use Railway
railway_url = os.environ.get('RAILWAY_DATABASE_URL')
if not railway_url:
    print("❌ RAILWAY_DATABASE_URL not set!")
    exit()

from django.conf import settings
settings.DATABASES['default'] = dj_database_url.parse(railway_url)

django.setup()

from restaurants.models import Restaurant, MenuItem

# Restaurant image URLs from local database
restaurant_images = {
    'Burger Republic': {
        'logo':   'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903381/r6kmsneyjjl914gndbhk.jpg',
        'banner': 'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903382/udjctftub1byrt9vrbc6.jpg',
    },
    'Spice Garden': {
        'logo':   'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903372/hclo9zjjyorjofvlzsv8.jpg',
        'banner': 'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903374/vvoatbt0ug1jngnzzxoh.jpg',
    },
    'The Pasta House': {
        'logo':   'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903375/g80kogefqqhmthfumdld.jpg',
        'banner': 'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903377/pryhmab0eti8pjdb8ng9.jpg',
    },
    'Dragon Wok': {
        'logo':   'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903378/ssf6neevj5me2hw01g67.jpg',
        'banner': 'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903380/kilh3gxjhhqfbslsemgh.jpg',
    },
}

menu_images = {
    'Paneer Tikka':         'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903383/ma9bt31o4xqrw1q9iava.jpg',
    'Veg Seekh Kebab':      'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903384/ubakgjipvcpcbbiyvvuj.jpg',
    'Chicken Wings':        'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903385/ecxsu0gkifegmgmf8pny.jpg',
    'Butter Chicken':       'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903386/eiaif3tzzz0tewv62jir.jpg',
    'Dal Makhani':          'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903387/xp6xbc2mylrek8wadhsg.jpg',
    'Chicken Biryani':      'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903388/rwhaqzblpde8oaehse07.jpg',
    'Veg Biryani':          'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903389/goxu4vzjyuqslkkstm2s.jpg',
    'Garlic Naan':          'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903390/fuu4fqvpcvujgfoq6rfj.jpg',
    'Mango Lassi':          'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903391/suvm74zmqg3jognmqyhp.jpg',
    'Masala Chai':          'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903392/sst9tbn0x3pdtxztvqmi.jpg',
    'Spaghetti Carbonara':  'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903393/z1mrr7bohes62w9fqw1a.jpg',
    'Penne Arrabbiata':     'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903394/xqr9ucccubtpusaiqhd8.jpg',
    'Fettuccine Alfredo':   'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903396/t47fkpyldsikk7kj92dz.jpg',
    'Chicken Pesto Pasta':  'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903397/yseqfmztnmndw3sq5wjr.jpg',
    'Margherita Pizza':     'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903398/jr8lyhfgzw3nbii0dkej.jpg',
    'Pepperoni Pizza':      'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903399/ugcduiymsgbz2xjwxu0e.jpg',
    'BBQ Chicken Pizza':    'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903400/uzcm9aj61g7txwlg1fvj.jpg',
    'Garlic Bread':         'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903401/gqgxh0kye4bjfykvl5jy.jpg',
    'Tiramisu':             'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903402/fc4hbaxqrn2ck8flkx48.jpg',
    'Fresh Lemonade':       'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903403/pqbowk1c2n6b7qyrtwrb.jpg',
    'Hot & Sour Soup':      'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903404/gea8g0kidlcjoujvvkxm.jpg',
    'Chicken Sweet Corn':   'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903405/uxldmltwzkye0ddaprx8.jpg',
    'Kung Pao Chicken':     'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903406/g9qtnh1egltvwqhifany.jpg',
    'Veg Manchurian':       'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903407/hzppyqdpdrizanvmy0rd.jpg',
    'Schezwan Paneer':      'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903408/uogv9jyl1szrynvurfpq.jpg',
    'Chicken Fried Rice':   'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903409/p4suuqjfqynctai0fudg.jpg',
    'Veg Hakka Noodles':    'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903410/kjgclufpitbijs9glyqu.jpg',
    'Prawn Fried Rice':     'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903411/phqmh1a8roaorhzcpfqa.jpg',
    'Lychee Juice':         'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903412/cw7y1jwixfpzl0piolnd.jpg',
    'Classic Beef Burger':  'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903413/q7efgiktmeencaopceyg.jpg',
    'Crispy Chicken Burger':'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903415/kuual4pnzd9ejbsf9kzz.jpg',
    'Veggie Supreme':       'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903416/mnq90f2aehnyxwi3lpkx.jpg',
    'BBQ Bacon Burger':     'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903417/zcby9mpavfdie2hw0y3o.jpg',
    'Cheese Fries':         'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903418/kwjeyk5oyobnjivdzhwc.jpg',
    'Onion Rings':          'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903419/iofywadvyqty5d5ohdjv.jpg',
    'Chocolate Milkshake':  'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903420/o14avpwdv5sslohybz4p.jpg',
    'Classic Combo':        'https://res.cloudinary.com/xibm4xiy/image/upload/v1782903421/mkdalhnrmhnjrg5cwwb7.jpg',
}

print("Updating restaurant images in Railway database...")
for name, images in restaurant_images.items():
    try:
        r = Restaurant.objects.get(name=name)
        r.logo   = images['logo']
        r.banner = images['banner']
        r.save()
        print(f"✅ {name} updated")
    except Restaurant.DoesNotExist:
        print(f"⚠️ {name} not found in Railway database")

print("Updating menu item images in Railway database...")
for name, url in menu_images.items():
    try:
        items = MenuItem.objects.filter(name=name)
        items.update(image=url)
        print(f"✅ {name} updated")
    except Exception as e:
        print(f"⚠️ {name} failed: {e}")

print("🎉 Done! Railway database updated with Cloudinary URLs.")