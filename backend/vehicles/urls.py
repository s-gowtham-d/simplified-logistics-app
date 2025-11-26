from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, DriverViewSet

router = DefaultRouter()
router.register('vehicles', VehicleViewSet, basename='vehicle')
router.register('drivers', DriverViewSet, basename='driver')

urlpatterns = [
    path('', include(router.urls)),
]