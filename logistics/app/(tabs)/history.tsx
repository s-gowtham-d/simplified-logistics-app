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
    History as HistoryIcon,
    MapPin,
    Truck,
    Clock,
    Star,
    ChevronRight,
    Calendar,
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

export default function HistoryScreen() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [])
    );

    const fetchBookings = async () => {
        try {
            const response = await bookingsAPI.getAll();
            // Filter completed and cancelled bookings
            console.log("History", response.data)
            const historyBookings = response.data.results.filter(
                (b: any) => ['completed', 'cancelled'].includes(b.status)
            );
            setBookings(historyBookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Alert.alert('Error', 'Failed to load booking history');
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

    const filteredBookings = bookings.filter((b: any) => {
        if (filter === 'all') return true;
        return b.status === filter;
    });

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-6 pt-6 pb-4">
                <Text className="text-3xl font-bold text-foreground">History</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                    View your past bookings
                </Text>
            </View>

            {/* Filter Tabs */}
            <View className="px-6 mb-4">
                <View className="flex-row bg-secondary rounded-lg p-1">
                    <FilterTab
                        label="All"
                        isActive={filter === 'all'}
                        onPress={() => setFilter('all')}
                    />
                    <FilterTab
                        label="Completed"
                        isActive={filter === 'completed'}
                        onPress={() => setFilter('completed')}
                    />
                    <FilterTab
                        label="Cancelled"
                        isActive={filter === 'cancelled'}
                        onPress={() => setFilter('cancelled')}
                    />
                </View>
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
                        <HistoryIcon size={32} color="#9CA3AF" />
                        <Text className="text-muted-foreground mt-4">Loading history...</Text>
                    </View>
                ) : filteredBookings.length === 0 ? (
                    <Card className="mt-4">
                        <CardContent className="py-12 items-center">
                            <HistoryIcon size={48} color="#9CA3AF" />
                            <Text className="text-lg font-semibold text-foreground mt-4">
                                No Bookings Found
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center mt-2 mb-6">
                                {filter === 'all'
                                    ? "You don't have any booking history yet"
                                    : `No ${filter} bookings found`}
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
                        {filteredBookings.map((booking: any) => (
                            <HistoryBookingCard
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

function FilterTab({
    label,
    isActive,
    onPress,
}: {
    label: string;
    isActive: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 py-2 rounded-md ${isActive ? 'bg-background' : 'bg-transparent'
                }`}
            activeOpacity={0.7}
        >
            <Text
                className={`text-center text-sm font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function HistoryBookingCard({ booking, onPress }: { booking: any; onPress: () => void }) {
    const isCompleted = booking.status === 'completed';

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card>
                <CardHeader>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-2">
                                <CardTitle className="text-base">Booking #{booking.id}</CardTitle>
                                <Badge
                                    variant={isCompleted ? 'success' : 'destructive'}
                                    className="ml-3"
                                >
                                    <Text className="text-white text-xs font-semibold">
                                        {isCompleted ? 'COMPLETED' : 'CANCELLED'}
                                    </Text>
                                </Badge>
                            </View>
                            <View className="flex-row items-center">
                                <Calendar size={12} color="#6B7280" />
                                <CardDescription className="ml-1">
                                    {new Date(booking.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </CardDescription>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </View>
                </CardHeader>

                <CardContent>
                    {/* Locations */}
                    <View className="flex-row items-start mb-3">
                        <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3 mt-0.5">
                            <MapPin size={16} color="#1E3A8A" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-muted-foreground mb-1">From</Text>
                            <Text className="text-sm text-foreground" numberOfLines={1}>
                                {booking.pickup_address}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start mb-4">
                        <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3 mt-0.5">
                            <MapPin size={16} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-muted-foreground mb-1">To</Text>
                            <Text className="text-sm text-foreground" numberOfLines={1}>
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
                        {isCompleted && booking.rating && (
                            <View className="flex-row items-center">
                                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                                <Text className="text-xs text-muted-foreground ml-1">
                                    {booking.rating}/5
                                </Text>
                            </View>
                        )}
                        <Text className="text-sm font-bold text-primary">
                            ₹{booking.final_price}
                        </Text>
                    </View>
                </CardContent>
            </Card>
        </TouchableOpacity>
    );
}