from django.db import models
from django.conf import settings

class Booking(models.Model):
    """Main booking model"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('driver_assigned', 'Driver Assigned'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    BOOKING_TYPE_CHOICES = [
        ('fast', 'Fast Delivery'),
        ('economy', 'Economy'),
        ('helper', 'With Helper'),
    ]
    
    # Relationships
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    driver = models.ForeignKey('vehicles.Driver', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Booking details
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPE_CHOICES, default='economy')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Pickup location
    pickup_address = models.TextField()
    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_lng = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_contact_name = models.CharField(max_length=100)
    pickup_contact_phone = models.CharField(max_length=15)
    
    # Dropoff location
    dropoff_address = models.TextField()
    dropoff_lat = models.DecimalField(max_digits=9, decimal_places=6)
    dropoff_lng = models.DecimalField(max_digits=9, decimal_places=6)
    dropoff_contact_name = models.CharField(max_length=100)
    dropoff_contact_phone = models.CharField(max_length=15)
    
    items_description = models.TextField(help_text="Description of items to be transported")
    estimated_weight_kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    distance_km = models.DecimalField(max_digits=10, decimal_places=2)
    duration_mins = models.IntegerField(help_text="Estimated duration in minutes")
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    is_green_fleet = models.BooleanField(default=False)
    helper_required = models.BooleanField(default=False)
    
    scheduled_at = models.DateTimeField(null=True, blank=True)
    pickup_time = models.DateTimeField(null=True, blank=True)
    delivery_time = models.DateTimeField(null=True, blank=True)
    
    rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])
    feedback = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking #{self.id} - {self.user.username} ({self.status})"
    
    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']


class ProofMedia(models.Model):
    """Photos/videos uploaded as proof"""
    
    MEDIA_TYPE_CHOICES = [
        ('photo', 'Photo'),
        ('video', 'Video'),
    ]
    
    UPLOAD_STAGE_CHOICES = [
        ('pickup', 'Pickup'),
        ('dropoff', 'Dropoff'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='proof_media')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    media_file = models.FileField(upload_to='proof_media/%Y/%m/%d/')
    upload_stage = models.CharField(max_length=10, choices=UPLOAD_STAGE_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Proof for Booking #{self.booking.id} - {self.upload_stage}"
    
    class Meta:
        db_table = 'proof_media'
        ordering = ['uploaded_at']