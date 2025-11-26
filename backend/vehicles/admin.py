from django.contrib import admin
from .models import Vehicle, Driver

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['vehicle_name', 'vehicle_type', 'vehicle_number', 'capacity_kg', 'base_price', 'is_electric', 'is_available']
    list_filter = ['vehicle_type', 'is_electric', 'is_available']
    search_fields = ['vehicle_name', 'vehicle_number']

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['user', 'vehicle', 'license_number', 'rating', 'total_trips', 'is_available']
    list_filter = ['is_available', 'rating']
    search_fields = ['user__username', 'license_number']