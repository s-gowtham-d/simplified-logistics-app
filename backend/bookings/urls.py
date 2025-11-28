from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, ProofMediaViewSet
from .admin_views import AdminBookingViewSet

router = DefaultRouter()
router.register('bookings', BookingViewSet, basename='booking')
router.register('proof', ProofMediaViewSet, basename='proof')
router.register('admin/bookings', AdminBookingViewSet, basename='admin-booking')

urlpatterns = [
    path('', include(router.urls)),
]