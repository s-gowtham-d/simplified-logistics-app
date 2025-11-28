import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Award,
    Check,
    X,
    Crown,
    Zap,
    TrendingUp,
} from 'lucide-react-native';
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Badge,
} from '@/components/ui';
import { subscriptionsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const PLAN_ICONS: any = {
    monthly: Zap,
    quarterly: TrendingUp,
    yearly: Crown,
};

const PLAN_COLORS: any = {
    monthly: '#3B82F6',
    quarterly: '#F59E0B',
    yearly: '#8B5CF6',
};

export default function SubscriptionPlansScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await subscriptionsAPI.getPlans();
            setPlans(response.data.results);
        } catch (error) {
            console.error('Error fetching plans:', error);
            Alert.alert('Error', 'Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (plan: any) => {
        if (user?.user_type !== 'business') {
            Alert.alert(
                'Business Account Required',
                'Subscriptions are only available for business accounts. Please update your account type.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Confirm Subscription',
            `Subscribe to ${plan.name} for ₹${plan.price}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Subscribe',
                    onPress: async () => {
                        setSubscribing(true);
                        setSelectedPlan(plan);

                        try {
                            await subscriptionsAPI.subscribe({ plan_id: plan.id });
                            Alert.alert(
                                'Success! 🎉',
                                'You have successfully subscribed to ' + plan.name,
                                [
                                    {
                                        text: 'View Analytics',
                                        onPress: () => router.replace('/subscription/analytics'),
                                    },
                                ]
                            );
                        } catch (error: any) {
                            const errorMsg = error.response?.data?.error || 'Failed to subscribe. Please try again.';
                            Alert.alert('Subscription Failed', errorMsg);
                        } finally {
                            setSubscribing(false);
                            setSelectedPlan(null);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text className="text-muted-foreground mt-4">Loading plans...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-6 py-6 border-b border-border">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <X size={24} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-foreground mb-2">
                    Business Subscriptions
                </Text>
                <Text className="text-sm text-muted-foreground">
                    Save money with recurring bookings and exclusive features
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 py-6">
                    {/* Benefits Banner */}
                    <Card className="mb-6 bg-primary border-0">
                        <CardContent className="py-6">
                            <View className="flex-row items-center mb-3">
                                <Award size={24} color="#fff" />
                                <Text className="text-xl font-bold text-white ml-2">
                                    Subscription Benefits
                                </Text>
                            </View>
                            <View className="space-y-2">
                                <BenefitItem text="Save up to 15% on all bookings" />
                                <BenefitItem text="Priority customer support" />
                                <BenefitItem text="Business analytics dashboard" />
                                <BenefitItem text="Custom invoicing & reports" />
                            </View>
                        </CardContent>
                    </Card>

                    {/* Plans */}
                    <View className="space-y-4">
                        {plans.map((plan: any) => {
                            const IconComponent = PLAN_ICONS[plan.plan_type] || Award;
                            const isPopular = plan.plan_type === 'quarterly';

                            return (
                                <Card
                                    key={plan.id}
                                    className={isPopular ? 'border-primary border-2' : ''}
                                >
                                    {isPopular && (
                                        <View className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                            <Badge variant="default">
                                                <Text className="text-white text-xs font-bold">
                                                    MOST POPULAR
                                                </Text>
                                            </Badge>
                                        </View>
                                    )}

                                    <CardHeader>
                                        <View className="flex-row items-center justify-between mb-2">
                                            <View className="flex-row items-center">
                                                <View
                                                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                                                    style={{ backgroundColor: PLAN_COLORS[plan.plan_type] + '20' }}
                                                >
                                                    <IconComponent size={24} color={PLAN_COLORS[plan.plan_type]} />
                                                </View>
                                                <View>
                                                    <CardTitle>{plan.name}</CardTitle>
                                                    <Text className="text-xs text-muted-foreground mt-1">
                                                        {plan.plan_type.toUpperCase()} PLAN
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </CardHeader>

                                    <CardContent>
                                        {/* Price */}
                                        <View className="mb-4">
                                            <View className="flex-row items-baseline">
                                                <Text className="text-3xl font-bold text-foreground">
                                                    ₹{plan.price}
                                                </Text>
                                                <Text className="text-sm text-muted-foreground ml-2">
                                                    / {plan.plan_type}
                                                </Text>
                                            </View>
                                            <View className="mt-2">
                                                <Badge variant="default">
                                                    <Text className="text-white text-xs font-semibold">
                                                        SAVE {plan.discount_percentage}%
                                                    </Text>
                                                </Badge>
                                            </View>
                                        </View>

                                        {/* Features */}
                                        <View className="space-y-3 mb-4">
                                            <FeatureItem
                                                text={`${plan.bookings_included} bookings included`}
                                                included={true}
                                            />
                                            <FeatureItem
                                                text={`${plan.discount_percentage}% discount on all bookings`}
                                                included={true}
                                            />
                                            <FeatureItem
                                                text="Custom invoicing"
                                                included={plan.custom_invoicing}
                                            />
                                            <FeatureItem
                                                text="Priority support"
                                                included={plan.priority_support}
                                            />
                                            <FeatureItem
                                                text="Dedicated account manager"
                                                included={plan.dedicated_account_manager}
                                            />
                                            <FeatureItem
                                                text="Business analytics"
                                                included={true}
                                            />
                                        </View>

                                        {/* Subscribe Button */}
                                        <Button
                                            onPress={() => handleSubscribe(plan)}
                                            size="lg"
                                            disabled={subscribing}
                                            loading={subscribing && selectedPlan?.id === plan.id}
                                        >
                                            <Text className="text-white font-semibold">
                                                {subscribing && selectedPlan?.id === plan.id
                                                    ? 'Processing...'
                                                    : 'Subscribe Now'}
                                            </Text>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </View>

                    {/* FAQ or Additional Info */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Why Subscribe?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Text className="text-sm text-muted-foreground leading-6">
                                Subscriptions are perfect for businesses with regular delivery needs.
                                Save money, get priority support, and access powerful analytics to
                                optimize your logistics operations. Cancel anytime.
                            </Text>
                        </CardContent>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function BenefitItem({ text }: { text: string }) {
    return (
        <View className="flex-row items-center">
            <Check size={16} color="#fff" />
            <Text className="text-sm text-white ml-2">{text}</Text>
        </View>
    );
}

function FeatureItem({ text, included }: { text: string; included: boolean }) {
    return (
        <View className="flex-row items-center">
            <View
                className={`w-5 h-5 rounded-full items-center justify-center ${included ? 'bg-green-100' : 'bg-gray-100'
                    }`}
            >
                {included ? (
                    <Check size={14} color="#10B981" />
                ) : (
                    <X size={14} color="#9CA3AF" />
                )}
            </View>
            <Text
                className={`text-sm ml-2 ${included ? 'text-foreground' : 'text-muted-foreground'
                    }`}
            >
                {text}
            </Text>
        </View>
    );
}