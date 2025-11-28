from django.core.management.base import BaseCommand
from django.utils.crypto import get_random_string
from decimal import Decimal

from accounts.models import User
from vehicles.models import Vehicle, Driver
from subscriptions.models import SubscriptionPlan


class Command(BaseCommand):
    help = "Seed the database with initial vehicles, subscription plans, and demo drivers"

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 Starting database seed...")

        # ===============================
        # 1. VEHICLES
        # ===============================
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
                vehicle_number=data["vehicle_number"], defaults=data
            )
            if created:
                self.stdout.write(f"✔ Created Vehicle: {vehicle.vehicle_name}")

        # ===============================
        # 2. SUBSCRIPTION PLANS
        # ===============================
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
                name=data["name"], defaults=data
            )
            if created:
                self.stdout.write(f"✔ Created Subscription Plan: {plan.name}")

        # ===============================
        # 3. DEMO DRIVERS
        # ===============================
        driver_users = [
            {
                "username": "driver1",
                "first_name": "Ravi",
                "last_name": "Kumar",
                "email": "driver1@example.com",
                "phone_number": "9000000001"
            },
            {
                "username": "driver2",
                "first_name": "Suresh",
                "last_name": "M",
                "email": "driver2@example.com",
                "phone_number": "9000000002"
            },
            {
                "username": "driver3",
                "first_name": "Arun",
                "last_name": "Nair",
                "email": "driver3@example.com",
                "phone_number": "9000000003"
            },
            {
                "username": "driver4",
                "first_name": "Mohammad",
                "last_name": "Ali",
                "email": "driver4@example.com",
                "phone_number": "9000000004"
            },
        ]

        vehicle_map = {
            "bike": Vehicle.objects.filter(vehicle_type="bike").first(),
            "mini_truck": Vehicle.objects.filter(vehicle_type="mini_truck").first(),
            "truck": Vehicle.objects.filter(vehicle_type="truck").first(),
            "tempo": Vehicle.objects.filter(vehicle_type="tempo").first(),
        }

        driver_vehicle_assignment = ["bike", "mini_truck", "truck", "tempo"]

        for i, driver_data in enumerate(driver_users):
            username = driver_data["username"]

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": driver_data["first_name"],
                    "last_name": driver_data["last_name"],
                    "email": driver_data["email"],
                    "phone_number": driver_data["phone_number"],
                    "user_type": "driver",
                }
            )

            if created:
                user.set_password("password123")
                user.save()
                self.stdout.write(f"✔ Created Driver User: {username}")

            assigned_vehicle_type = driver_vehicle_assignment[i]
            assigned_vehicle = vehicle_map[assigned_vehicle_type]

            driver, created_driver = Driver.objects.get_or_create(
                user=user,
                defaults={
                    "vehicle": assigned_vehicle,
                    "license_number": f"LIC{get_random_string(6)}",
                    "rating": Decimal("4.50"),
                    "total_trips": 10,
                    "is_available": True,
                    "current_lat": Decimal("12.971600"),
                    "current_lng": Decimal("77.594600"),
                }
            )

            if created_driver:
                self.stdout.write(
                    f"✔ Created Driver Profile: {username} → {assigned_vehicle.vehicle_type}"
                )

        self.stdout.write(self.style.SUCCESS("🎉 Database seed completed successfully!"))
