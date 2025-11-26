from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'user', 'amount', 'payment_method', 'status', 'paid_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['transaction_id', 'booking__id']