from rest_framework import viewsets, status
from rest_framework.decorators import action 
from rest_framework.response import Response
from .models import Booking, Vehicle
from .serializers import BookingSerializer, VehicleSerializer


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=["post"])
    def get_quote(self, request):
        """Calculate price quote"""
        distance_km = request.data.get('distance_km')
        vehicle_type = request.data.get('vehicle_type')
        booking_type = request.data.get('booking_type', 'economy')
        
        vehicle = Vehicle.objects.filter(vehicle_type=vehicle_type).first()
        if not vehicle:
            return Response({"error": "Vehicle not found"}, status=status.HTTP_400_BAD_REQUEST)

        base_price = vehicle.base_price
        distance_price = distance_km * vehicle.per_km_price
        
        multiplier = {'fast' : 1.5, 'economy': 1.0, 'helper': 1.3}
        total = (base_price + distance_price) * multiplier[booking_type]
        
        return Response({
            'vehicle_type': vehicle_type,
            'booking_type': booking_type,
            'base_price': base_price,
            'distance_price': distance_price,
            'total_price': round(total, 2)
        })
        
class VehicleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer