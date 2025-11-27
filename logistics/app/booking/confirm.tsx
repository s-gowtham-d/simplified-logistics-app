import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    MapPin,
    Package,
    Truck,
    Calendar,
    User,
    Phone,
    Check,
} from 'lucide-react-native';
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Separator,
    Badge,
} from '@/components/ui';
import { useAuthStore, useBookingStore } from '@/lib/store';
import { bookingsAPI } from '@/lib/api';

export default function ConfirmBookingScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const {
        pickupLocation,
        dropoffLocation,
        selectedVehicle,
        bookingType,
        itemsDescription,
        estimatedWeight,
        isGreenFleet,
        clearBooking,
    } = useBookingStore();

    const [loading, setLoading] = useState(false);

    // Calculate distance (mock)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
    };

    const distance = calculateDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        dropoffLocation.lat,
        dropoffLocation.lng
    );

    const estimatedDuration = Math.round((distance / 30) * 60); // 30 km/h average

    // Calculate price
    const basePrice = parseFloat(selectedVehicle.base_price);
    const distancePrice = distance * parseFloat(selectedVehicle.per_km_price);
    const multipliers: any = { fast: 1.5, economy: 1.0, helper: 1.3 };
    const subtotal = (basePrice + distancePrice) * multipliers[bookingType];
    const greenDiscount = isGreenFleet && selectedVehicle.is_electric ? subtotal * 0.05 : 0;
    const finalPrice = subtotal - greenDiscount;

    const handleConfirmBooking = async () => {
        setLoading(true);

        try {
            const bookingData = {
                vehicle: selectedVehicle.id,
                booking_type: bookingType,
                pickup_address: pickupLocation.address,
                pickup_lat: pickupLocation.lat,
                pickup_lng: pickupLocation.lng,
                pickup_contact_name: pickupLocation.contactName,
                pickup_contact_phone: pickupLocation.contactPhone,
                dropoff_address: dropoffLocation.address,
                dropoff_lat: dropoffLocation.lat,
                dropoff_lng: dropoffLocation.lng,
                dropoff_contact_name: dropoffLocation.contactName,
                dropoff_contact_phone: dropoffLocation.contactPhone,
                items_description: itemsDescription,
                estimated_weight_kg: estimatedWeight || null,
                distance_km: distance,
                duration_mins: estimatedDuration,
                base_price: basePrice,
                final_price: Number(finalPrice.toFixed(2)),
                is_green_fleet: isGreenFleet,
                helper_required: bookingType === 'helper',
            };

            console.log(bookingData)

            const response = await bookingsAPI.create(bookingData);
            const booking = response.data;
            console.log(booking)

            Alert.alert(
                'Booking Confirmed! 🎉',
                `Your booking #${booking.id} has been confirmed. You will be redirected to payment.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // clearBooking();
                            router.replace({
                                pathname: '/payment/[id]',
                                params: { id: booking.id },
                            });
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Booking error:', error.response?.data);
            Alert.alert(
                'Booking Failed',
                error.response?.data?.detail || 'Failed to create booking. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="px-6 py-6">
                    {/* Header */}
                    <View className="mb-6">
                        <Text className="text-2xl font-bold text-foreground mb-2">
                            Review Your Booking
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                            Please verify all details before confirming
                        </Text>
                    </View>

                    {/* Pickup Location */}
                    <Card className="mb-4">
                        <CardHeader>
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                    <MapPin size={20} color="#1E3A8A" />
                                </View>
                                <CardTitle>Pickup Location</CardTitle>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <Text className="text-sm text-foreground mb-2">
                                {pickupLocation.address}
                            </Text>
                            <View className="flex-row items-center mb-1">
                                <User size={14} color="#6B7280" />
                                <Text className="text-xs text-muted-foreground ml-2">
                                    {pickupLocation.contactName}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Phone size={14} color="#6B7280" />
                                <Text className="text-xs text-muted-foreground ml-2">
                                    {pickupLocation.contactPhone}
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Dropoff Location */}
                    <Card className="mb-4">
                        <CardHeader>
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                                    <MapPin size={20} color="#10B981" />
                                </View>
                                <CardTitle>Dropoff Location</CardTitle>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <Text className="text-sm text-foreground mb-2">
                                {dropoffLocation.address}
                            </Text>
                            <View className="flex-row items-center mb-1">
                                <User size={14} color="#6B7280" />
                                <Text className="text-xs text-muted-foreground ml-2">
                                    {dropoffLocation.contactName}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Phone size={14} color="#6B7280" />
                                <Text className="text-xs text-muted-foreground ml-2">
                                    {dropoffLocation.contactPhone}
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Item Details */}
                    <Card className="mb-4">
                        <CardHeader>
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                                    <Package size={20} color="#F59E0B" />
                                </View>
                                <CardTitle>Item Details</CardTitle>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <Text className="text-sm text-foreground mb-2">
                                {itemsDescription}
                            </Text>
                            {estimatedWeight && (
                                <Text className="text-xs text-muted-foreground">
                                    Estimated Weight: {estimatedWeight} kg
                                </Text>
                            )}
                        </CardContent>
                    </Card>

                    {/* Vehicle & Service */}
                    <Card className="mb-4">
                        <CardHeader>
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                                    <Truck size={20} color="#3B82F6" />
                                </View>
                                <CardTitle>Vehicle & Service</CardTitle>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-sm text-foreground font-semibold">
                                    {selectedVehicle.vehicle_name}
                                </Text>
                                {selectedVehicle.is_electric && (
                                    <Badge variant="default">
                                        <Text className="text-white font-bold">
                                            Electric
                                        </Text>
                                    </Badge>
                                )}
                            </View>
                            <View className="flex-row items-center mb-2">
                                <Badge variant="destructive">
                                    <Text className="text-white font-bold">
                                        {bookingType.toUpperCase()}
                                    </Text>
                                </Badge>
                                {isGreenFleet && (
                                    <Badge variant="default" className="ml-2">
                                        <Text className="text-white font-bold">
                                            Green Fleet
                                        </Text>
                                    </Badge>
                                )}
                            </View>
                            <View className="flex-row items-center">
                                <Calendar size={14} color="#6B7280" />
                                <Text className="text-xs text-muted-foreground ml-2">
                                    Est. Duration: {estimatedDuration} mins
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Price Breakdown */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Price Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-muted-foreground">Base Price</Text>
                                <Text className="text-sm text-foreground">₹{basePrice.toFixed(2)}</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-muted-foreground">
                                    Distance ({distance} km)
                                </Text>
                                <Text className="text-sm text-foreground">₹{distancePrice.toFixed(2)}</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-muted-foreground">
                                    {bookingType === 'fast' && 'Fast Delivery (1.5x)'}
                                    {bookingType === 'economy' && 'Economy (1.0x)'}
                                    {bookingType === 'helper' && 'With Helper (1.3x)'}
                                </Text>
                                <Text className="text-sm text-foreground">
                                    ×{multipliers[bookingType]}
                                </Text>
                            </View>
                            {greenDiscount > 0 && (
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm text-green-600">Green Fleet Discount</Text>
                                    <Text className="text-sm text-green-600">-₹{greenDiscount.toFixed(2)}</Text>
                                </View>
                            )}
                            <Separator className="my-3" />
                            <View className="flex-row justify-between">
                                <Text className="text-lg font-bold text-foreground">Total</Text>
                                <Text className="text-2xl font-bold text-primary">
                                    ₹{finalPrice.toFixed(2)}
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Confirm Button */}
                    <Button onPress={handleConfirmBooking} loading={loading} size="lg">
                        <View className="flex-row items-center">
                            <Check size={20} color="#fff" />
                            <Text className="text-white font-semibold text-base ml-2">
                                Confirm & Proceed to Payment
                            </Text>
                        </View>
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}