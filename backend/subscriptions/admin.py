from django.contrib import admin
from .models import SubscriptionPlan, Subscription

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan_type', 'price', 'bookings_included', 'is_active']
    list_filter = ['plan_type', 'is_active']

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'bookings_used', 'start_date', 'end_date']
    list_filter = ['status', 'plan']
    search_fields = ['user__username']