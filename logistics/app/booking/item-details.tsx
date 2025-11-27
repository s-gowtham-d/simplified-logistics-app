import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Package, Calculator, Leaf } from 'lucide-react-native';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useBookingStore } from '@/lib/store';
import { vehiclesAPI } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ItemDetailsScreen() {
    const router = useRouter();
    const {
        setItemsDescription,
        setEstimatedWeight,
        setIsGreenFleet,
        isGreenFleet,
    } = useBookingStore();

    const [description, setDescription] = useState('');
    const [weight, setWeight] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const handleCalculateVehicle = async () => {
        if (!weight || !dimensions) {
            Alert.alert('Missing Information', 'Please enter weight and dimensions to calculate');
            return;
        }

        setCalculating(true);
        try {
            const response = await vehiclesAPI.calculateVehicle({
                weight_kg: parseFloat(weight),
                dimensions: dimensions,
                item_description: description,
            });

            const recommended = response.data.recommended_vehicle;

            Alert.alert(
                'Recommended Vehicle',
                `${recommended.vehicle.vehicle_name}\n\n` +
                `Vehicle Utilization: ${recommended.utilization_percentage}%\n` +
                `Weight Utilization: ${recommended.weight_utilization}%\n\n` +
                `This vehicle is optimal for your needs!`,
                [
                    { text: 'OK', onPress: () => { } }
                ]
            );
        } catch (error: any) {
            console.error('Calculate error:', error);
            Alert.alert('Error', 'Failed to calculate vehicle recommendation');
        } finally {
            setCalculating(false);
        }
    };

    const handleContinue = () => {
        // Validate
        const newErrors: any = {};
        if (!description) newErrors.description = 'Item description is required';
        if (!weight) newErrors.weight = 'Estimated weight is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Save to store
        setItemsDescription(description);
        setEstimatedWeight(weight);

        router.push('/booking/vehicle-selection');
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 px-6 py-6">
                {/* Info Card */}
                <Card className="mb-6">
                    <CardContent className="flex-row items-start py-4">
                        <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                            <Package size={20} color="#F59E0B" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-foreground mb-1">
                                Item Details
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                                Tell us about the items you want to transport
                            </Text>
                        </View>
                    </CardContent>
                </Card>

                {/* Form */}
                <View className="space-y-4">
                    <Input
                        label="Item Description"
                        placeholder="E.g., Furniture, Electronics, Documents"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        error={errors.description}
                        className="mb-4"
                    />

                    <Input
                        label="Estimated Weight (kg)"
                        placeholder="E.g., 50"
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        error={errors.weight}
                        className="mb-4"
                    />

                    <Input
                        label="Dimensions (Optional)"
                        placeholder="E.g., 4x3x2 (in feet)"
                        value={dimensions}
                        onChangeText={setDimensions}
                        className="mb-4"
                    />

                    {/* Equipment Utilization Calculator */}
                    <Card className="mb-4 bg-blue-50 border-blue-200">
                        <CardContent className="py-4">
                            <View className="flex-row items-center mb-3">
                                <Calculator size={20} color="#1E3A8A" />
                                <Text className="text-sm font-semibold text-foreground ml-2">
                                    Equipment Utilization Calculator
                                </Text>
                            </View>
                            <Text className="text-xs text-muted-foreground mb-3">
                                Get AI-powered vehicle recommendation based on your item details
                            </Text>
                            <Button
                                onPress={handleCalculateVehicle}
                                variant="outline"
                                size="sm"
                                loading={calculating}
                                disabled={!weight || !dimensions}
                            >
                                Calculate Best Vehicle
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Green Fleet Option */}
                    <TouchableOpacity
                        onPress={() => setIsGreenFleet(!isGreenFleet)}
                        activeOpacity={0.7}
                    >
                        <Card className={isGreenFleet ? 'border-green-500 border-2' : ''}>
                            <CardContent className="flex-row items-center justify-between py-4">
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isGreenFleet ? 'bg-green-500' : 'bg-green-100'
                                        }`}>
                                        <Leaf size={20} color={isGreenFleet ? '#fff' : '#10B981'} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold text-foreground mb-1">
                                            Green Fleet Option
                                        </Text>
                                        <Text className="text-xs text-muted-foreground">
                                            Choose electric vehicles • 5% discount
                                        </Text>
                                    </View>
                                </View>
                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isGreenFleet ? 'border-green-500 bg-green-500' : 'border-gray-300'
                                    }`}>
                                    {isGreenFleet && (
                                        <View className="w-3 h-3 bg-white rounded-full" />
                                    )}
                                </View>
                            </CardContent>
                        </Card>
                    </TouchableOpacity>

                    <Button
                        onPress={handleContinue}
                        size="lg"
                        className="mt-6"
                    >
                        <Text className='text-background'>
                            Continue to Vehicle Selection
                        </Text>
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}