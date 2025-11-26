export interface User {
    id: number;
    username: string;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    user_type: 'customer' | 'business' | 'driver';
    company_name?: string;
    gst_number?: string;
}

export interface Vehicle {
    id: number;
    vehicle_type: 'bike' | 'mini_truck' | 'truck' | 'tempo';
    vehicle_number: string;
    vehicle_name: string;
    capacity_kg: number;
    dimensions: string;
    base_price: string;
    per_km_price: string;
    is_electric: boolean;
    is_available: boolean;
    image_url?: string;
}

export interface Quote {
    type: string;
    label: string;
    description: string;
    price: number;
    duration_mins: number;
    features: string[];
}

export interface Booking {
    id: number;
    user: number;
    driver?: number;
    vehicle: number;
    booking_type: string;
    status: string;
    pickup_address: string;
    pickup_lat: string;
    pickup_lng: string;
    pickup_contact_name: string;
    pickup_contact_phone: string;
    dropoff_address: string;
    dropoff_lat: string;
    dropoff_lng: string;
    dropoff_contact_name: string;
    dropoff_contact_phone: string;
    items_description: string;
    estimated_weight_kg?: string;
    distance_km: string;
    duration_mins: number;
    base_price: string;
    final_price: string;
    is_green_fleet: boolean;
    helper_required: boolean;
    scheduled_at?: string;
    rating?: number;
    feedback?: string;
    created_at: string;
    vehicle_details?: Vehicle;
    driver_details?: any;
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    plan_type: 'monthly' | 'quarterly' | 'yearly';
    price: string;
    bookings_included: number;
    discount_percentage: string;
    priority_support: boolean;
    dedicated_account_manager: boolean;
    custom_invoicing: boolean;
}

export interface Subscription {
    id: number;
    plan: number;
    plan_details: SubscriptionPlan;
    status: 'active' | 'expired' | 'cancelled';
    bookings_used: number;
    bookings_remaining: number;
    start_date: string;
    end_date: string;
    is_expired: boolean;
}