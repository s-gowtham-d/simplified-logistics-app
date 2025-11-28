import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    MapPin,
    Navigation,
    Package,
    Truck,
    Leaf,
    ChevronRight,
    Zap,
    Shield,
    Award,
} from 'lucide-react-native';
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Badge,
    Separator
} from '@/components/ui';
import { useAuthStore, useBookingStore } from '@/lib/store';
import { subscriptionsAPI, vehiclesAPI } from '@/lib/api';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const user = useAuthStore((state) => state.user);
    const [vehicles, setVehicles] = useState([]);
    const [vehiclesCount, setVehiclesCount] = useState(0);
    const [subscription, setSubscription] = useState<any>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        if (user?.user_type === 'business') {
            try {
                const response = await subscriptionsAPI.getActive();
                if (response.data.subscription) {
                    setSubscription(response.data.subscription);
                }
            } catch (error) {
                console.error('Error fetching subscription:', error);
            }
        }
    };


    const fetchVehicles = async () => {
        try {
            const response = await vehiclesAPI.getAll();
            console.log(response.data)
            setVehiclesCount(response.data.count);
            setVehicles(response.data.results); // Show top 3
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
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Header with Greeting */}
                <View className="px-6 pt-6 pb-4">
                    <Text className="text-sm text-muted-foreground">Welcome back,</Text>
                    <Text className="text-3xl font-bold text-foreground mt-1">
                        {user?.first_name || 'User'} 👋
                    </Text>
                </View>

                {/* Hero Booking Card */}
                <View className="px-6 mb-6">
                    <Card className="overflow-hidden">
                        <View className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                        <View className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full -ml-12 -mb-12" />

                        <CardHeader>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1 z-10">
                                    <CardTitle className="text-2xl mb-2">
                                        Book Your Delivery
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Fast, reliable, and affordable logistics
                                    </CardDescription>
                                </View>
                                <View className="w-16 h-16 bg-primary/20 rounded-2xl items-center justify-center z-10">
                                    <Truck size={32} color={theme.primary} />
                                </View>
                            </View>
                        </CardHeader>

                        <CardContent>
                            <View className="flex-row flex-wrap items-center justify-between mb-4">
                                <View className="flex-row items-center mr-1 ">
                                    <Zap size={16} color={theme.success} />
                                    <Text className="text-xs text-muted-foreground ml-1">
                                        30 min pickup
                                    </Text>
                                </View>
                                <View className="flex-row items-center mr-1 ">
                                    <Shield size={16} color={theme.success} />
                                    <Text className="text-xs text-muted-foreground ml-1">
                                        Insured delivery
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Leaf size={16} color={theme.success} />
                                    <Text className="text-xs text-muted-foreground ml-1">
                                        Green options
                                    </Text>
                                </View>
                            </View>

                            <Button
                                onPress={handleStartBooking}
                                size="lg"
                                className="shadow-lg"
                            >
                                <Text className='text-background'>

                                    Start New Booking
                                </Text>
                            </Button>
                        </CardContent>
                    </Card>
                </View>

                {/* Subscription Banner for Business Users */}
                {user?.user_type === 'business' && !subscription && (
                    <View className="px-6 mb-6">
                        <TouchableOpacity
                            onPress={() => router.push('/subscription/plans')}
                            activeOpacity={0.7}
                        >
                            <Card className="border-primary">
                                <CardContent className="py-4">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center mr-3">
                                            <Award size={24} color="#1E3A8A" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base font-bold text-foreground mb-1">
                                                Upgrade to Business Plan
                                            </Text>
                                            <Text className="text-xs text-muted-foreground">
                                                Save up to 15% with subscriptions • Get analytics
                                            </Text>
                                        </View>
                                        <ChevronRight size={20} color="#9CA3AF" />
                                    </View>
                                </CardContent>
                            </Card>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Quick Stats */}
                <View className="px-6 mb-6">
                    <View className="flex-row -mx-2">
                        <View className="flex-1 px-2">
                            <Card>
                                <CardContent className="items-center py-4">
                                    <Text className="text-2xl font-bold text-primary mb-1">{vehiclesCount}+</Text>
                                    <Text className="text-xs text-muted-foreground text-center">
                                        Vehicle Types
                                    </Text>
                                </CardContent>
                            </Card>
                        </View>
                        <View className="flex-1 px-2">
                            <Card>
                                <CardContent className="items-center py-4">
                                    <Text className="text-2xl font-bold text-green-600 mb-1">24/7</Text>
                                    <Text className="text-xs text-muted-foreground text-center">
                                        Support Available
                                    </Text>
                                </CardContent>
                            </Card>
                        </View>
                        <View className="flex-1 px-2">
                            <Card>
                                <CardContent className="items-center py-4">
                                    <Text className="text-2xl font-bold text-orange-600 mb-1">5k+</Text>
                                    <Text className="text-xs text-muted-foreground text-center">
                                        Happy Customers
                                    </Text>
                                </CardContent>
                            </Card>
                        </View>
                    </View>
                </View>

                {/* Features Grid */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-foreground">
                            Why Choose Us
                        </Text>
                    </View>

                    <View className="flex-row flex-wrap -mx-2">
                        <FeatureCard
                            icon={<Navigation size={24} color={theme.primary} />}
                            title="Real-time Tracking"
                            description="Track your delivery live on map"
                            theme={theme}
                        />
                        <FeatureCard
                            icon={<Package size={24} color={theme.success} />}
                            title="Safe Handling"
                            description="Professional & trained drivers"
                            theme={theme}
                        />
                        <FeatureCard
                            icon={<Leaf size={24} color={theme.success} />}
                            title="Green Fleet"
                            description="Eco-friendly electric vehicles"
                            theme={theme}
                        />
                        <FeatureCard
                            icon={<Zap size={24} color={theme.warning} />}
                            title="Multiple Options"
                            description="Fast, Economy, or Helper service"
                            theme={theme}
                        />
                    </View>
                </View>

                {/* Available Vehicles */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-xl font-bold text-foreground">
                                Popular Vehicles
                            </Text>
                            <Text className="text-sm text-muted-foreground mt-1">
                                Choose the perfect fit for your needs
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/vehicles/list')}>
                            <Text className="text-primary font-semibold">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <Card>
                            <CardContent className="py-8 items-center">
                                <Text className="text-muted-foreground">Loading vehicles...</Text>
                            </CardContent>
                        </Card>
                    ) : vehicles.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 items-center">
                                <Text className="text-muted-foreground">No vehicles available</Text>
                            </CardContent>
                        </Card>
                    ) : (
                        <View className="space-y-3 flex-col gap-3">
                            {vehicles.map((vehicle: any, index: number) => (
                                <VehicleCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                    theme={theme}
                                    isLast={index === vehicles.length - 1}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Promotional Banner */}
                <View className="px-6 mb-6">
                    <Card className="bg-gradient-to-r from-green-500 to-emerald-600 border-0">
                        <CardContent className="py-6">
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                                    <Leaf size={24} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-white mb-1">
                                        Go Green, Save More!
                                    </Text>
                                    <Text className="text-sm text-white/90">
                                        Get 5% off on all electric vehicle bookings
                                    </Text>
                                </View>
                            </View>
                        </CardContent>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    theme,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    theme: any;
}) {
    return (
        <View className="w-1/2 p-2">
            <Card>
                <CardContent className="py-5">
                    <View className="items-center">
                        <View className="w-14 h-14 bg-secondary rounded-2xl items-center justify-center mb-3 shadow-sm">
                            {icon}
                        </View>
                        <Text className="text-sm font-bold text-foreground text-center mb-1.5">
                            {title}
                        </Text>
                        <Text className="text-xs text-muted-foreground text-center leading-4">
                            {description}
                        </Text>
                    </View>
                </CardContent>
            </Card>
        </View>
    );
}

function VehicleCard({
    vehicle,
    theme,
    isLast
}: {
    vehicle: any;
    theme: any;
    isLast: boolean;
}) {
    const router = useRouter();

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
                // Navigate to vehicle details or booking
                router.push('/booking/pickup-location');
            }}
        >
            <Card>
                <CardContent className="py-4">
                    <View className="flex-row items-center">
                        {/* Vehicle Icon */}
                        <View className="w-20 h-20 bg-primary/10 rounded-2xl items-center justify-center mr-4 shadow-sm">
                            <Truck size={36} color={theme.primary} />
                        </View>

                        {/* Vehicle Details */}
                        <View className="flex-1">
                            <View className="flex-col items-start mb-2">
                                {vehicle.is_electric && (
                                    <Badge variant="default" className="mb-2">
                                        <View className="flex-row items-center">
                                            <Leaf size={10} color="#fff" />
                                            <Text className="text-[10px] text-white font-bold ml-1">
                                                Electric
                                            </Text>
                                        </View>
                                    </Badge>
                                )}
                                <Text className="text-base font-bold text-foreground">
                                    {vehicle.vehicle_name}
                                </Text>

                            </View>

                            <Text className="text-xs text-muted-foreground mb-2">
                                {vehicle.vehicle_type.replace('_', ' ').toUpperCase()}
                            </Text>

                            <View className="flex-row items-center mb-2">
                                <View className="flex-row items-center">
                                    <Package size={12} color={theme.textSecondary} />
                                    <Text className="text-xs text-muted-foreground ml-1">
                                        {vehicle.capacity_kg}kg
                                    </Text>
                                </View>
                                <Text className="text-xs text-muted-foreground mx-2">•</Text>
                                <Text className="text-xs text-muted-foreground">
                                    {vehicle.dimensions}
                                </Text>
                            </View>

                            <View className="flex-row items-center">
                                <Text className="text-sm font-bold text-primary">
                                    ₹{vehicle.base_price}
                                </Text>
                                <Text className="text-xs text-muted-foreground ml-1">
                                    base
                                </Text>
                                <Text className="text-xs text-muted-foreground mx-1">+</Text>
                                <Text className="text-xs font-semibold text-muted-foreground">
                                    ₹{vehicle.per_km_price}/km
                                </Text>
                            </View>
                        </View>

                        {/* Arrow Icon */}
                        <ChevronRight size={20} color={theme.textSecondary} />
                    </View>
                </CardContent>

                {!isLast && (
                    <View className="px-4">
                        <Separator />
                    </View>
                )}
            </Card>
        </TouchableOpacity>
    );
}