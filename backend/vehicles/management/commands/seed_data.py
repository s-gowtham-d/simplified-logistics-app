from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from vehicles.models import Vehicle, Driver
from subscriptions.models import SubscriptionPlan
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # Create vehicles
        vehicles_data = [
            {
                'vehicle_type': 'bike',
                'vehicle_number': 'TN01AB1234',
                'vehicle_name': 'Two Wheeler',
                'capacity_kg': 20,
                'dimensions': '2x1x1 feet',
                'base_price': Decimal('50.00'),
                'per_km_price': Decimal('5.00'),
                'is_electric': False,
            },
            {
                'vehicle_type': 'mini_truck',
                'vehicle_number': 'TN01CD5678',
                'vehicle_name': 'Tata Ace',
                'capacity_kg': 750,
                'dimensions': '7x5x5 feet',
                'base_price': Decimal('150.00'),
                'per_km_price': Decimal('12.00'),
                'is_electric': False,
            },
            {
                'vehicle_type': 'truck',
                'vehicle_number': 'TN02EF9012',
                'vehicle_name': 'Eicher 14ft',
                'capacity_kg': 2000,
                'dimensions': '14x6x6 feet',
                'base_price': Decimal('300.00'),
                'per_km_price': Decimal('18.00'),
                'is_electric': False,
            },
            {
                'vehicle_type': 'tempo',
                'vehicle_number': 'TN03GH3456',
                'vehicle_name': 'Mahindra Bolero Pickup',
                'capacity_kg': 1200,
                'dimensions': '10x5x5 feet',
                'base_price': Decimal('200.00'),
                'per_km_price': Decimal('15.00'),
                'is_electric': True,
            },
        ]
        
        for data in vehicles_data:
            vehicle, created = Vehicle.objects.get_or_create(
                vehicle_number=data['vehicle_number'],
                defaults=data
            )
            if created:
                self.stdout.write(f'Created vehicle: {vehicle.vehicle_name}')
        
        # Create subscription plans
        plans_data = [
            {
                'name': 'Basic Monthly',
                'plan_type': 'monthly',
                'price': Decimal('999.00'),
                'bookings_included': 10,
                'discount_percentage': Decimal('5.00'),
            },
            {
                'name': 'Pro Quarterly',
                'plan_type': 'quarterly',
                'price': Decimal('2499.00'),
                'bookings_included': 35,
                'discount_percentage': Decimal('10.00'),
                'priority_support': True,
            },
            {
                'name': 'Enterprise Yearly',
                'plan_type': 'yearly',
                'price': Decimal('8999.00'),
                'bookings_included': 150,
                'discount_percentage': Decimal('15.00'),
                'priority_support': True,
                'dedicated_account_manager': True,
            },
        ]
        for data in plans_data:
            plan, created = SubscriptionPlan.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            if created:
                self.stdout.write(f'Created plan: {plan.name}')
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))