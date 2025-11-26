from django.db import models

class TrackingLog(models.Model):
    """Real-time trackingl ogs for bookings"""
    
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='tracking_logs')
    
    driver_lat = models.DecimalField(max_digits=9, decimal_places=6)
    driver_lng = models.DecimalField(max_digits=9, decimal_places=6)
    
    status = models.CharField(max_length=50)
    notes = models.TextField(blank=True, null=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Tracking Booking #{self.booking.id} at {self.timestamp}"
    
    class Meta:
        db_table = 'tracking_logs'
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['booking', 'timestamp']),
        ]