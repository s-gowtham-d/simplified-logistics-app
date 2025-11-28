import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
    Package,
    MapPin,
    Truck,
    Clock,
    ChevronRight,
    RefreshCw,
} from 'lucide-react-native';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Badge,
    Button,
} from '@/components/ui';
import { bookingsAPI } from '@/lib/api';

const STATUS_COLORS: any = {
    pending: 'warning',
    confirmed: 'secondary',
    driver_assigned: 'secondary',
    picked_up: 'default',
    in_transit: 'default',
    delivered: 'success',
    completed: 'success',
    cancelled: 'destructive',
};

const STATUS_LABELS: any = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    driver_assigned: 'Driver Assigned',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function BookingsScreen() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [])
    );

    const fetchBookings = async () => {
        try {
            const response = await bookingsAPI.getAll();
            // Filter only active bookings
            const activeBookings = response.data.results.filter(
                (b: any) => !['completed', 'cancelled'].includes(b.status)
            );
            setBookings(activeBookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleBookingPress = (booking: any) => {
        router.push({
            pathname: '/tracking/[id]',
            params: { id: booking.id },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-6 pt-6 pb-4">
                <Text className="text-3xl font-bold text-foreground">Active Bookings</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                    Track your ongoing deliveries
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View className="py-20 items-center">
                        <RefreshCw size={32} color="#9CA3AF" />
                        <Text className="text-muted-foreground mt-4">Loading bookings...</Text>
                    </View>
                ) : bookings.length === 0 ? (
                    <Card className="mt-4">
                        <CardContent className="py-12 items-center">
                            <Package size={48} color="#9CA3AF" />
                            <Text className="text-lg font-semibold text-foreground mt-4">
                                No Active Bookings
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center mt-2 mb-6">
                                You don't have any active bookings at the moment
                            </Text>
                            <Button
                                onPress={() => router.push('/(tabs)')}
                                variant="default"
                            >
                                <Text className="text-white font-semibold">
                                    Create New Booking
                                </Text>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <View className="space-y-4 pb-6">
                        {bookings.map((booking: any) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onPress={() => handleBookingPress(booking)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function BookingCard({ booking, onPress }: { booking: any; onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card>
                <CardHeader>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-2">
                                <CardTitle className="text-base">Booking #{booking.id}</CardTitle>
                                <Badge
                                    variant="default"
                                    className="ml-3"
                                >
                                    <Text className="text-white">
                                        {STATUS_LABELS[booking.status]}
                                    </Text>
                                </Badge>
                            </View>
                            <CardDescription>
                                {new Date(booking.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </CardDescription>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </View>
                </CardHeader>

                <CardContent>
                    {/* Pickup */}
                    <View className="flex-row items-start mb-3">
                        <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3 mt-0.5">
                            <MapPin size={16} color="#1E3A8A" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-muted-foreground mb-1">Pickup</Text>
                            <Text className="text-sm text-foreground" numberOfLines={2}>
                                {booking.pickup_address}
                            </Text>
                        </View>
                    </View>

                    {/* Dropoff */}
                    <View className="flex-row items-start mb-4">
                        <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3 mt-0.5">
                            <MapPin size={16} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-muted-foreground mb-1">Dropoff</Text>
                            <Text className="text-sm text-foreground" numberOfLines={2}>
                                {booking.dropoff_address}
                            </Text>
                        </View>
                    </View>

                    {/* Details */}
                    <View className="flex-row items-center justify-between pt-3 border-t border-border">
                        <View className="flex-row items-center">
                            <Truck size={16} color="#6B7280" />
                            <Text className="text-xs text-muted-foreground ml-2">
                                {booking.vehicle_details?.vehicle_name}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Clock size={16} color="#6B7280" />
                            <Text className="text-xs text-muted-foreground ml-2">
                                {booking.duration_mins} mins
                            </Text>
                        </View>
                        <Text className="text-sm font-bold text-primary">
                            ₹{booking.final_price}
                        </Text>
                    </View>
                </CardContent>
            </Card>
        </TouchableOpacity>
    );
}