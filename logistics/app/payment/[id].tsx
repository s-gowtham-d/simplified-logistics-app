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
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    CreditCard,
    Smartphone,
    Banknote,
    Wallet,
    Check,
    Shield,
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
import { bookingsAPI, paymentsAPI } from '@/lib/api';

const PAYMENT_METHODS = [
    {
        id: 'upi',
        name: 'UPI',
        icon: Smartphone,
        description: 'Pay using UPI apps',
        color: '#10B981',
    },
    {
        id: 'card',
        name: 'Card',
        icon: CreditCard,
        description: 'Credit or Debit card',
        color: '#3B82F6',
    },
    {
        id: 'wallet',
        name: 'Wallet',
        icon: Wallet,
        description: 'Paytm, PhonePe, Google Pay',
        color: '#F59E0B',
    },
    {
        id: 'cash',
        name: 'Cash',
        icon: Banknote,
        description: 'Pay on delivery',
        color: '#6B7280',
    },
];

export default function PaymentScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const bookingId = parseInt(id as string);

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchBooking();
    }, []);

    const fetchBooking = async () => {
        try {
            const response = await bookingsAPI.getById(bookingId);
            setBooking(response.data);
        } catch (error) {
            console.error('Error fetching booking:', error);
            Alert.alert('Error', 'Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);

        try {
            // Initiate payment
            const initiateResponse = await paymentsAPI.initiate({
                booking_id: bookingId,
                payment_method: selectedMethod,
            });

            const payment = initiateResponse.data.payment;

            // For cash, just confirm
            if (selectedMethod === 'cash') {
                Alert.alert(
                    'Cash Payment Selected',
                    'Please pay ₹' + booking.final_price + ' to the driver on delivery.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/(tabs)/bookings'),
                        },
                    ]
                );
                return;
            }

            // For digital payments, simulate gateway
            setTimeout(async () => {
                try {
                    // Verify payment
                    await paymentsAPI.verify({
                        payment_id: payment.id,
                    });

                    Alert.alert(
                        'Payment Successful! ✅',
                        'Your booking is confirmed. Track your delivery from the Bookings tab.',
                        [
                            {
                                text: 'View Booking',
                                onPress: () => router.replace('/(tabs)/bookings'),
                            },
                        ]
                    );
                } catch (error) {
                    Alert.alert('Payment Failed', 'Please try again');
                } finally {
                    setProcessing(false);
                }
            }, 2000);
        } catch (error: any) {
            console.error('Payment error:', error.response?.data);
            Alert.alert('Payment Failed', 'Failed to process payment. Please try again.');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text className="text-muted-foreground mt-4">Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="px-6 py-6">
                    {/* Header */}
                    <View className="mb-6">
                        <Text className="text-2xl font-bold text-foreground mb-2">
                            Complete Payment
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                            Booking ID: #{bookingId}
                        </Text>
                    </View>

                    {/* Amount Card */}
                    <Card className="mb-6">
                        <CardContent className="py-6 items-center">
                            <Text className="text-sm text-muted-foreground mb-2">Amount to Pay</Text>
                            <Text className="text-4xl font-bold text-primary mb-4">
                                ₹{booking?.final_price}
                            </Text>
                            <View className="flex-row items-center">
                                <Shield size={16} color="#10B981" />
                                <Text className="text-xs text-muted-foreground ml-2">
                                    Secure payment powered by Logistics
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-foreground mb-4">
                            Select Payment Method
                        </Text>

                        <View className="space-y-3 flex-col gap-2">
                            {PAYMENT_METHODS.map((method) => {
                                const IconComponent = method.icon;
                                const isSelected = selectedMethod === method.id;

                                return (
                                    <TouchableOpacity
                                        key={method.id}
                                        onPress={() => setSelectedMethod(method.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Card className={isSelected ? 'border-primary border-2' : ''}>
                                            <CardContent className="flex-row items-center py-4">
                                                <View
                                                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                                                    style={{ backgroundColor: method.color + '20' }}
                                                >
                                                    <IconComponent size={24} color={method.color} />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-base font-semibold text-foreground mb-1">
                                                        {method.name}
                                                    </Text>
                                                    <Text className="text-xs text-muted-foreground">
                                                        {method.description}
                                                    </Text>
                                                </View>
                                                {isSelected && (
                                                    <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                                                        <Check size={16} color="#fff" />
                                                    </View>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Booking Summary */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Booking Summary</CardTitle>
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
                                    <Text className="text-foreground">
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
                            <View className="flex-row justify-between">
                                <Text className="text-sm text-muted-foreground">Est. Duration</Text>
                                <Text className="text-sm text-foreground">
                                    {booking?.duration_mins} mins
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Pay Button */}
                    <Button
                        onPress={handlePayment}
                        loading={processing}
                        size="lg"
                        disabled={!selectedMethod}
                    >
                        <Text className='text-background'>
                            {processing ? 'Processing...' : `Pay ₹${booking?.final_price}`}

                        </Text>
                    </Button>

                    {/* Security Note */}
                    <View className="mt-6 items-center">
                        <Text className="text-xs text-muted-foreground text-center">
                            Your payment is secured with 256-bit encryption
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}