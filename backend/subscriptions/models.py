from django.db import models
from django.conf import settings
from dateutil.relativedelta import relativedelta
from django.utils import timezone

class SubscriptionPlan(models.Model):
    """Subscription plans for business users"""
    
    PLAN_TYPE_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    bookings_included = models.IntegerField(help_text="Number of bookings included per period")
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    priority_support = models.BooleanField(default=False)
    dedicated_account_manager = models.BooleanField(default=False)
    custom_invoicing = models.BooleanField(default=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - ₹{self.price}/{self.plan_type}"
    
    class Meta:
        db_table = 'subscription_plans'


class Subscription(models.Model):
    """User subscriptions"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    bookings_used = models.IntegerField(default=0)
    
    start_date = models.DateField()
    end_date = models.DateField()
    
    auto_renew = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.plan.name} ({self.status})"
    
    @property
    def is_expired(self):
        return timezone.now().date() > self.end_date
    
    @property
    def bookings_remaining(self):
        return self.plan.bookings_included - self.bookings_used
    
    class Meta:
        db_table = 'subscriptions'
        ordering = ['-created_at']