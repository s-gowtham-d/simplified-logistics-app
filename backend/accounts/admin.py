from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
# Register your models here.
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'phone_number', 'user_type', 'email', 'is_staff']
    list_filter = ['user_type', 'is_staff', 'is_active']
    search_fields = ['username', 'phone_number', 'email']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'user_type', 'company_name', 'gst_number')}),
    )