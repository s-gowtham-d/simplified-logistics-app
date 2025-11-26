from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrackingLogViewSet

router = DefaultRouter()
router.register('tracking', TrackingLogViewSet, basename='tracking')

urlpatterns = [
    path('', include(router.urls)),
]