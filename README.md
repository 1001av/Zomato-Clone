# 🍔 FoodRush — Full Stack Food Delivery Platform

A fully featured food delivery web application inspired by Zomato/Swiggy, built with Django REST Framework and React. Supports three user roles — customers, restaurant owners, and admins — with live Stripe payments, JWT authentication, and a complete order management flow.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, Redux Toolkit |
| Backend | Django 4.2, Django REST Framework |
| Authentication | JWT (djangorestframework-simplejwt) |
| Database | PostgreSQL (production), SQLite (local dev) |
| Payments | Stripe (PaymentIntents API) |
| File Storage | Local media (Cloudinary-ready) |
| API Docs | drf-spectacular (Swagger UI) |

---

## ✅ Features

### 👤 Authentication
- JWT-based login and registration
- Three roles: **Customer**, **Restaurant Owner**, **Admin**
- Protected routes per role
- Token refresh and blacklist on logout
- Profile management (name, phone, avatar)

### 🍽️ Restaurant Browsing
- Restaurant listing with search and filters
- Filter by cuisine type (Indian, Chinese, Italian, etc.)
- Veg / Non-veg toggle filter
- City picker in navbar
- Restaurant cards with logo, banner, rating, delivery time and fee
- Detailed restaurant page with:
  - Sticky category sidebar navigation
  - Menu items with inline quantity controls (+/-)
  - Search within menu items
  - Veg/Non-veg filter on menu
  - Image fallback placeholders
  - "Closed" overlay when restaurant is closed
  - Customer review form (authenticated users)

### 🛒 Cart & Checkout
- Add/remove items with quantity controls
- Cart sidebar with live total calculation
- Checkout with saved delivery address management
- Address create, edit and select flow
- Order summary before payment

### 💳 Payments (Stripe)
- Live Stripe PaymentIntents integration
- Stripe Elements UI (card, UPI, etc.)
- Payment success and failure handling
- Webhook support for server-side confirmation
- Test mode with test cards

### 📦 Order Management
- Order history for customers
- Order success page with live status tracker
- Status flow: Pending → Confirmed → Preparing → Out for Delivery → Delivered

### 🏪 Restaurant Owner Dashboard
- Overview stats: total orders, revenue, avg rating, active orders
- Revenue chart (last 7 days)
- **Manage Orders**: accept/reject/update order status with expandable order cards
- **Manage Menu**: add/edit/delete menu items and categories with image upload
- **Restaurant Settings**: edit all restaurant details, upload logo and banner
- Toggle restaurant open/closed from dashboard

### 🛠️ Admin Dashboard
- Approve or reject new restaurant listings
- View all restaurants with status filter (Pending / Approved / Rejected)
- Revoke or re-approve existing restaurants
- User stats (total owners and customers)

### 🌙 UI & UX
- Dark mode toggle (persisted)
- Fully responsive design (mobile, tablet, desktop)
- Skeleton loading states
- Toast notifications for all actions
- Clean ZestEats/Zomato-inspired UI

---

## 🗂️ Project Structure

```
Zomato-Clone/
├── backend/                  # Django backend
│   ├── core/                 # Settings, URLs, WSGI
│   ├── users/                # Auth, profiles, JWT
│   ├── restaurants/          # Restaurant, menu, categories
│   ├── orders/               # Order management
│   ├── payments/             # Stripe integration
│   ├── reviews/              # Customer reviews
│   ├── seed.py               # Database seeder
│   ├── Procfile              # Railway deployment
│   └── requirements.txt
└── frontend/                 # React frontend
    ├── src/
    │   ├── api/              # Axios instance
    │   ├── components/       # Navbar, Cart, Cards
    │   ├── features/         # Redux slices (auth, cart)
    │   ├── pages/            # All page components
    │   │   ├── admin/        # Admin dashboard
    │   │   ├── auth/         # Login, Register
    │   │   └── owner/        # Owner dashboard pages
    │   └── store/            # Redux store
    └── public/
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL
- Stripe CLI (for webhook testing)

### 1. Clone the repository
```bash
git clone https://github.com/1001av/Zomato-Clone.git
cd Zomato-Clone
```

### 2. Backend setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env         # then fill in your values

# Run migrations
python manage.py migrate

# Seed sample data
python seed.py

# Start server
python manage.py runserver
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Stripe webhook (for payment testing)
```bash
# Windows — run from the Stripe CLI folder
.\stripe.exe listen --forward-to localhost:8000/api/v1/payments/webhook/

# Copy the new webhook secret and update backend/.env
# STRIPE_WEBHOOK_SECRET=whsec_...
# Then restart Django
```

---

## 🔑 Environment Variables

### `backend/.env`
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
DB_NAME=foodrush
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 👥 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@foodrush.com | admin123 |
| Owner 1 | owner1@foodrush.com | owner123 |
| Owner 2 | owner2@foodrush.com | owner123 |
| Customer | customer@foodrush.com | customer123 |

---

## 💳 Stripe Test Cards

| Scenario | Card Number |
|----------|------------|
| ✅ Payment succeeds | 4242 4242 4242 4242 |
| ❌ Card declined | 4000 0000 0000 0002 |
| 🔐 Requires 3D auth | 4000 0025 0000 3155 |

Use any future expiry date, any 3-digit CVC, any 5-digit ZIP.

---

## 📡 API Documentation

After starting the backend, visit:
```
http://localhost:8000/api/docs/
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login/` | Login and get JWT tokens |
| POST | `/api/v1/auth/register/` | Register new user |
| GET | `/api/v1/restaurants/` | List all approved restaurants |
| GET | `/api/v1/restaurants/{id}/` | Restaurant detail with menu |
| GET | `/api/v1/restaurants/manage/` | Owner's restaurant (auth) |
| PATCH | `/api/v1/restaurants/manage/` | Update restaurant (owner) |
| POST | `/api/v1/restaurants/create/` | Create restaurant (owner) |
| GET | `/api/v1/orders/` | Customer order history |
| POST | `/api/v1/orders/` | Place new order |
| GET | `/api/v1/orders/restaurant-orders/` | Owner's incoming orders |
| PATCH | `/api/v1/orders/{id}/update-status/` | Update order status (owner) |
| POST | `/api/v1/payments/create-intent/` | Create Stripe PaymentIntent |
| POST | `/api/v1/payments/confirm/` | Confirm payment |
| POST | `/api/v1/payments/webhook/` | Stripe webhook handler |
| GET | `/api/v1/restaurants/admin/all/` | All restaurants (admin) |
| PATCH | `/api/v1/restaurants/{id}/approve/` | Approve/reject restaurant (admin) |

---

## 🌱 Seeded Sample Data

Running `python seed.py` creates:

**Restaurants:**
- 🌶️ Spice Garden — North Indian, Biryani
- 🍕 The Pasta House — Italian, Pizza
- 🥢 Dragon Wok — Chinese, Thai
- 🍔 Burger Republic — Burgers

Each restaurant has categories, menu items with images, and realistic data.

---

## 🚀 Deployment

- **Frontend** → [Vercel](https://vercel.com) (set root directory to `frontend`)
- **Backend** → [Railway](https://railway.app) (set root directory to `backend`, add PostgreSQL database)

Set environment variables in each platform's dashboard instead of using `.env` files.

---

## 📝 License

MIT License — feel free to use this project for learning and portfolio purposes.

---

Built with ❤️ by Akhil