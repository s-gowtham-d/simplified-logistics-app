import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    Truck,
    X,
    Leaf,
    Package,
    Ruler,
    IndianRupee,
    CheckCircle,
} from 'lucide-react-native';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Badge,
    Button,
    Separator,
} from '@/components/ui';
import { vehiclesAPI } from '@/lib/api';
import { useBookingStore } from '@/lib/store';

export default function VehicleDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const vehicleId = parseInt(id as string);
    const setSelectedVehicle = useBookingStore((state) => state.setSelectedVehicle);

    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicle();
    }, []);

    const fetchVehicle = async () => {
        try {
            const response = await vehiclesAPI.getById(vehicleId);
            setVehicle(response.data);
        } catch (error) {
            console.error('Error fetching vehicle:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookWithVehicle = () => {
        setSelectedVehicle(vehicle);
        router.push('/booking/pickup-location');
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text className="text-muted-foreground mt-4">Loading vehicle...</Text>
            </SafeAreaView>
        );
    }

    if (!vehicle) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Text className="text-muted-foreground">Vehicle not found</Text>
                <Button onPress={() => router.back()} variant="outline" className="mt-4">
                    Go Back
                </Button>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-6 py-6 border-b border-border flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <X size={24} color="#6B7280" />
                </TouchableOpacity>
                {vehicle.is_available ? (
                    <Badge variant="default">
                        <Text className="text-white text-xs font-semibold">AVAILABLE</Text>
                    </Badge>
                ) : (
                    <Badge variant="destructive">
                        <Text className="text-white text-xs font-semibold">UNAVAILABLE</Text>
                    </Badge>
                )}
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <View className="px-6 py-6">
                    {/* Vehicle Header */}
                    <View className="items-center mb-6">
                        <View className="w-32 h-32 bg-primary/10 rounded-3xl items-center justify-center mb-4">
                            <Truck size={64} color="#1E3A8A" />
                        </View>
                        <Text className="text-3xl font-bold text-foreground mb-2">
                            {vehicle.vehicle_name}
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-sm text-muted-foreground">
                                {vehicle.vehicle_type.replace('_', ' ').toUpperCase()}
                            </Text>
                            {vehicle.is_electric && (
                                <View className="flex-row items-center ml-2">
                                    <Leaf size={14} color="#10B981" />
                                    <Text className="text-sm text-green-600 ml-1 font-semibold">
                                        Electric
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Specifications */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Specifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="space-y-4">
                                <SpecificationRow
                                    icon={<Package size={20} color="#6B7280" />}
                                    label="Maximum Capacity"
                                    value={`${vehicle.capacity_kg} kg`}
                                />
                                <Separator />
                                <SpecificationRow
                                    icon={<Ruler size={20} color="#6B7280" />}
                                    label="Cargo Dimensions"
                                    value={vehicle.dimensions}
                                />
                                <Separator />
                                <SpecificationRow
                                    icon={<Truck size={20} color="#6B7280" />}
                                    label="Vehicle Number"
                                    value={vehicle.vehicle_number}
                                />
                            </View>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="space-y-4">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-sm text-muted-foreground">Base Price</Text>
                                    <Text className="text-2xl font-bold text-foreground">
                                        ₹{vehicle.base_price}
                                    </Text>
                                </View>
                                <Separator />
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-sm text-muted-foreground">Per Kilometer</Text>
                                    <Text className="text-xl font-bold text-primary">
                                        ₹{vehicle.per_km_price}
                                    </Text>
                                </View>
                            </View>

                            {vehicle.is_electric && (
                                <View className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <View className="flex-row items-center">
                                        <CheckCircle size={16} color="#10B981" />
                                        <Text className="text-xs text-green-700 ml-2 font-semibold">
                                            Get 5% discount on electric vehicles
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </CardContent>
                    </Card>

                    {/* Features */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="space-y-3">
                                <FeatureItem text="Professional & trained drivers" />
                                <FeatureItem text="Real-time GPS tracking" />
                                <FeatureItem text="Safe & secure handling" />
                                <FeatureItem text="On-time delivery guarantee" />
                                {vehicle.is_electric && (
                                    <FeatureItem text="Eco-friendly electric vehicle" />
                                )}
                            </View>
                        </CardContent>
                    </Card>

                    {/* Book Button */}
                    <Button
                        onPress={handleBookWithVehicle}
                        size="lg"
                        disabled={!vehicle.is_available}
                    >
                        <Text className="text-background font-semibold">
                            {vehicle.is_available ? 'Book This Vehicle' : 'Currently Unavailable'}
                        </Text>
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function SpecificationRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <View className="flex-row items-center">
            <View className="w-10 h-10 bg-secondary rounded-xl items-center justify-center mr-3">
                {icon}
            </View>
            <View className="flex-1">
                <Text className="text-xs text-muted-foreground mb-1">{label}</Text>
                <Text className="text-base text-foreground font-semibold">{value}</Text>
            </View>
        </View>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <View className="flex-row items-center">
            <CheckCircle size={18} color="#10B981" />
            <Text className="text-sm text-foreground ml-3">{text}</Text>
        </View>
    );
}