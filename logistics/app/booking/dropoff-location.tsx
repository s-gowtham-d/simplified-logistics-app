import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useBookingStore } from '@/lib/store';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DropoffLocationScreen() {
    const router = useRouter();
    const setDropoffLocation = useBookingStore((state) => state.setDropoffLocation);

    const [address, setAddress] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [errors, setErrors] = useState<any>({});

    // Mock coordinates
    const mockCoordinates = {
        lat: 11.0510,
        lng: 76.9973,
    };

    const handleContinue = () => {
        // Validate
        const newErrors: any = {};
        if (!address) newErrors.address = 'Address is required';
        if (!contactName) newErrors.contactName = 'Contact name is required';
        if (!contactPhone) newErrors.contactPhone = 'Contact phone is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Save to store
        setDropoffLocation({
            address,
            contactName,
            contactPhone,
            lat: mockCoordinates.lat,
            lng: mockCoordinates.lng,
        });

        router.push('/booking/item-details');
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 px-6 py-6">
                {/* Info Card */}
                <Card className="mb-6">
                    <CardContent className="flex-row items-start py-4">
                        <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                            <MapPin size={20} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-foreground mb-1">
                                Dropoff Location
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                                Where should we deliver your items?
                            </Text>
                        </View>
                    </CardContent>
                </Card>

                {/* Form */}
                <View className="space-y-4">
                    <Input
                        label="Dropoff Address"
                        placeholder="Enter complete delivery address"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={3}
                        error={errors.address}
                        className="mb-4"
                    />

                    <Input
                        label="Recipient Name"
                        placeholder="Who will receive the items?"
                        value={contactName}
                        onChangeText={setContactName}
                        error={errors.contactName}
                        className="mb-4"
                    />

                    <Input
                        label="Recipient Phone"
                        placeholder="Contact number for delivery"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                        keyboardType="phone-pad"
                        error={errors.contactPhone}
                        className="mb-6"
                    />

                    <Button
                        onPress={handleContinue}
                        size="lg"
                    >
                        <Text className='text-background'>
                            Continue to Item Details
                        </Text>
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}