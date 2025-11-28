from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, DriverViewSet
from .admin_views import AdminVehicleViewSet, AdminDriverViewSet

router = DefaultRouter()
router.register('vehicles', VehicleViewSet, basename='vehicle')
router.register('drivers', DriverViewSet, basename='driver')
router.register('admin/vehicles', AdminVehicleViewSet, basename='admin-vehicle')
router.register('admin/drivers', AdminDriverViewSet, basename='admin-driver')

urlpatterns = [
    path('', include(router.urls)),
]