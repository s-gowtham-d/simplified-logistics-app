# Logistics Backend

Django REST API for Porter-style logistics application with interactive API documentation.

## 🚀 Quick Start

```bash
# Clone and setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure
cp .env.example .env  # Edit with your settings

# Setup database
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser

# Run server
python manage.py runserver
```

## 📚 API Documentation

**Interactive API Documentation is available at:**

- **Swagger UI**: http://127.0.0.1:8000/api/docs/

  - Interactive interface to test all endpoints
  - Try out API calls directly from browser
  - See request/response examples

- **ReDoc**: http://127.0.0.1:8000/api/redoc/

  - Clean, modern documentation layout
  - Better for reading and understanding APIs
  - Mobile-friendly

- **OpenAPI JSON**: http://127.0.0.1:8000/api/swagger.json

  - Raw OpenAPI 3.0 specification
  - Import into Postman, Insomnia, etc.

- **OpenAPI YAML**: http://127.0.0.1:8000/api/swagger.yaml
  - YAML format specification

### How to Use Swagger UI

1. **Open**: http://127.0.0.1:8000/api/docs/
2. **Register/Login**: Use `/api/auth/register/` or `/api/auth/login/`
3. **Authorize**: Click "Authorize" button (top right)
4. **Enter Token**: Format: `Bearer <your_access_token>`
5. **Test APIs**: Expand any endpoint → "Try it out" → Fill parameters → "Execute"

## ✨ Differentiated Features

### 1. Equipment Utilization Calculator

```
POST /api/vehicles/calculate_vehicle/
```

AI-powered vehicle recommendation based on item weight and dimensions.

### 2. Multiple Quote Options

```
POST /api/bookings/get_all_quotes/
```

Compare Fast, Economy, and Helper service options side-by-side.

### 3. Business Subscriptions with Analytics

```
GET /api/subscriptions/analytics/
```

Comprehensive business insights for subscription users.

### 4. Live Proof System

```
POST /api/proof/
```

Upload photos/videos at pickup and dropoff for transparency.

### 5. Green Fleet Option

Electric vehicles with 5% discount included in quotes.

## 🔗 Key API Endpoints

### Authentication

```
POST   /api/auth/register/           - Register new user
POST   /api/auth/login/              - Login user (get JWT)
GET    /api/auth/profile/            - Get user profile
POST   /api/auth/token/refresh/      - Refresh JWT token
```

### Vehicles

```
GET    /api/vehicles/                - List all vehicles
POST   /api/vehicles/calculate_vehicle/  - Get vehicle recommendation
GET    /api/vehicles/?type=mini_truck    - Filter by vehicle type
```

### Bookings

```
GET    /api/bookings/                - List user's bookings
POST   /api/bookings/                - Create new booking
POST   /api/bookings/get_quote/      - Get single quote
POST   /api/bookings/get_all_quotes/ - Get all quote options
POST   /api/bookings/{id}/cancel/    - Cancel booking
POST   /api/bookings/{id}/rate/      - Rate booking (1-5 stars)
```

### Proof Upload

```
POST   /api/proof/                   - Upload proof media
GET    /api/proof/by_booking/?booking_id=X  - Get proof for booking
```

### Payments

```
POST   /api/payments/initiate/       - Start payment
POST   /api/payments/verify/         - Verify payment
GET    /api/payments/by_booking/?booking_id=X  - Get payment details
```

### Tracking

```
GET    /api/tracking/live/?booking_id=X       - Live tracking
GET    /api/tracking/by_booking/?booking_id=X - Tracking history
POST   /api/tracking/update_location/         - Update driver location
```

### Subscriptions

```
GET    /api/plans/                   - List subscription plans
POST   /api/subscriptions/           - Subscribe to plan
GET    /api/subscriptions/active/    - Get active subscription
GET    /api/subscriptions/analytics/ - Business analytics (premium)
POST   /api/subscriptions/{id}/cancel/  - Cancel subscription
```

## 📖 Example Usage

### 1. Register & Login

```bash
# Register
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "phone_number": "9876543210",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "customer"
  }'

# Response includes JWT tokens
{
  "user": {...},
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 2. Get All Quote Options

```bash
curl -X POST http://127.0.0.1:8000/api/bookings/get_all_quotes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "vehicle_type": "mini_truck",
    "distance_km": 15,
    "is_green_fleet": true
  }'
```

### 3. Equipment Calculator

```bash
curl -X POST http://127.0.0.1:8000/api/vehicles/calculate_vehicle/ \
  -H "Content-Type: application/json" \
  -d '{
    "weight_kg": 500,
    "dimensions": "6x4x4",
    "item_description": "Furniture and appliances"
  }'
```

## 🛠 Tech Stack

- **Framework**: Django 5.x
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Documentation**: drf-yasg (Swagger/OpenAPI)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **File Upload**: Pillow
- **CORS**: django-cors-headers

## 📦 Dependencies

See `requirements.txt` for full list:

```
django
djangorestframework
django-cors-headers
pillow
psycopg2-binary
djangorestframework-simplejwt
python-decouple
python-dateutil
requests
drf-yasg
```

## 🧪 Testing

```bash
# Test with script
python test_api.py

# Or use Swagger UI
# Open: http://127.0.0.1:8000/api/docs/
```

## 🐳 Docker (Optional)

```dockerfile
# Coming soon
```
