from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Vehicle, Driver
from .serializers import VehicleSerializer, DriverSerializer
from decimal import Decimal

class VehicleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Vehicle model - read only"""
    
    queryset = Vehicle.objects.filter(is_available=True)
    serializer_class = VehicleSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        vehicle_type = self.request.query_params.get('type', None)
        is_electric = self.request.query_params.get('is_electric', None)
        
        if vehicle_type:
            queryset = queryset.filter(vehicle_type=vehicle_type)
        if is_electric is not None:
            queryset = queryset.filter(is_electric=is_electric.lower() == 'true')
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def calculate_vehicle(self, request):
        """
        Equipment Utilization Calculator
        Suggests right vehicle based on item details
        """
        weight_kg = request.data.get('weight_kg', 0)
        dimensions = request.data.get('dimensions', '')  # Format: "LxWxH feet"
        item_description = request.data.get('item_description', '')
        
        # Parse dimensions
        try:
            if dimensions:
                l, w, h = map(float, dimensions.lower().replace('feet', '').replace('ft', '').split('x'))
                volume_cubic_feet = l * w * h
            else:
                volume_cubic_feet = 0
        except:
            volume_cubic_feet = 0
        
        # Get all vehicles
        vehicles = Vehicle.objects.filter(is_available=True).order_by('capacity_kg')
        
        # Find suitable vehicles
        suitable_vehicles = []
        for vehicle in vehicles:
            if vehicle.capacity_kg >= weight_kg:
                # Parse vehicle dimensions
                try:
                    v_l, v_w, v_h = map(float, vehicle.dimensions.lower().replace('feet', '').replace('ft', '').split('x'))
                    vehicle_volume = v_l * v_w * v_h
                    
                    if volume_cubic_feet <= vehicle_volume:
                        utilization = (volume_cubic_feet / vehicle_volume) * 100 if vehicle_volume > 0 else 0
                        suitable_vehicles.append({
                            'vehicle': VehicleSerializer(vehicle).data,
                            'utilization_percentage': round(utilization, 2),
                            'weight_utilization': round((weight_kg / vehicle.capacity_kg) * 100, 2),
                            'recommended': True
                        })
                except:
                    pass
        
        if not suitable_vehicles:
            return Response({
                'message': 'No suitable vehicle found. Please contact support.',
                'vehicles': []
            })
        
        # Sort by utilization (prefer 60-90% utilization)
        suitable_vehicles.sort(key=lambda x: abs(x['utilization_percentage'] - 75))
        
        return Response({
            'recommended_vehicle': suitable_vehicles[0],
            'all_suitable_vehicles': suitable_vehicles,
            'input': {
                'weight_kg': weight_kg,
                'dimensions': dimensions,
                'volume_cubic_feet': round(volume_cubic_feet, 2)
            }
        })


class DriverViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Driver model - read only"""
    
    queryset = Driver.objects.filter(is_available=True)
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Get nearby available drivers"""
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        
        if not lat or not lng:
            return Response({
                'error': 'lat and lng parameters required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock implementation - in production use PostGIS for geo queries
        drivers = Driver.objects.filter(is_available=True)[:5]
        
        return Response({
            'drivers': DriverSerializer(drivers, many=True).data,
            'count': drivers.count()
        })