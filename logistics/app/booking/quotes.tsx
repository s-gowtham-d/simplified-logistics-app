import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, DollarSign, Users, Check } from 'lucide-react-native';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { useBookingStore } from '@/lib/store';
import { bookingsAPI } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuotesScreen() {
    const router = useRouter();
    const {
        pickupLocation,
        dropoffLocation,
        selectedVehicle,
        isGreenFleet,
        bookingType,
        setBookingType,
    } = useBookingStore();

    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            // Calculate distance (mock - in production use proper geocoding)
            const distance = calculateDistance(
                pickupLocation.lat,
                pickupLocation.lng,
                dropoffLocation.lat,
                dropoffLocation.lng
            );

            const response = await bookingsAPI.getAllQuotes({
                vehicle_type: selectedVehicle.vehicle_type,
                distance_km: distance,
                is_green_fleet: isGreenFleet,
            });

            setQuotes(response.data.quotes);
        } catch (error) {
            console.error('Error fetching quotes:', error);
            Alert.alert('Error', 'Failed to fetch quotes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Haversine formula for distance calculation
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return Math.round(distance * 10) / 10; // Round to 1 decimal
    };

    const handleQuoteSelect = (quote: any) => {
        setBookingType(quote.type);
    };

    const handleContinue = () => {
        router.push('/booking/confirm');
    };

    const getQuoteIcon = (type: string) => {
        switch (type) {
            case 'fast':
                return <Zap size={24} color="#F59E0B" />;
            case 'economy':
                return <DollarSign size={24} color="#10B981" />;
            case 'helper':
                return <Users size={24} color="#3B82F6" />;
            default:
                return <DollarSign size={24} color="#10B981" />;
        }
    };

    const getQuoteColor = (type: string) => {
        switch (type) {
            case 'fast':
                return 'border-orange-500';
            case 'economy':
                return 'border-green-500';
            case 'helper':
                return 'border-blue-500';
            default:
                return 'border-gray-300';
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text className="text-muted-foreground mt-4">Calculating quotes...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 px-6 py-6">
                {/* Header */}
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-foreground mb-2">
                        Choose Your Service
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                        Compare pricing and features for different service types
                    </Text>
                </View>

                {/* Quote Cards */}
                <View className="space-y-4 mb-6">
                    {quotes.map((quote: any) => (
                        <TouchableOpacity
                            key={quote.type}
                            onPress={() => handleQuoteSelect(quote)}
                            activeOpacity={0.7}
                        >
                            <Card className={`${bookingType === quote.type
                                ? `${getQuoteColor(quote.type)} border-2`
                                : ''
                                }`}>
                                <CardContent className="py-4">
                                    {/* Header */}
                                    <View className="flex-row items-center justify-between mb-4">
                                        <View className="flex-row items-center">
                                            <View className="w-12 h-12 bg-secondary rounded-xl items-center justify-center mr-3">
                                                {getQuoteIcon(quote.type)}
                                            </View>
                                            <View>
                                                <Text className="text-lg font-bold text-foreground">
                                                    {quote.label}
                                                </Text>
                                                <Text className="text-xs text-muted-foreground">
                                                    {quote.description}
                                                </Text>
                                            </View>
                                        </View>
                                        {bookingType === quote.type && (
                                            <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                                                <Check size={16} color="#fff" />
                                            </View>
                                        )}
                                    </View>

                                    {/* Price */}
                                    <View className="flex-row items-baseline mb-4">
                                        <Text className="text-3xl font-bold text-foreground">
                                            ₹{quote.price}
                                        </Text>
                                        <Text className="text-sm text-muted-foreground ml-2">
                                            • {quote.duration_mins} mins
                                        </Text>
                                    </View>

                                    {/* Features */}
                                    <View className="space-y-2">
                                        {quote.features.map((feature: string, index: number) => (
                                            <View key={index} className="flex-row items-center">
                                                <View className="w-4 h-4 bg-green-100 rounded-full items-center justify-center mr-2">
                                                    <Check size={12} color="#10B981" />
                                                </View>
                                                <Text className="text-sm text-muted-foreground">
                                                    {feature}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Best Value Badge */}
                                    {quote.type === 'economy' && (
                                        <View className="mt-3 pt-3 border-t border-border">
                                            <Badge variant="default">
                                                Best Value
                                            </Badge>
                                        </View>
                                    )}
                                    {quote.type === 'fast' && (
                                        <View className="mt-3 pt-3 border-t border-border">
                                            <Badge variant="secondary">
                                                Fastest Delivery
                                            </Badge>
                                        </View>
                                    )}
                                </CardContent>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Continue Button */}
                <Button
                    onPress={handleContinue}
                    size="lg"
                >
                    <Text className='text-background'>
                        Continue to Confirmation
                    </Text>
                </Button>

                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}