"""
Simple script to test API endpoints
Run after creating superuser: python test_api.py
"""

import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_apis():
    print("Testing Logistics APIs\n")
    print("="*50)
    
    # Test 1: Get Vehicles
    print("\n1. Testing GET /api/vehicles/")
    response = requests.get(f"{BASE_URL}/vehicles/")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        vehicles = response.json()

        # DRF paginates → data is inside 'results'
        if isinstance(vehicles, dict) and "results" in vehicles:
            items = vehicles["results"]
        else:
            items = vehicles  # fallback (if pagination disabled)

        print(json.dumps(items[:2], indent=2))

    
    # Test 2: Get Subscription Plans
    print("\n2. Testing GET /api/subscriptions/plans/")
    response = requests.get(f"{BASE_URL}/plans/")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        plans = response.json()
        print(f"Found {len(plans)} subscription plans")
        print(json.dumps(plans, indent=2))
    
    print("\n" + "="*50)
    print("\nFor authenticated endpoints, register/login first!")
    print("Register: POST /api/auth/register/")
    print("Login: POST /api/auth/login/")

if __name__ == '__main__':
    test_apis()