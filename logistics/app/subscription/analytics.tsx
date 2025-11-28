import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    BarChart3,
    TrendingUp,
    Package,
    DollarSign,
    Star,
    Truck,
    X,
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
import { subscriptionsAPI } from '@/lib/api';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await subscriptionsAPI.getAnalytics();
            setAnalytics(response.data);
        } catch (error: any) {
            console.error('Error fetching analytics:', error);
            if (error.response?.status === 403) {
                Alert.alert(
                    'Subscription Required',
                    'Analytics are only available for subscribed users.',
                    [
                        {
                            text: 'View Plans',
                            onPress: () => router.replace('/subscription/plans'),
                        },
                        { text: 'Cancel', style: 'cancel' },
                    ]
                );
            } else {
                Alert.alert('Error', 'Failed to load analytics');
            }
            router.back();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text className="text-muted-foreground mt-4">Loading analytics...</Text>
            </SafeAreaView>
        );
    }

    const { subscription, analytics: data } = analytics;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-6 py-6 border-b border-border">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <X size={24} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-foreground mb-2">
                    Business Analytics
                </Text>
                <Text className="text-sm text-muted-foreground">
                    Insights into your logistics operations
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 py-6">
                    {/* Subscription Info */}
                    <Card className="mb-6 border-primary">
                        <CardHeader>
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <CardTitle>{subscription.plan}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {subscription.period}
                                    </CardDescription>
                                </View>
                                <Badge variant="default">
                                    <Text className="text-white text-xs font-bold">ACTIVE</Text>
                                </Badge>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-sm text-muted-foreground mb-1">
                                        Bookings Used
                                    </Text>
                                    <Text className="text-2xl font-bold text-foreground">
                                        {subscription.bookings_used}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-sm text-muted-foreground mb-1">
                                        Remaining
                                    </Text>
                                    <Text className="text-2xl font-bold text-primary">
                                        {subscription.bookings_remaining}
                                    </Text>
                                </View>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-foreground mb-4">
                            Key Metrics
                        </Text>
                        <View className="flex-row flex-wrap -mx-2">
                            <MetricCard
                                icon={<Package size={24} color="#3B82F6" />}
                                label="Total Bookings"
                                value={data.total_bookings.toString()}
                                bgColor="bg-blue-50"
                            />
                            <MetricCard
                                icon={<TrendingUp size={24} color="#10B981" />}
                                label="Completed"
                                value={data.completed_bookings.toString()}
                                bgColor="bg-green-50"
                            />
                            <MetricCard
                                icon={<DollarSign size={24} color="#F59E0B" />}
                                label="Total Spent"
                                value={`₹${data.total_spent}`}
                                bgColor="bg-orange-50"
                            />
                            <MetricCard
                                icon={<Star size={24} color="#EAB308" />}
                                label="Avg Rating"
                                value={data.average_rating.toFixed(1)}
                                bgColor="bg-yellow-50"
                            />
                        </View>
                    </View>

                    {/* Vehicle Type Breakdown */}
                    <Card className="mb-6">
                        <CardHeader>
                            <View className="flex-row items-center">
                                <Truck size={20} color="#6B7280" />
                                <CardTitle className="ml-2">Vehicle Usage</CardTitle>
                            </View>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(data.vehicle_type_breakdown).length === 0 ? (
                                <Text className="text-sm text-muted-foreground text-center py-4">
                                    No vehicle usage data yet
                                </Text>
                            ) : (
                                <View className="space-y-3">
                                    {Object.entries(data.vehicle_type_breakdown).map(
                                        ([type, count]: [string, any]) => (
                                            <VehicleUsageBar
                                                key={type}
                                                type={type}
                                                count={count}
                                                total={data.total_bookings}
                                            />
                                        )
                                    )}
                                </View>
                            )}
                        </CardContent>
                    </Card>

                    {/* Booking Type Breakdown */}
                    <Card className="mb-6">
                        <CardHeader>
                            <View className="flex-row items-center">
                                <BarChart3 size={20} color="#6B7280" />
                                <CardTitle className="ml-2">Service Type Distribution</CardTitle>
                            </View>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(data.booking_type_breakdown).length === 0 ? (
                                <Text className="text-sm text-muted-foreground text-center py-4">
                                    No service type data yet
                                </Text>
                            ) : (
                                <View className="space-y-3">
                                    {Object.entries(data.booking_type_breakdown).map(
                                        ([type, count]: [string, any]) => (
                                            <ServiceTypeBar
                                                key={type}
                                                type={type}
                                                count={count}
                                                total={data.total_bookings}
                                            />
                                        )
                                    )}
                                </View>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Stats */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="space-y-3">
                                <StatRow
                                    label="Completion Rate"
                                    value={`${((data.completed_bookings / data.total_bookings) * 100).toFixed(1)}%`}
                                />
                                <StatRow
                                    label="Cancellation Rate"
                                    value={`${((data.cancelled_bookings / data.total_bookings) * 100).toFixed(1)}%`}
                                />
                                <StatRow
                                    label="Average per Booking"
                                    value={`₹${(data.total_spent / data.total_bookings).toFixed(2)}`}
                                />
                            </View>
                        </CardContent>
                    </Card>

                    {/* Manage Subscription */}
                    <Button
                        variant="outline"
                        size="lg"
                        onPress={() => router.push('/subscription/plans')}
                    >
                        Manage Subscription
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function MetricCard({
    icon,
    label,
    value,
    bgColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    bgColor: string;
}) {
    return (
        <View className="w-1/2 p-2">
            <Card>
                <CardContent className="py-4">
                    <View className={`w-12 h-12 ${bgColor} rounded-xl items-center justify-center mb-3`}>
                        {icon}
                    </View>
                    <Text className="text-2xl font-bold text-foreground mb-1">
                        {value}
                    </Text>
                    <Text className="text-xs text-muted-foreground">{label}</Text>
                </CardContent>
            </Card>
        </View>
    );
}

function VehicleUsageBar({
    type,
    count,
    total,
}: {
    type: string;
    count: number;
    total: number;
}) {
    const percentage = (count / total) * 100;
    const vehicleNames: any = {
        bike: 'Two Wheeler',
        mini_truck: 'Mini Truck',
        truck: 'Truck',
        tempo: 'Tempo',
    };

    return (
        <View>
            <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-foreground font-semibold">
                    {vehicleNames[type] || type}
                </Text>
                <Text className="text-sm text-muted-foreground">
                    {count} bookings ({percentage.toFixed(0)}%)
                </Text>
            </View>
            <View className="h-2 bg-secondary rounded-full overflow-hidden">
                <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </View>
        </View>
    );
}

function ServiceTypeBar({
    type,
    count,
    total,
}: {
    type: string;
    count: number;
    total: number;
}) {
    const percentage = (count / total) * 100;
    const colors: any = {
        economy: 'bg-green-500',
        fast: 'bg-orange-500',
        helper: 'bg-blue-500',
    };

    return (
        <View>
            <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-foreground font-semibold capitalize">
                    {type}
                </Text>
                <Text className="text-sm text-muted-foreground">
                    {count} bookings ({percentage.toFixed(0)}%)
                </Text>
            </View>
            <View className="h-2 bg-secondary rounded-full overflow-hidden">
                <View
                    className={`h-full ${colors[type] || 'bg-primary'} rounded-full`}
                    style={{ width: `${percentage}%` }}
                />
            </View>
        </View>
    );
}

function StatRow({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between items-center">
            <Text className="text-sm text-muted-foreground">{label}</Text>
            <Text className="text-sm font-semibold text-foreground">{value}</Text>
        </View>
    );
}