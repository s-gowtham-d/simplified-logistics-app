from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentInitiateSerializer,
    PaymentVerifySerializer
)
from bookings.models import Booking
import uuid

class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for Payment model"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def initiate(self, request):
        """Initiate a payment for a booking"""
        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        booking_id = serializer.validated_data['booking_id']
        payment_method = serializer.validated_data['payment_method']
        
        # Get booking
        booking = get_object_or_404(Booking, id=booking_id, user=request.user)
        
        # Check if booking already has payment
        if hasattr(booking, 'payment'):
            return Response({
                'error': 'Payment already exists for this booking'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment
        payment = Payment.objects.create(
            booking=booking,
            user=request.user,
            amount=booking.final_price,
            payment_method=payment_method,
            status='pending'
        )
        
        # For cash payments, mark as pending (driver will collect)
        if payment_method == 'cash':
            payment.status = 'pending'
            payment.transaction_id = f"CASH-{uuid.uuid4().hex[:12].upper()}"
            payment.save()
            
            return Response({
                'message': 'Cash payment initiated. Driver will collect on delivery.',
                'payment': PaymentSerializer(payment).data
            })
        
        # For digital payments (mock payment gateway)
        payment.transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        payment.status = 'processing'
        payment.save()
        
        # Simulate payment gateway response
        gateway_response = {
            'gateway': 'MockPaymentGateway',
            'transaction_id': payment.transaction_id,
            'payment_url': f'https://mock-gateway.com/pay/{payment.transaction_id}',
            'expires_at': (timezone.now() + timezone.timedelta(minutes=15)).isoformat()
        }
        
        payment.gateway_response = gateway_response
        payment.save()
        
        return Response({
            'message': 'Payment initiated successfully',
            'payment': PaymentSerializer(payment).data,
            'gateway_response': gateway_response
        })
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        """Verify and complete a payment (mock)"""
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment_id = serializer.validated_data['payment_id']
        transaction_id = serializer.validated_data.get('transaction_id')
        
        payment = get_object_or_404(Payment, id=payment_id, user=request.user)
        
        if payment.status == 'completed':
            return Response({
                'message': 'Payment already completed',
                'payment': PaymentSerializer(payment).data
            })
        
        # Mock verification (in production, verify with payment gateway)
        payment.status = 'completed'
        payment.paid_at = timezone.now()
        if transaction_id:
            payment.transaction_id = transaction_id
        payment.save()
        
        # Update booking status
        booking = payment.booking
        if booking.status == 'pending':
            booking.status = 'confirmed'
            booking.save()
        
        return Response({
            'message': 'Payment verified successfully',
            'payment': PaymentSerializer(payment).data
        })
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Process a refund (mock)"""
        payment = self.get_object()
        
        if payment.status != 'completed':
            return Response({
                'error': 'Can only refund completed payments'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock refund processing
        payment.status = 'refunded'
        payment.save()
        
        # Update booking
        booking = payment.booking
        booking.status = 'cancelled'
        booking.save()
        
        return Response({
            'message': 'Refund processed successfully',
            'payment': PaymentSerializer(payment).data
        })
    
    @action(detail=False, methods=['get'])
    def by_booking(self, request):
        """Get payment for a specific booking"""
        booking_id = request.query_params.get('booking_id')
        
        if not booking_id:
            return Response({
                'error': 'booking_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment = get_object_or_404(
            Payment,
            booking_id=booking_id,
            user=request.user
        )
        
        return Response(PaymentSerializer(payment).data)