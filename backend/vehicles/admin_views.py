from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Vehicle, Driver
from .serializers import VehicleSerializer, DriverSerializer

class AdminVehicleViewSet(viewsets.ModelViewSet):
    """Admin endpoints for vehicles"""
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    
    @action(detail=True, methods=['post'])
    def toggle_availability(self, request, pk=None):
        """Toggle vehicle availability"""
        vehicle = self.get_object()
        vehicle.is_available = not vehicle.is_available
        vehicle.save()
        return Response(VehicleSerializer(vehicle).data)

class AdminDriverViewSet(viewsets.ModelViewSet):
    """Admin endpoints for drivers"""
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    
    @action(detail=True, methods=['post'])
    def toggle_availability(self, request, pk=None):
        """Toggle driver availability"""
        driver = self.get_object()
        driver.is_available = not driver.is_available
        driver.save()
        return Response(DriverSerializer(driver).data)