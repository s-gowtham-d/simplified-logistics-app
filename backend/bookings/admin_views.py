from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Booking
from vehicles.models import Driver, Vehicle
from .serializers import BookingSerializer
import random

class AdminBookingViewSet(viewsets.ModelViewSet):
    """Admin endpoints for managing bookings"""
    permission_classes = [IsAuthenticated]
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    @action(detail=True, methods=['post'])
    def assign_driver(self, request, pk=None):
        """Manually assign driver to booking"""
        booking = self.get_object()
        driver_id = request.data.get('driver_id')
        
        if not driver_id:
            # Auto-assign available driver
            driver = Driver.objects.filter(
                is_available=True,
                vehicle__vehicle_type=booking.vehicle.vehicle_type
            ).first()
        else:
            driver = get_object_or_404(Driver, id=driver_id)
        
        if not driver:
            return Response({'error': 'No driver available'}, status=400)
        
        booking.driver = driver
        booking.status = 'driver_assigned'
        booking.save()
        
        driver.is_available = False
        driver.save()
        
        return Response(BookingSerializer(booking).data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update booking status"""
        booking = self.get_object()
        new_status = request.data.get('status')
        
        allowed_statuses = ['confirmed', 'driver_assigned', 'picked_up', 
                          'in_transit', 'delivered', 'completed']
        
        if new_status not in allowed_statuses:
            return Response({'error': 'Invalid status'}, status=400)
        
        booking.status = new_status
        
        # Release driver on completion
        if new_status == 'completed' and booking.driver:
            booking.driver.is_available = True
            booking.driver.save()
        
        booking.save()
        return Response(BookingSerializer(booking).data)