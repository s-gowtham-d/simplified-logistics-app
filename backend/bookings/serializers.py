from rest_framework import serializers
from .models import Booking, ProofMedia
from vehicles.serializers import VehicleSerializer, DriverSerializer

class ProofMediaSerializer(serializers.ModelSerializer):
    """Serializer for ProofMedia model"""
    
    class Meta:
        model = ProofMedia
        fields = ['id', 'media_type', 'media_file', 'upload_stage', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    driver_details = DriverSerializer(source='driver', read_only=True)
    proof_media = ProofMediaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'driver', 'vehicle', 'booking_type', 'status',
            'pickup_address', 'pickup_lat', 'pickup_lng', 'pickup_contact_name', 'pickup_contact_phone',
            'dropoff_address', 'dropoff_lat', 'dropoff_lng', 'dropoff_contact_name', 'dropoff_contact_phone',
            'items_description', 'estimated_weight_kg', 'distance_km', 'duration_mins',
            'base_price', 'final_price', 'is_green_fleet', 'helper_required',
            'scheduled_at', 'pickup_time', 'delivery_time', 'rating', 'feedback',
            'created_at', 'updated_at', 'vehicle_details', 'driver_details', 'proof_media'
        ]
        read_only_fields = ['id', 'user', 'driver', 'status', 'pickup_time', 'delivery_time', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BookingCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating bookings"""
    
    class Meta:
        model = Booking
        fields = [
            'vehicle', 'booking_type', 'pickup_address', 'pickup_lat', 'pickup_lng',
            'pickup_contact_name', 'pickup_contact_phone', 'dropoff_address', 
            'dropoff_lat', 'dropoff_lng', 'dropoff_contact_name', 'dropoff_contact_phone',
            'items_description', 'estimated_weight_kg', 'distance_km', 'duration_mins',
            'base_price', 'final_price', 'is_green_fleet', 'helper_required', 'scheduled_at'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class QuoteRequestSerializer(serializers.Serializer):
    """Serializer for getting price quotes"""
    
    vehicle_type = serializers.ChoiceField(choices=['bike', 'mini_truck', 'truck', 'tempo'])
    distance_km = serializers.DecimalField(max_digits=10, decimal_places=2)
    booking_type = serializers.ChoiceField(choices=['fast', 'economy', 'helper'], default='economy')
    is_green_fleet = serializers.BooleanField(default=False)
    estimated_weight_kg = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class QuoteResponseSerializer(serializers.Serializer):
    """Serializer for quote response"""
    
    vehicle_type = serializers.CharField()
    vehicle_name = serializers.CharField()
    booking_type = serializers.CharField()
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    distance_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    booking_type_multiplier = serializers.DecimalField(max_digits=5, decimal_places=2)
    green_fleet_discount = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    estimated_duration_mins = serializers.IntegerField()