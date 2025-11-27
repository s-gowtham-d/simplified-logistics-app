from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import TrackingLog
from .serializers import TrackingLogSerializer
from bookings.models import Booking
from vehicles.models import Driver
from decimal import Decimal

class TrackingLogViewSet(viewsets.ModelViewSet):
    """ViewSet for TrackingLog model"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = TrackingLogSerializer
    
    def get_queryset(self):
        return TrackingLog.objects.filter(booking__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_booking(self, request):
        """Get all tracking logs for a booking"""
        booking_id = request.query_params.get('booking_id')
        
        if not booking_id:
            return Response({
                'error': 'booking_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify booking belongs to user
        booking = get_object_or_404(Booking, id=booking_id, user=request.user)
        
        tracking_logs = TrackingLog.objects.filter(booking=booking).order_by('timestamp')
        
        # Get current driver location if assigned
        current_location = None
        if booking.driver:
            current_location = {
                'lat': float(booking.driver.current_lat) if booking.driver.current_lat else None,
                'lng': float(booking.driver.current_lng) if booking.driver.current_lng else None,
            }
        
        return Response({
            'booking_id': booking_id,
            'current_status': booking.status,
            'current_location': current_location,
            'tracking_history': TrackingLogSerializer(tracking_logs, many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def live(self, request):
        """Get live tracking for a booking"""
        booking_id = request.query_params.get('booking_id')
        
        if not booking_id:
            return Response({
                'error': 'booking_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        booking = get_object_or_404(Booking, id=booking_id, user=request.user)
        
        # Build response with booking info
        response_data = {
            'booking': {
                'id': booking.id,
                'status': booking.status,
                'pickup_address': booking.pickup_address,
                'dropoff_address': booking.dropoff_address,
            }
        }
        
        # If no driver assigned yet
        if not booking.driver:
            response_data['driver'] = None
            response_data['live_location'] = None
            response_data['eta_minutes'] = None
            response_data['message'] = 'Searching for a driver...'
            return Response(response_data)
        
        # Driver is assigned
        driver = booking.driver
        
        response_data['driver'] = {
            'name': driver.user.get_full_name(),
            'phone': driver.user.phone_number,
            'rating': float(driver.rating),
            'vehicle': {
                'type': driver.vehicle.vehicle_type if driver.vehicle else None,
                'number': driver.vehicle.vehicle_number if driver.vehicle else None,
                'name': driver.vehicle.vehicle_name if driver.vehicle else None,
            } if driver.vehicle else None
        }
        
        response_data['live_location'] = {
            'lat': float(driver.current_lat) if driver.current_lat else None,
            'lng': float(driver.current_lng) if driver.current_lng else None,
        }
        
        # Calculate mock ETA (in production, use routing API)
        if driver.current_lat and driver.current_lng:
            eta_minutes = 15  # Mock ETA
        else:
            eta_minutes = None
            
        response_data['eta_minutes'] = eta_minutes
        
        # Get last tracking log timestamp
        tracking_logs = TrackingLog.objects.filter(booking=booking).order_by('-timestamp')
        if tracking_logs.exists():
            response_data['last_updated'] = tracking_logs.first().timestamp
        else:
            response_data['last_updated'] = None
        
        return Response(response_data)
    
    @action(detail=False, methods=['post'])
    def update_location(self, request):
        """
        Update driver location (driver-facing endpoint)
        In production, this would be in a separate driver app
        """
        booking_id = request.data.get('booking_id')
        lat = request.data.get('lat')
        lng = request.data.get('lng')
        status_text = request.data.get('status', '')
        
        if not all([booking_id, lat, lng]):
            return Response({
                'error': 'booking_id, lat, and lng are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        booking = get_object_or_404(Booking, id=booking_id)
        
        if not booking.driver:
            return Response({
                'error': 'No driver assigned to this booking'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update driver's current location
        driver = booking.driver
        driver.current_lat = Decimal(str(lat))
        driver.current_lng = Decimal(str(lng))
        driver.save()
        
        # Create tracking log
        tracking_log = TrackingLog.objects.create(
            booking=booking,
            driver_lat=Decimal(str(lat)),
            driver_lng=Decimal(str(lng)),
            status=status_text or booking.status
        )
        
        return Response({
            'message': 'Location updated successfully',
            'tracking_log': TrackingLogSerializer(tracking_log).data
        })