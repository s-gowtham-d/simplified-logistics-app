from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, ProofMediaViewSet

router = DefaultRouter()
router.register('bookings', BookingViewSet, basename='booking')
router.register('proof', ProofMediaViewSet, basename='proof')

urlpatterns = [
    path('', include(router.urls)),
]