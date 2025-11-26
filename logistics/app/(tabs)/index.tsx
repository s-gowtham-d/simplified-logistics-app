import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    MapPin,
    Navigation,
    Package,
    Truck,
    Leaf,
    ChevronRight,
} from 'lucide-react-native';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuthStore, useBookingStore } from '@/lib/store';
import { vehiclesAPI } from '@/lib/api';

export default function HomeScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await vehiclesAPI.getAll();
            console.log(response.data)
            setVehicles(response?.data?.count > 0 && response.data?.results.slice(0, 3) || []); // Show top 3
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartBooking = () => {
        router.push('/booking/pickup-location');
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-6 pb-4">
                    <Text className="text-sm text-muted-foreground">Welcome back,</Text>
                    <Text className="text-2xl font-bold text-foreground">
                        {user?.first_name || 'User'}
                    </Text>
                </View>

                {/* Quick Booking Card */}
                <View className="px-6 mb-6">
                    <Card className="bg-gradient-to-br from-primary to-blue-700">
                        <CardHeader>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-xl font-bold text-white mb-2">
                                        Book Your Delivery
                                    </Text>
                                    <Text className="text-sm text-blue-100">
                                        Fast, reliable, and affordable logistics
                                    </Text>
                                </View>
                                <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
                                    <Truck size={32} color="#fff" />
                                </View>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onPress={handleStartBooking}
                                variant="secondary"
                                size="lg"
                                className="mt-4"
                            >
                                <Text className='text-white'>

                                    Start Booking
                                </Text>
                            </Button>
                        </CardContent>
                    </Card>
                </View>

                {/* Features */}
                <View className="px-6 mb-6">
                    <Text className="text-lg font-bold text-foreground mb-4">
                        Why Choose Us
                    </Text>
                    <View className="flex-row flex-wrap -mx-2">
                        <FeatureCard
                            icon={<Navigation size={24} color="#1E3A8A" />}
                            title="Real-time Tracking"
                            description="Track your delivery live"
                        />
                        <FeatureCard
                            icon={<Package size={24} color="#10B981" />}
                            title="Safe Handling"
                            description="Professional drivers"
                        />
                        <FeatureCard
                            icon={<Leaf size={24} color="#10B981" />}
                            title="Green Fleet"
                            description="Eco-friendly options"
                        />
                        <FeatureCard
                            icon={<Truck size={24} color="#F59E0B" />}
                            title="Multiple Options"
                            description="Fast, Economy, Helper"
                        />
                    </View>
                </View>

                {/* Available Vehicles */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-foreground">
                            Available Vehicles
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/vehicles/list')}>
                            <Text className="text-primary font-semibold">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <Text className="text-muted-foreground">Loading vehicles...</Text>
                    ) : (
                        <View className="space-y-3">
                            {vehicles.map((vehicle: any) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </View>
                    )}
                </View>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <View className="w-1/2 p-2">
            <Card className="h-full">
                <CardContent className="items-center py-4">
                    <View className="w-12 h-12 bg-secondary rounded-full items-center justify-center mb-3">
                        {icon}
                    </View>
                    <Text className="text-sm font-semibold text-foreground text-center mb-1">
                        {title}
                    </Text>
                    <Text className="text-xs text-muted-foreground text-center">
                        {description}
                    </Text>
                </CardContent>
            </Card>
        </View>
    );
}

function VehicleCard({ vehicle }: { vehicle: any }) {
    return (
        <Card>
            <CardContent className="flex-row items-center py-4">
                <View className="w-16 h-16 bg-secondary rounded-xl items-center justify-center mr-4">
                    <Truck size={32} color="#1E3A8A" />
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className="text-base font-bold text-foreground">
                            {vehicle.vehicle_name}
                        </Text>
                        {vehicle.is_electric && (
                            <View className="ml-2 bg-green-100 px-2 py-0.5 rounded-full">
                                <Text className="text-xs text-green-700 font-semibold">
                                    Electric
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-sm text-muted-foreground mt-1">
                        Capacity: {vehicle.capacity_kg}kg • {vehicle.dimensions}
                    </Text>
                    <Text className="text-sm font-semibold text-primary mt-1">
                        ₹{vehicle.base_price} base + ₹{vehicle.per_km_price}/km
                    </Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
            </CardContent>
        </Card>
    );
}