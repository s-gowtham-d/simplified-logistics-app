from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, VehicleViewSet

router = DefaultRouter()
router.register('bookings', BookingViewSet, basename='booking')
router.register('vehicles', VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('', include(router.urls))
]