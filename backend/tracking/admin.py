from django.contrib import admin
from .models import TrackingLog

@admin.register(TrackingLog)
class TrackingLogAdmin(admin.ModelAdmin):
    list_display = ['booking', 'status', 'driver_lat', 'driver_lng', 'timestamp']
    list_filter = ['status']
    search_fields = ['booking__id']
    date_hierarchy = 'timestamp'