from rest_framework import serializers
from .models import TrackingLog

class TrackingLogSerializer(serializers.ModelSerializer):
    """Serializer for TrackingLog model"""
    
    class Meta:
        model = TrackingLog
        fields = ['id', 'booking', 'driver_lat', 'driver_lng', 'status', 'notes', 'timestamp']
        read_only_fields = ['id', 'timestamp']