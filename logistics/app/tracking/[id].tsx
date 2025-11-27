import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    MapPin,
    Phone,
    User,
    Navigation,
    Clock,
    Package,
    Camera,
    Star,
    X,
} from 'lucide-react-native';
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Badge,
    Separator,
} from '@/components/ui';
import { bookingsAPI, trackingAPI, proofAPI } from '@/lib/api';

export default function TrackingScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const bookingId = parseInt(id as string);

    const [booking, setBooking] = useState<any>(null);
    const [tracking, setTracking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchTrackingData();
        // Refresh every 10 seconds
        const interval = setInterval(fetchTrackingData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchTrackingData = async () => {
        try {
            const [bookingResponse, trackingResponse] = await Promise.all([
                bookingsAPI.getById(bookingId),
                trackingAPI.getLive(bookingId),
            ]);
            setBooking(bookingResponse.data);
            setTracking(trackingResponse.data);
        } catch (error) {
            console.error('Error fetching tracking:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCallDriver = () => {
        if (tracking?.driver?.phone) {
            Linking.openURL(`tel:${tracking.driver.phone}`);
        }
    };

    const handleCancelBooking = () => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            await bookingsAPI.cancel(bookingId);
                            Alert.alert('Success', 'Booking cancelled successfully');
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel booking');
                        } finally {
                            setCancelling(false);
                        }
                    },
                },
            ]
        );
    };

    const handleRateBooking = () => {
        router.push({
            pathname: '/rating/[id]',
            params: { id: bookingId },
        });
    };

    const handleViewProof = async () => {
        try {
            const response = await proofAPI.getByBooking(bookingId);
            const proofMedia = response.data.proof_media;

            if (proofMedia.length === 0) {
                Alert.alert('No Proof', 'No proof media available yet');
            } else {
                // Show proof media (you can navigate to a gallery screen)
                Alert.alert(
                    'Proof Media',
                    `${proofMedia.length} proof items available`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load proof media');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text className="text-muted-foreground mt-4">Loading tracking...</Text>
            </SafeAreaView>
        );
    }

    const canCancel = ['pending', 'confirmed'].includes(booking?.status);
    const canRate = booking?.status === 'completed' && !booking?.rating;
    const showDriverInfo = booking?.status !== 'pending';

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-border">
                <View>
                    <Text className="text-2xl font-bold text-foreground">
                        Track Delivery
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                        Booking #{bookingId}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                    <X size={24} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="px-6 py-6">
                    {/* Status Card */}
                    <Card className="mb-4">
                        <CardContent className="py-6">
                            <View className="items-center">
                                <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                                    <Navigation size={32} color="#1E3A8A" />
                                </View>
                                <Badge variant="default" className="mb-3">
                                    <Text className="text-white font-semibold">
                                        {booking?.status.replace('_', ' ').toUpperCase()}
                                    </Text>
                                </Badge>
                                {tracking?.eta_minutes && (
                                    <View className="flex-row items-center mt-2">
                                        <Clock size={16} color="#6B7280" />
                                        <Text className="text-sm text-muted-foreground ml-2">
                                            ETA: {tracking.eta_minutes} mins
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </CardContent>
                    </Card>

                    {/* Driver Info */}
                    {showDriverInfo && tracking?.driver && (
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Driver Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-3">
                                            <User size={24} color="#1E3A8A" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base font-semibold text-foreground">
                                                {tracking.driver.name}
                                            </Text>
                                            <View className="flex-row items-center mt-1">
                                                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                                                <Text className="text-sm text-muted-foreground ml-1">
                                                    {tracking.driver.rating.toFixed(1)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Button
                                        onPress={handleCallDriver}
                                        variant="outline"
                                        size="sm"
                                        className="ml-2"
                                    >
                                        <Phone size={16} color="#1E3A8A" />
                                    </Button>
                                </View>

                                {tracking.driver.vehicle && (
                                    <View className="mt-4 pt-4 border-t border-border">
                                        <View className="flex-row items-center">
                                            <Package size={16} color="#6B7280" />
                                            <Text className="text-sm text-muted-foreground ml-2">
                                                {tracking.driver.vehicle.type} • {tracking.driver.vehicle.number}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Location Info */}
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle>Delivery Route</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Pickup */}
                            <View className="flex-row items-start mb-4">
                                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3 mt-1">
                                    <MapPin size={20} color="#1E3A8A" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs text-muted-foreground mb-1">
                                        PICKUP
                                    </Text>
                                    <Text className="text-sm text-foreground mb-1">
                                        {booking?.pickup_address}
                                    </Text>
                                    <Text className="text-xs text-muted-foreground">
                                        {booking?.pickup_contact_name} • {booking?.pickup_contact_phone}
                                    </Text>
                                </View>
                            </View>

                            <View className="ml-5 mb-4">
                                <View className="w-0.5 h-8 bg-border" />
                            </View>

                            {/* Dropoff */}
                            <View className="flex-row items-start">
                                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3 mt-1">
                                    <MapPin size={20} color="#10B981" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs text-muted-foreground mb-1">
                                        DROPOFF
                                    </Text>
                                    <Text className="text-sm text-foreground mb-1">
                                        {booking?.dropoff_address}
                                    </Text>
                                    <Text className="text-xs text-muted-foreground">
                                        {booking?.dropoff_contact_name} • {booking?.dropoff_contact_phone}
                                    </Text>
                                </View>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Booking Details */}
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle>Booking Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-muted-foreground">Vehicle</Text>
                                <Text className="text-sm text-foreground font-semibold">
                                    {booking?.vehicle_details?.vehicle_name}
                                </Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-muted-foreground">Service Type</Text>
                                <Badge variant="secondary">
                                    <Text className="text-xs font-semibold">
                                        {booking?.booking_type.toUpperCase()}
                                    </Text>
                                </Badge>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-muted-foreground">Distance</Text>
                                <Text className="text-sm text-foreground">
                                    {booking?.distance_km} km
                                </Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-muted-foreground">Items</Text>
                                <Text className="text-sm text-foreground" numberOfLines={1}>
                                    {booking?.items_description}
                                </Text>
                            </View>
                            <Separator className="my-3" />
                            <View className="flex-row justify-between">
                                <Text className="text-base font-bold text-foreground">Total</Text>
                                <Text className="text-xl font-bold text-primary">
                                    ₹{booking?.final_price}
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Proof Media Button */}
                    {booking?.status !== 'pending' && (
                        <Button
                            onPress={handleViewProof}
                            variant="outline"
                            size="lg"
                            className="mb-4"
                        >
                            <View className="flex-row items-center">
                                <Camera size={20} color="#1E3A8A" />
                                <Text className="text-primary font-semibold ml-2">
                                    View Proof Media
                                </Text>
                            </View>
                        </Button>
                    )}

                    {/* Rate Booking */}
                    {canRate && (
                        <Button
                            onPress={handleRateBooking}
                            size="lg"
                            className="mb-4"
                        >
                            <View className="flex-row items-center">
                                <Star size={20} color="#fff" />
                                <Text className="text-white font-semibold ml-2">
                                    Rate Your Experience
                                </Text>
                            </View>
                        </Button>
                    )}

                    {/* Cancel Button */}
                    {canCancel && (
                        <Button
                            onPress={handleCancelBooking}
                            variant="destructive"
                            size="lg"
                            loading={cancelling}
                        >
                            Cancel Booking
                        </Button>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}