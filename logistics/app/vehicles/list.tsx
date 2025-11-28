import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Truck,
    X,
    Leaf,
    Package,
    Ruler,
    IndianRupee,
    Filter,
} from 'lucide-react-native';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Badge,
    Button,
} from '@/components/ui';
import { vehiclesAPI } from '@/lib/api';

export default function VehicleListScreen() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'electric'>('all');

    useEffect(() => {
        fetchVehicles();
    }, [filter]);

    const fetchVehicles = async () => {
        try {
            const params: any = {};
            if (filter === 'electric') {
                params.is_electric = true;
            }

            const response = await vehiclesAPI.getAll(params);
            setVehicles(response.data.results);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchVehicles();
    };

    const handleVehiclePress = (vehicle: any) => {
        router.push({
            pathname: '/vehicles/[id]',
            params: { id: vehicle.id },
        });
    };

    const getVehicleTypeLabel = (type: string) => {
        const labels: any = {
            bike: 'Two Wheeler',
            mini_truck: 'Mini Truck',
            truck: 'Truck',
            tempo: 'Tempo',
        };
        return labels[type] || type;
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-6 py-6 border-b border-border">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <X size={24} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-foreground mb-2">
                    All Vehicles
                </Text>
                <Text className="text-sm text-muted-foreground">
                    Choose the perfect vehicle for your delivery
                </Text>
            </View>

            {/* Filter Tabs */}
            <View className="px-6 py-4 border-b border-border">
                <View className="flex-row bg-secondary rounded-lg p-1">
                    <FilterTab
                        label="All Vehicles"
                        isActive={filter === 'all'}
                        onPress={() => setFilter('all')}
                    />
                    <FilterTab
                        label="Electric Only"
                        icon={<Leaf size={14} color={filter === 'electric' ? '#fff' : '#10B981'} />}
                        isActive={filter === 'electric'}
                        onPress={() => setFilter('electric')}
                    />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 20 }}
            >
                {loading ? (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color="#1E3A8A" />
                        <Text className="text-muted-foreground mt-4">Loading vehicles...</Text>
                    </View>
                ) : vehicles.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 items-center">
                            <Truck size={48} color="#9CA3AF" />
                            <Text className="text-lg font-semibold text-foreground mt-4">
                                No Vehicles Found
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center mt-2">
                                {filter === 'electric'
                                    ? 'No electric vehicles available at the moment'
                                    : 'No vehicles available at the moment'}
                            </Text>
                        </CardContent>
                    </Card>
                ) : (
                    <View className="space-y-4">
                        {vehicles.map((vehicle: any) => (
                            <TouchableOpacity
                                key={vehicle.id}
                                onPress={() => handleVehiclePress(vehicle)}
                                activeOpacity={0.7}
                            >
                                <Card>
                                    <CardHeader>
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center flex-1">
                                                <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mr-4">
                                                    <Truck size={32} color="#1E3A8A" />
                                                </View>
                                                <View className="flex-1">
                                                    <View className="flex-col items-start mb-1">
                                                        <CardTitle className="text-lg">
                                                            {vehicle.vehicle_name}
                                                        </CardTitle>
                                                        {vehicle.is_electric && (
                                                            <Badge variant="default" className="mb-1">
                                                                <View className="flex-row items-center">
                                                                    <Leaf size={10} color="#fff" />
                                                                    <Text className="text-white text-[10px] font-bold ml-1">
                                                                        ELECTRIC
                                                                    </Text>
                                                                </View>
                                                            </Badge>
                                                        )}
                                                    </View>
                                                    <Text className="text-xs text-muted-foreground">
                                                        {getVehicleTypeLabel(vehicle.vehicle_type)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </CardHeader>

                                    <CardContent>
                                        {/* Specifications */}
                                        <View className="space-y-3 mb-4">
                                            <SpecRow
                                                icon={<Package size={16} color="#6B7280" />}
                                                label="Capacity"
                                                value={`${vehicle.capacity_kg} kg`}
                                            />
                                            <SpecRow
                                                icon={<Ruler size={16} color="#6B7280" />}
                                                label="Dimensions"
                                                value={vehicle.dimensions}
                                            />
                                        </View>

                                        {/* Pricing */}
                                        <View className="pt-4 border-t border-border">
                                            <View className="flex-row items-center justify-between">
                                                <View>
                                                    <Text className="text-xs text-muted-foreground mb-1">
                                                        Starting Price
                                                    </Text>
                                                    <View className="flex-row items-center">
                                                        <Text className="text-2xl font-bold text-primary">
                                                            ₹{vehicle.base_price}
                                                        </Text>
                                                        <Text className="text-sm text-muted-foreground ml-1">
                                                            + ₹{vehicle.per_km_price}/km
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Button variant="outline" size="sm" onPress={() => router.push({
                                                    pathname: '/vehicles/[id]',
                                                    params: { id: vehicle.id },
                                                })}>
                                                    <Text className="text-primary text-xs font-semibold">
                                                        View Details
                                                    </Text>
                                                </Button>
                                            </View>
                                        </View>
                                    </CardContent>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function FilterTab({
    label,
    icon,
    isActive,
    onPress,
}: {
    label: string;
    icon?: React.ReactNode;
    isActive: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 py-2 rounded-md ${isActive ? 'bg-primary' : 'bg-transparent'
                }`}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center justify-center">
                {icon && <View className="mr-1">{icon}</View>}
                <Text
                    className={`text-center text-sm font-semibold ${isActive ? 'text-white' : 'text-muted-foreground'
                        }`}
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

function SpecRow({
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
            <View className="w-8 h-8 bg-secondary rounded-lg items-center justify-center mr-3">
                {icon}
            </View>
            <View className="flex-1">
                <Text className="text-xs text-muted-foreground">{label}</Text>
                <Text className="text-sm text-foreground font-semibold">{value}</Text>
            </View>
        </View>
    );
}