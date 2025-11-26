from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'user', 'amount', 'payment_method', 
                  'status', 'transaction_id', 'paid_at', 'created_at']
        read_only_fields = ['id', 'user', 'transaction_id', 'paid_at', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PaymentInitiateSerializer(serializers.Serializer):
    """Serializer for initiating payment"""
    
    booking_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['cash', 'card', 'upi', 'wallet'])


class PaymentVerifySerializer(serializers.Serializer):
    """Serializer for verifying payment"""
    
    payment_id = serializers.IntegerField()
    transaction_id = serializers.CharField(required=False)