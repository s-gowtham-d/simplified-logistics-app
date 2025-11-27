import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Truck, Leaf, ChevronRight } from 'lucide-react-native';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { useBookingStore } from '@/lib/store';
import { vehiclesAPI } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VehicleSelectionScreen() {
    const router = useRouter();
    const { selectedVehicle, setSelectedVehicle, isGreenFleet } = useBookingStore();

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const params: any = {};
            if (isGreenFleet) {
                params.is_electric = true;
            }

            const response = await vehiclesAPI.getAll(params);
            setVehicles(response.data?.results || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleSelect = (vehicle: any) => {
        setSelectedVehicle(vehicle);
    };

    const handleContinue = () => {
        if (!selectedVehicle) {
            return;
        }
        router.push('/booking/quotes');
    };

    const getVehicleIcon = (type: string) => {
        // You can customize icons per vehicle type
        return <Truck size={32} color="#1E3A8A" />;
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text className="text-muted-foreground mt-4">Loading vehicles...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 px-6 py-6">
                {/* Header */}
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-foreground mb-2">
                        Select Your Vehicle
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                        Choose the vehicle that best fits your needs
                    </Text>
                </View>

                {isGreenFleet && (
                    <Card className="mb-4 bg-green-50 border-green-200">
                        <CardContent className="flex-row items-center py-3">
                            <Leaf size={20} color="#10B981" />
                            <Text className="text-sm text-green-700 ml-2 flex-1">
                                Showing electric vehicles only • 5% discount applied
                            </Text>
                        </CardContent>
                    </Card>
                )}

                <View className="space-y-3 mb-6">
                    {vehicles.map((vehicle: any) => (
                        <TouchableOpacity
                            key={vehicle.id}
                            onPress={() => handleVehicleSelect(vehicle)}
                            activeOpacity={0.7}
                        >
                            <Card className={`${selectedVehicle?.id === vehicle.id
                                ? 'border-primary border-2'
                                : ''
                                }`}>
                                <CardContent className="py-4">
                                    <View className="flex-row items-start">
                                        <View className="w-16 h-16 bg-secondary rounded-xl items-center justify-center mr-4">
                                            {getVehicleIcon(vehicle.vehicle_type)}
                                        </View>

                                        <View className="flex-1">
                                            <View className="flex-col items-start mb-2">
                                                {vehicle.is_electric && (
                                                    <Badge variant="default" className="mb-2">
                                                        <Text className="text-white font-bold">
                                                            Electric
                                                        </Text>
                                                    </Badge>
                                                )}
                                                <Text className="text-base font-bold text-foreground">
                                                    {vehicle.vehicle_name}
                                                </Text>

                                            </View>

                                            <Text className="text-sm text-muted-foreground mb-2">
                                                {vehicle.vehicle_type.replace('_', ' ').toUpperCase()}
                                            </Text>

                                            <View className="flex-row items-center mb-2">
                                                <Text className="text-xs text-muted-foreground">
                                                    Capacity: {vehicle.capacity_kg}kg
                                                </Text>
                                                <Text className="text-xs text-muted-foreground mx-2">•</Text>
                                                <Text className="text-xs text-muted-foreground">
                                                    {vehicle.dimensions}
                                                </Text>
                                            </View>

                                            <View className="flex-row items-center">
                                                <Text className="text-sm font-semibold text-primary">
                                                    ₹{vehicle.base_price}
                                                </Text>
                                                <Text className="text-xs text-muted-foreground ml-1">
                                                    base + ₹{vehicle.per_km_price}/km
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Selection Indicator */}
                                        <View className="ml-2">
                                            {selectedVehicle?.id === vehicle.id ? (
                                                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                                                    <View className="w-3 h-3 bg-white rounded-full" />
                                                </View>
                                            ) : (
                                                <View className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                                            )}
                                        </View>
                                    </View>
                                </CardContent>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* No vehicles message */}
                {vehicles.length === 0 && (
                    <Card className="mb-6">
                        <CardContent className="items-center py-8">
                            <Text className="text-muted-foreground text-center">
                                {isGreenFleet
                                    ? 'No electric vehicles available at the moment. Try disabling Green Fleet option.'
                                    : 'No vehicles available at the moment.'}
                            </Text>
                        </CardContent>
                    </Card>
                )}

                <Button
                    onPress={handleContinue}
                    size="lg"
                    disabled={!selectedVehicle}
                >
                    <Text className='text-background'>
                        Continue to Quotes
                    </Text>
                </Button>

                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}