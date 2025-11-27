import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    User,
    Mail,
    Phone,
    Building,
    CreditCard,
    Bell,
    Shield,
    HelpCircle,
    LogOut,
    ChevronRight,
    Award,
    Leaf,
} from 'lucide-react-native';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
    Separator,
} from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { subscriptionsAPI } from '@/lib/api';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const response = await subscriptionsAPI.getActive();
            if (response.data.subscription) {
                setSubscription(response.data.subscription);
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAuth();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Header */}
                <View className="px-6 pt-6 pb-4">
                    <Text className="text-3xl font-bold text-foreground">Profile</Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                        Manage your account settings
                    </Text>
                </View>

                {/* User Info Card */}
                <View className="px-6 mb-6">
                    <Card>
                        <CardContent className="py-6">
                            <View className="items-center">
                                <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
                                    <Text className="text-3xl text-white font-bold">
                                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                                    </Text>
                                </View>
                                <Text className="text-xl font-bold text-foreground mb-1">
                                    {user?.first_name} {user?.last_name}
                                </Text>
                                <Badge variant="secondary" className="mb-2">
                                    <Text className="text-xs font-semibold">
                                        {user?.user_type.toUpperCase()}
                                    </Text>
                                </Badge>
                                <Text className="text-sm text-muted-foreground">
                                    @{user?.username}
                                </Text>
                            </View>
                        </CardContent>
                    </Card>
                </View>

                {/* Subscription Card */}
                {user?.user_type === 'business' && (
                    <View className="px-6 mb-6">
                        <Card className="border-primary">
                            <CardHeader>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <Award size={20} color="#1E3A8A" />
                                        <CardTitle className="ml-2">Subscription</CardTitle>
                                    </View>
                                    {subscription && (
                                        <Badge variant="default">
                                            <Text className="text-white text-xs font-semibold">
                                                ACTIVE
                                            </Text>
                                        </Badge>
                                    )}
                                </View>
                            </CardHeader>
                            <CardContent>
                                {subscription ? (
                                    <View>
                                        <Text className="text-base font-semibold text-foreground mb-2">
                                            {subscription.plan_details.name}
                                        </Text>
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-sm text-muted-foreground">
                                                Bookings Used
                                            </Text>
                                            <Text className="text-sm text-foreground font-semibold">
                                                {subscription.bookings_used} / {subscription.plan_details.bookings_included}
                                            </Text>
                                        </View>
                                        <View className="flex-row justify-between mb-3">
                                            <Text className="text-sm text-muted-foreground">
                                                Remaining
                                            </Text>
                                            <Text className="text-sm text-primary font-semibold">
                                                {subscription.bookings_remaining} bookings
                                            </Text>
                                        </View>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onPress={() => router.push('/subscription/analytics')}
                                        >
                                            View Analytics
                                        </Button>
                                    </View>
                                ) : (
                                    <View>
                                        <Text className="text-sm text-muted-foreground mb-3">
                                            Subscribe to unlock business features and save on bookings
                                        </Text>
                                        <Button
                                            onPress={() => router.push('/subscription/plans')}
                                            size="sm"
                                        >
                                            View Plans
                                        </Button>
                                    </View>
                                )}
                            </CardContent>
                        </Card>
                    </View>
                )}

                {/* Contact Info */}
                <View className="px-6 mb-4">
                    <Text className="text-sm font-semibold text-muted-foreground mb-3">
                        CONTACT INFORMATION
                    </Text>
                    <Card>
                        <CardContent className="py-3">
                            <ProfileItem
                                icon={<Mail size={20} color="#6B7280" />}
                                label="Email"
                                value={user?.email || 'Not provided'}
                            />
                            <Separator className="my-3" />
                            <ProfileItem
                                icon={<Phone size={20} color="#6B7280" />}
                                label="Phone"
                                value={user?.phone_number || 'Not provided'}
                            />
                            {user?.company_name && (
                                <>
                                    <Separator className="my-3" />
                                    <ProfileItem
                                        icon={<Building size={20} color="#6B7280" />}
                                        label="Company"
                                        value={user.company_name}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </View>

                {/* Settings */}
                <View className="px-6 mb-4">
                    <Text className="text-sm font-semibold text-muted-foreground mb-3">
                        SETTINGS
                    </Text>
                    <Card>
                        <CardContent className="py-2">
                            <SettingsItem
                                icon={<Bell size={20} color="#6B7280" />}
                                label="Notifications"
                                onPress={() => Alert.alert('Coming Soon', 'Notification settings')}
                            />
                            <Separator className="my-2" />
                            <SettingsItem
                                icon={<Shield size={20} color="#6B7280" />}
                                label="Privacy & Security"
                                onPress={() => Alert.alert('Coming Soon', 'Privacy settings')}
                            />
                            <Separator className="my-2" />
                            <SettingsItem
                                icon={<CreditCard size={20} color="#6B7280" />}
                                label="Payment Methods"
                                onPress={() => Alert.alert('Coming Soon', 'Payment methods')}
                            />
                            <Separator className="my-2" />
                            <SettingsItem
                                icon={<Leaf size={20} color="#10B981" />}
                                label="Green Fleet Preferences"
                                onPress={() => Alert.alert('Coming Soon', 'Green fleet settings')}
                            />
                        </CardContent>
                    </Card>
                </View>

                {/* Support */}
                <View className="px-6 mb-6">
                    <Text className="text-sm font-semibold text-muted-foreground mb-3">
                        SUPPORT
                    </Text>
                    <Card>
                        <CardContent className="py-2">
                            <SettingsItem
                                icon={<HelpCircle size={20} color="#6B7280" />}
                                label="Help & Support"
                                onPress={() => Alert.alert('Support', 'Contact gowthamselvam809@gmail.com')}
                            />
                        </CardContent>
                    </Card>
                </View>

                {/* Logout Button */}
                <View className="px-6 mb-6">
                    <Button
                        onPress={handleLogout}
                        variant="destructive"
                        size="lg"
                    >
                        <View className="flex-row items-center">
                            <LogOut size={20} color="#fff" />
                            <Text className="text-white font-semibold ml-2">
                                Logout
                            </Text>
                        </View>
                    </Button>
                </View>

                {/* App Version */}
                <View className="items-center mb-4">
                    <Text className="text-xs text-muted-foreground">
                        Logistics v1.0.0
                    </Text>
                </View>
            </ScrollView >
        </SafeAreaView >
    );
}



function ProfileItem({
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
            <View className="w-10 h-10 bg-secondary rounded-full items-center justify-center mr-3">
                {icon}
            </View>
            <View className="flex-1">
                <Text className="text-xs text-muted-foreground mb-1">{label}</Text>
                <Text className="text-sm text-foreground">{value}</Text>
            </View>
        </View>
    );
}
function SettingsItem({
    icon,
    label,
    onPress,
}: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center py-3"
            activeOpacity={0.7}
        >
            <View className="w-10 h-10 bg-secondary rounded-full items-center justify-center mr-3">
                {icon}
            </View>
            <Text className="flex-1 text-sm text-foreground">{label}</Text>
            <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );
}