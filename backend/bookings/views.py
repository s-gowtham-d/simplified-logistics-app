from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from decimal import Decimal
from .models import Booking, ProofMedia
from .serializers import (
    BookingSerializer, 
    BookingCreateSerializer,
    QuoteRequestSerializer,
    QuoteResponseSerializer,
    ProofMediaSerializer
)
from vehicles.models import Vehicle, Driver
import random
import uuid
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bookings
    
    list: Get all bookings for the authenticated user
    create: Create a new booking
    retrieve: Get details of a specific booking
    update: Update a booking
    destroy: Delete a booking
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own bookings
        if getattr(self, 'swagger_fake_view', False):
            return Booking.objects.none()

        if not self.request.user.is_authenticated:
            return Booking.objects.none()
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer
    
    @action(detail=False, methods=['post'])
    def get_quote(self, request):
        """
        Get price quotes for booking
        Differentiated Feature: Multiple Quote Options (Fast, Economy, Helper)
        """
        serializer = QuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        vehicle_type = serializer.validated_data['vehicle_type']
        distance_km = serializer.validated_data['distance_km']
        booking_type = serializer.validated_data['booking_type']
        is_green_fleet = serializer.validated_data['is_green_fleet']
        
        # Get vehicle
        vehicle = Vehicle.objects.filter(
            vehicle_type=vehicle_type,
            is_available=True
        ).first()
        
        if not vehicle:
            return Response({
                'error': 'No available vehicle of this type'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate base pricing
        base_price = vehicle.base_price
        distance_price = distance_km * vehicle.per_km_price
        
        # Booking type multipliers
        multipliers = {
            'fast': Decimal('1.5'),      # 50% premium for fast delivery
            'economy': Decimal('1.0'),    # Standard pricing
            'helper': Decimal('1.3')      # 30% extra for helper service
        }
        
        multiplier = multipliers.get(booking_type, Decimal('1.0'))
        subtotal = (base_price + distance_price) * multiplier
        
        # Green fleet discount (5% off)
        green_discount = Decimal('0')
        if is_green_fleet and vehicle.is_electric:
            green_discount = subtotal * Decimal('0.05')
        
        total_price = subtotal - green_discount
        
        # Estimate duration (assuming 30 km/hr average speed)
        estimated_duration = int((float(distance_km) / 30) * 60)  # in minutes
        
        # Add buffer based on booking type
        if booking_type == 'fast':
            estimated_duration = int(estimated_duration * 0.8)  # 20% faster
        elif booking_type == 'economy':
            estimated_duration = int(estimated_duration * 1.2)  # 20% slower
        
        response_data = {
            'vehicle_type': vehicle_type,
            'vehicle_name': vehicle.vehicle_name,
            'booking_type': booking_type,
            'base_price': float(base_price),
            'distance_price': float(distance_price),
            'booking_type_multiplier': float(multiplier),
            'green_fleet_discount': float(green_discount),
            'total_price': float(total_price),
            'estimated_duration_mins': estimated_duration
        }
        
        return Response(response_data)
    
    @swagger_auto_schema(
        operation_description="Get price quotes for all booking types (Fast, Economy, Helper)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['vehicle_type', 'distance_km'],
            properties={
                'vehicle_type': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=['bike', 'mini_truck', 'truck', 'tempo'],
                    description='Type of vehicle needed'
                ),
                'distance_km': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='Distance in kilometers'
                ),
                'is_green_fleet': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description='Request electric vehicle (5% discount)'
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description="Quote calculated successfully",
                examples={
                    "application/json": {
                        "vehicle": {
                            "type": "mini_truck",
                            "name": "Tata Ace",
                            "is_electric": False
                        },
                        "quotes": [
                            {
                                "type": "economy",
                                "label": "Economy",
                                "description": "Standard delivery at best price",
                                "price": 270.0,
                                "duration_mins": 36,
                                "features": ["Standard delivery", "Best price", "Reliable service"]
                            },
                            {
                                "type": "fast",
                                "label": "Fast",
                                "description": "Priority delivery - 20% faster",
                                "price": 405.0,
                                "duration_mins": 28,
                                "features": ["Priority pickup", "Faster delivery", "Real-time tracking"]
                            },
                            {
                                "type": "helper",
                                "label": "Helper",
                                "description": "Includes loading/unloading helper",
                                "price": 351.0,
                                "duration_mins": 36,
                                "features": ["Loading assistance", "Unloading assistance", "Safe handling"]
                            }
                        ]
                    }
                }
            ),
            400: "Bad Request - Invalid vehicle type or missing parameters"
        }
    )
    @action(detail=False, methods=['post'])
    def get_all_quotes(self, request):
        """
        Get quotes for all booking types
        Shows comparison of Fast, Economy, and Helper options
        """
        vehicle_type = request.data.get('vehicle_type')
        distance_km = Decimal(request.data.get('distance_km', 0))
        is_green_fleet = request.data.get('is_green_fleet', False)
        
        vehicle = Vehicle.objects.filter(
            vehicle_type=vehicle_type,
            is_available=True
        ).first()
        
        if not vehicle:
            return Response({
                'error': 'No available vehicle of this type'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        quotes = []
        booking_types = ['economy', 'fast', 'helper']
        
        for booking_type in booking_types:
            quote_data = {
                'vehicle_type': vehicle_type,
                'distance_km': distance_km,
                'booking_type': booking_type,
                'is_green_fleet': is_green_fleet
            }
            
            # Reuse quote calculation logic
            quote_serializer = QuoteRequestSerializer(data=quote_data)
            quote_serializer.is_valid(raise_exception=True)
            
            base_price = vehicle.base_price
            distance_price = distance_km * vehicle.per_km_price
            
            multipliers = {
                'fast': Decimal('1.5'),
                'economy': Decimal('1.0'),
                'helper': Decimal('1.3')
            }
            
            multiplier = multipliers[booking_type]
            subtotal = (base_price + distance_price) * multiplier
            
            green_discount = Decimal('0')
            if is_green_fleet and vehicle.is_electric:
                green_discount = subtotal * Decimal('0.05')
            
            total_price = subtotal - green_discount
            
            estimated_duration = int((float(distance_km) / 30) * 60)
            if booking_type == 'fast':
                estimated_duration = int(estimated_duration * 0.8)
            elif booking_type == 'economy':
                estimated_duration = int(estimated_duration * 1.2)
            
            quotes.append({
                'type': booking_type,
                'label': booking_type.capitalize(),
                'description': self._get_booking_type_description(booking_type),
                'price': float(total_price),
                'duration_mins': estimated_duration,
                'features': self._get_booking_type_features(booking_type)
            })
        
        return Response({
            'vehicle': {
                'type': vehicle_type,
                'name': vehicle.vehicle_name,
                'is_electric': vehicle.is_electric
            },
            'quotes': quotes
        })
    
    def _get_booking_type_description(self, booking_type):
        descriptions = {
            'economy': 'Standard delivery at best price',
            'fast': 'Priority delivery - 20% faster',
            'helper': 'Includes loading/unloading helper'
        }
        return descriptions.get(booking_type, '')
    
    def _get_booking_type_features(self, booking_type):
        features = {
            'economy': ['Standard delivery', 'Best price', 'Reliable service'],
            'fast': ['Priority pickup', 'Faster delivery', 'Real-time tracking'],
            'helper': ['Loading assistance', 'Unloading assistance', 'Safe handling']
        }
        return features.get(booking_type, [])
    
    def create(self, request, *args, **kwargs):
        """Create a new booking"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Mock driver assignment (in production, use matching algorithm)
        self._assign_driver(booking)
        
        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED
        )
    
    def _assign_driver(self, booking):
        """Mock driver assignment"""
        # Find available drivers with matching vehicle type
        available_drivers = Driver.objects.filter(
            is_available=True,
            vehicle__vehicle_type=booking.vehicle.vehicle_type
        )
        
        if available_drivers.exists():
            driver = random.choice(available_drivers)
            booking.driver = driver
            booking.status = 'driver_assigned'
            booking.save()
    
    @swagger_auto_schema(
        operation_description="Cancel a booking. Only pending/confirmed bookings can be cancelled.",
        responses={
            200: "Booking cancelled successfully",
            400: "Cannot cancel booking in current status"
        }
    )
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        if booking.status in ['delivered', 'completed', 'cancelled']:
            return Response({
                'error': 'Cannot cancel booking in current status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'cancelled'
        booking.save()
        
        return Response({
            'message': 'Booking cancelled successfully',
            'booking': BookingSerializer(booking).data
        })
    
    @swagger_auto_schema(
        operation_description="Rate a completed booking (1-5 stars)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['rating'],
            properties={
                'rating': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='Rating from 1 to 5',
                    minimum=1,
                    maximum=5
                ),
                'feedback': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Optional feedback text'
                ),
            }
        ),
        responses={
            200: "Rating submitted successfully",
            400: "Invalid rating or booking not completed"
        }
    )
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Rate a completed booking"""
        booking = self.get_object()
        
        if booking.status != 'completed':
            return Response({
                'error': 'Can only rate completed bookings'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        rating = request.data.get('rating')
        feedback = request.data.get('feedback', '')
        
        if not rating or int(rating) not in range(1, 6):
            return Response({
                'error': 'Rating must be between 1 and 5'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        booking.rating = rating
        booking.feedback = feedback
        booking.save()
        
        # Update driver rating
        if booking.driver:
            self._update_driver_rating(booking.driver, int(rating))
        
        return Response({
            'message': 'Rating submitted successfully',
            'booking': BookingSerializer(booking).data
        })
    
    def _update_driver_rating(self, driver, new_rating):
        """Update driver's average rating"""
        total_trips = driver.total_trips
        current_rating = float(driver.rating)
        
        # Calculate new average
        new_average = ((current_rating * total_trips) + new_rating) / (total_trips + 1)
        
        driver.rating = round(new_average, 2)
        driver.total_trips += 1
        driver.save()
        
class ProofMediaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProofMedia model
    Differentiated Feature: Live Proof System
    """
    
    serializer_class = ProofMediaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
    # Users can only see proof for their own bookings
        # Skip filtering during Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return ProofMedia.objects.none()
        # Prevent AnonymousUser crash
        if not self.request.user.is_authenticated:
         return ProofMedia.objects.none()
    
        return ProofMedia.objects.filter(booking__user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Upload proof media (photo/video)"""
        booking_id = request.data.get('booking_id')
        
        if not booking_id:
            return Response({
                'error': 'booking_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify booking belongs to user
        booking = get_object_or_404(Booking, id=booking_id, user=request.user)
        
        # Create proof media
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proof = serializer.save(booking=booking)
        
        return Response(
            ProofMediaSerializer(proof).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def by_booking(self, request):
        """Get all proof media for a booking"""
        booking_id = request.query_params.get('booking_id')
        
        if not booking_id:
            return Response({
                'error': 'booking_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify booking belongs to user
        booking = get_object_or_404(Booking, id=booking_id, user=request.user)
        
        proof_media = ProofMedia.objects.filter(booking=booking).order_by('uploaded_at')
        
        return Response({
            'booking_id': booking_id,
            'proof_media': ProofMediaSerializer(proof_media, many=True).data
        })