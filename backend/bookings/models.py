from django.db import models
from accounts import User

class Vehicle(models.Model):
    VEHICLE_TYPES =[
        ('bike','Bike'),
        ('mini_truck','Mini Truck'),
        ('truck','Truck'),
        ('temp', 'Tempo')
    ]
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPES)
    vehicle_number = models.CharField(max_length=20, unique=True)
    capacity_kg = models.IntegerField()
    dimensions = models.CharField(max_length=100)  # e.g., "4x6x4 feet"
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    per_km_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_electric = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.vehicle_number} - {self.vehicle_number}"
    
class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]
    
    BOOKING_TYPES = [
        ('fast', 'Fast'),
        ('economy', 'Economy'),
        ('helper', 'With Helper')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True)
    pickup_address = models.CharField(max_length=255)
    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_lng = models.DecimalField(max_digits=9, decimal_places=6)
    dropoff_address = models.CharField(max_length=255)
    dropoff_lat = models.DecimalField(max_digits=9, decimal_places=6)
    dropoff_lng = models.DecimalField(max_digits=9, decimal_places=6)
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    distance_km = models.DecimalField(max_digits=10, decimal_places=2)
    distance_mins = models.IntegerField()
    items_description = models.TextField()
    is_green_fleet = models.BooleanField(default=False)
    
    scheduled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking #{self.id} - {self.user.username}"
