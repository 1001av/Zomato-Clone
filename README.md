# FoodRush — Zomato Clone

Full-stack food delivery platform built with Django + React.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + Redux Toolkit
- **Backend**: Django + Django REST Framework + JWT
- **Database**: PostgreSQL (SQLite for local dev)
- **Payments**: Stripe (sandbox)
- **Cache/Queue**: Redis + Celery
- **Media**: Cloudinary

## Quick Start (Local Dev)

### 1. Clone & setup

```bash
git clone <repo-url>
cd zomato-clone
```

### 2. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # fill in your values
python manage.py migrate
python seed.py             # creates test users + sample data
python manage.py runserver
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env       # fill in your values
npm run dev
```

### 4. Redis (optional, for caching)
```bash
docker run -p 6379:6379 redis:7-alpine
```

## Test Credentials
| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@foodrush.com       | admin123    |
| Owner    | owner@foodrush.com       | owner123    |
| Customer | customer@foodrush.com    | customer123 |

## Stripe Test Card
- Card: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits

## API Documentation
Visit `http://localhost:8000/api/docs/` after starting the backend.

## Docker (Full Stack)
```bash
docker-compose up --build
```

## Environment Variables
See `.env.example` in both `backend/` and `frontend/` directories.
