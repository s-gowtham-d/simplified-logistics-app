from django.db import models

class Vehicle(models.Model):
    """Vehicle types available for booking"""
    
    VEHICLE_TYPE_CHOICES = [
        ('bike', 'Bike'),
        ('mini_truck', 'Mini Truck'),
        ('truck', 'Truck'),
        ('tempo', 'Tempo'),
    ]
    
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    vehicle_number = models.CharField(max_length=20, unique=True)
    vehicle_name = models.CharField(max_length=100)  # e.g., "Tata Ace"
    
    capacity_kg = models.IntegerField(help_text="Maximum weight capacity in kg")
    dimensions = models.CharField(max_length=100, help_text="e.g., '4x6x4 feet'")
    
    base_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Base fare")
    per_km_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price per km")
    
    is_electric = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    
    image_url = models.URLField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.vehicle_name} ({self.vehicle_type})"
    
    class Meta:
        db_table = 'vehicles'
        ordering = ['vehicle_type', 'base_price']


class Driver(models.Model):
    """Driver information"""
    
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='driver_profile')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, related_name='drivers')
    
    license_number = models.CharField(max_length=20, unique=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    total_trips = models.IntegerField(default=0)
    
    is_available = models.BooleanField(default=False)
    current_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Driver: {self.user.get_full_name()} - {self.vehicle.vehicle_type if self.vehicle else 'No Vehicle'}"
    
    class Meta:
        db_table = 'drivers'