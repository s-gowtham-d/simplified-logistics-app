from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from .models import SubscriptionPlan, Subscription
from .serializers import SubscriptionPlanSerializer, SubscriptionSerializer
from bookings.models import Booking

class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for SubscriptionPlan model
    Differentiated Feature: Business Subscriptions
    """
    
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated]


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for Subscription model"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer
    
    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user).order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Subscribe to a plan"""
        plan_id = request.data.get('plan_id')
        
        if not plan_id:
            return Response({
                'error': 'plan_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        plan = get_object_or_404(SubscriptionPlan, id=plan_id, is_active=True)
        
        # Check if user already has an active subscription
        active_subscription = Subscription.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        if active_subscription:
            return Response({
                'error': 'You already have an active subscription',
                'active_subscription': SubscriptionSerializer(active_subscription).data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate dates
        start_date = timezone.now().date()
        if plan.plan_type == 'monthly':
            end_date = start_date + relativedelta(months=1)
        elif plan.plan_type == 'quarterly':
            end_date = start_date + relativedelta(months=3)
        elif plan.plan_type == 'yearly':
            end_date = start_date + relativedelta(years=1)
        else:
            end_date = start_date + relativedelta(months=1)
        
        # Create subscription
        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            status='active',
            start_date=start_date,
            end_date=end_date
        )
        
        return Response({
            'message': 'Subscribed successfully',
            'subscription': SubscriptionSerializer(subscription).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get user's active subscription"""
        subscription = Subscription.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        if not subscription:
            return Response({
                'message': 'No active subscription',
                'subscription': None
            })
        
        # Check if expired
        if subscription.is_expired:
            subscription.status = 'expired'
            subscription.save()
            return Response({
                'message': 'Subscription expired',
                'subscription': SubscriptionSerializer(subscription).data
            })
        
        return Response({
            'subscription': SubscriptionSerializer(subscription).data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a subscription"""
        subscription = self.get_object()
        
        if subscription.status != 'active':
            return Response({
                'error': 'Only active subscriptions can be cancelled'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        subscription.status = 'cancelled'
        subscription.auto_renew = False
        subscription.save()
        
        return Response({
            'message': 'Subscription cancelled successfully',
            'subscription': SubscriptionSerializer(subscription).data
        })
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        Get business analytics for subscription users
        Differentiated Feature: Business Analytics
        """
        # Check if user has active subscription
        subscription = Subscription.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        if not subscription:
            return Response({
                'error': 'Analytics only available for subscription users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get bookings for current subscription period
        bookings = Booking.objects.filter(
            user=request.user,
            created_at__gte=subscription.start_date,
            created_at__lte=subscription.end_date
        )
        
        # Calculate statistics
        total_bookings = bookings.count()
        completed_bookings = bookings.filter(status='completed').count()
        cancelled_bookings = bookings.filter(status='cancelled').count()
        total_spent = sum([float(b.final_price) for b in bookings])
        
        # Average rating
        rated_bookings = bookings.filter(rating__isnull=False)
        avg_rating = sum([b.rating for b in rated_bookings]) / rated_bookings.count() if rated_bookings.count() > 0 else 0
        
        # Vehicle type breakdown
        vehicle_breakdown = {}
        for booking in bookings:
            if booking.vehicle:
                vtype = booking.vehicle.vehicle_type
                vehicle_breakdown[vtype] = vehicle_breakdown.get(vtype, 0) + 1
        
        # Booking type breakdown
        booking_type_breakdown = {}
        for booking in bookings:
            btype = booking.booking_type
            booking_type_breakdown[btype] = booking_type_breakdown.get(btype, 0) + 1
        
        return Response({
            'subscription': {
                'plan': subscription.plan.name,
                'bookings_used': subscription.bookings_used,
                'bookings_remaining': subscription.bookings_remaining,
                'period': f"{subscription.start_date} to {subscription.end_date}"
            },
            'analytics': {
                'total_bookings': total_bookings,
                'completed_bookings': completed_bookings,
                'cancelled_bookings': cancelled_bookings,
                'total_spent': round(total_spent, 2),
                'average_rating': round(avg_rating, 2),
                'vehicle_type_breakdown': vehicle_breakdown,
                'booking_type_breakdown': booking_type_breakdown
            }
        })