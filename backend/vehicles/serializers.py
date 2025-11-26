from rest_framework import serializers
from .models import Vehicle, Driver

class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model"""
    
    class Meta:
        model = Vehicle
        fields = ['id', 'vehicle_type', 'vehicle_number', 'vehicle_name',
                  'capacity_kg', 'dimensions', 'base_price', 'per_km_price',
                  'is_electric', 'is_available', 'image_url']
        read_only_fields = ['id']


class DriverSerializer(serializers.ModelSerializer):
    """Serializer for Driver model"""
    
    user_details = serializers.SerializerMethodField()
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    
    class Meta:
        model = Driver
        fields = ['id', 'user_details', 'vehicle_details', 'license_number',
                  'rating', 'total_trips', 'is_available', 'current_lat', 'current_lng']
        read_only_fields = ['id', 'rating', 'total_trips']
    
    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'name': obj.user.get_full_name(),
            'phone': obj.user.phone_number,
        }