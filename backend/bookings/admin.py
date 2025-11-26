from django.contrib import admin
from .models import Booking, ProofMedia

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'driver', 'booking_type', 'status', 'final_price', 'created_at']
    list_filter = ['status', 'booking_type', 'is_green_fleet']
    search_fields = ['user__username', 'pickup_address', 'dropoff_address']
    date_hierarchy = 'created_at'

@admin.register(ProofMedia)
class ProofMediaAdmin(admin.ModelAdmin):
    list_display = ['booking', 'media_type', 'upload_stage', 'uploaded_at']
    list_filter = ['media_type', 'upload_stage']