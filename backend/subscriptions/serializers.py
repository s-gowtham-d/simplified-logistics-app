from rest_framework import serializers
from .models import SubscriptionPlan, Subscription

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for SubscriptionPlan model"""
    
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'plan_type', 'price', 'bookings_included',
                  'discount_percentage', 'priority_support', 'dedicated_account_manager',
                  'custom_invoicing', 'is_active']
        read_only_fields = ['id']


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model"""
    
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    is_expired = serializers.ReadOnlyField()
    bookings_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = ['id', 'user', 'plan', 'plan_details', 'status', 'bookings_used',
                  'start_date', 'end_date', 'auto_renew', 'is_expired', 
                  'bookings_remaining', 'created_at']
        read_only_fields = ['id', 'user', 'bookings_used', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)