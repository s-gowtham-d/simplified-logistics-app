"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Logistics API",
        default_version='v1',
        description="""
# Logistics API Documentation

A comprehensive logistics and delivery management system API.

## Features
- 🚚 **Vehicle Management**: Multiple vehicle types (bike, mini truck, truck, tempo)
- 📦 **Smart Booking**: Get quotes, create bookings, track deliveries
- 💰 **Flexible Pricing**: Fast, Economy, and Helper service options
- 🌱 **Green Fleet**: Electric vehicle options with discounts
- 📸 **Proof System**: Upload pickup/dropoff photos and videos
- 💳 **Payments**: Multiple payment methods (cash, card, UPI, wallet)
- 📊 **Business Subscriptions**: Monthly, Quarterly, and Yearly plans with analytics
- 📍 **Real-time Tracking**: Live location updates and ETA
- 🧮 **Utilization Calculator**: AI-powered vehicle recommendation

## Authentication
This API uses JWT (JSON Web Tokens) for authentication.

### How to authenticate:
1. Register: `POST /api/auth/register/`
2. Login: `POST /api/auth/login/` (returns access & refresh tokens)
3. Use access token in header: `Authorization: Bearer <your_token>`
4. Refresh token when expired: `POST /api/auth/token/refresh/`

## Rate Limiting
- 100 requests per hour for authenticated users
- 20 requests per hour for anonymous users

## Response Format
All responses follow this structure:
```json
{
    "data": {...},
    "message": "Success message",
    "error": "Error message (if any)"
}
```

## Error Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
        """,
        # terms_of_service="",
        contact=openapi.Contact(email="gowthamselvam809@gmail.com"),
        license=openapi.License(name="GNU License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/swagger.yaml', schema_view.without_ui(cache_timeout=0), name='schema-yaml'),
   
    path('api/auth/', include('accounts.urls')),
    path('api/', include('vehicles.urls')),
    path('api/', include('bookings.urls')),
    path('api/', include('payments.urls')),
    path('api/', include('tracking.urls')),
    path('api/', include('subscriptions.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

