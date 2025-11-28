import React, { useState } from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Truck, User, Building, Check } from 'lucide-react-native';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function RegisterScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone_number: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: '',
        user_type: 'customer',
        company_name: '',
        gst_number: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const handleRegister = async () => {
        // Validate
        const newErrors: any = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = 'Passwords do not match';
        }

        // Business validation
        if (formData.user_type === 'business') {
            if (!formData.company_name) newErrors.company_name = 'Company name is required for business accounts';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // Only send company fields if business user
            const registrationData = {
                ...formData,
                company_name: formData.user_type === 'business' ? formData.company_name : undefined,
                gst_number: formData.user_type === 'business' ? formData.gst_number : undefined,
            };

            const response = await authAPI.register(registrationData);

            const { user, tokens } = response.data;
            await setAuth(user, tokens.access, tokens.refresh);

            Alert.alert('Success', 'Account created successfully!');
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Register error:', error.response?.data);
            const errorData = error.response?.data;

            if (errorData) {
                setErrors(errorData);
                Alert.alert('Registration Failed', 'Please check the form and try again.');
            } else {
                Alert.alert('Registration Failed', 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo */}
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-3">
                            <Truck size={32} color="#fff" />
                        </View>
                        <Text className="text-2xl font-bold text-foreground">Create Account</Text>
                        <Text className="text-sm text-muted-foreground mt-1">
                            Join Porter Logistics today
                        </Text>
                    </View>

                    {/* User Type Selection */}
                    <View className="mb-6">
                        <Text className="text-sm font-semibold text-foreground mb-3">
                            Account Type
                        </Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setFormData({ ...formData, user_type: 'customer' })}
                                activeOpacity={0.7}
                                className="flex-1"
                            >
                                <Card className={formData.user_type === 'customer' ? 'border-primary border-2' : ''}>
                                    <CardContent className="items-center py-4">
                                        <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center mb-2">
                                            <User size={24} color="#1E3A8A" />
                                        </View>
                                        <Text className="text-sm font-semibold text-foreground mb-1">
                                            Personal
                                        </Text>
                                        <Text className="text-xs text-muted-foreground text-center">
                                            For individual use
                                        </Text>
                                        {formData.user_type === 'customer' && (
                                            <View className="absolute top-2 right-2">
                                                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                                                    <Check size={14} color="#fff" />
                                                </View>
                                            </View>
                                        )}
                                    </CardContent>
                                </Card>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setFormData({ ...formData, user_type: 'business' })}
                                activeOpacity={0.7}
                                className="flex-1"
                            >
                                <Card className={formData.user_type === 'business' ? 'border-primary border-2' : ''}>
                                    <CardContent className="items-center py-4">
                                        <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mb-2">
                                            <Building size={24} color="#10B981" />
                                        </View>
                                        <Text className="text-sm font-semibold text-foreground mb-1">
                                            Business
                                        </Text>
                                        <Text className="text-xs text-muted-foreground text-center">
                                            For companies
                                        </Text>
                                        {formData.user_type === 'business' && (
                                            <View className="absolute top-2 right-2">
                                                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                                                    <Check size={14} color="#fff" />
                                                </View>
                                            </View>
                                        )}
                                    </CardContent>
                                </Card>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Register Form */}
                    <View>
                        <Input
                            label="Username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChangeText={(text) => setFormData({ ...formData, username: text })}
                            error={errors.username?.[0]}
                            className="mb-4"
                        />

                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                                    error={errors.first_name?.[0]}
                                />
                            </View>
                            <View className="flex-1">
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    value={formData.last_name}
                                    onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                                    error={errors.last_name?.[0]}
                                />
                            </View>
                        </View>

                        <Input
                            label="Email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            error={errors.email?.[0]}
                            className="mb-4"
                        />

                        <Input
                            label="Phone Number"
                            placeholder="9876543210"
                            value={formData.phone_number}
                            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                            keyboardType="phone-pad"
                            error={errors.phone_number?.[0]}
                            className="mb-4"
                        />

                        {/* Business Fields */}
                        {formData.user_type === 'business' && (
                            <>
                                <View className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <Text className="text-xs text-blue-700">
                                        ℹ️ Business accounts get access to subscriptions, analytics, and bulk booking features
                                    </Text>
                                </View>

                                <Input
                                    label="Company Name *"
                                    placeholder="Your Company Name"
                                    value={formData.company_name}
                                    onChangeText={(text) => setFormData({ ...formData, company_name: text })}
                                    error={errors.company_name?.[0]}
                                    className="mb-4"
                                />

                                <Input
                                    label="GST Number (Optional)"
                                    placeholder="22AAAAA0000A1Z5"
                                    value={formData.gst_number}
                                    onChangeText={(text) => setFormData({ ...formData, gst_number: text })}
                                    error={errors.gst_number?.[0]}
                                    className="mb-4"
                                />
                            </>
                        )}

                        <Input
                            label="Password"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                            error={errors.password?.[0]}
                            className="mb-4"
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            value={formData.password_confirm}
                            onChangeText={(text) => setFormData({ ...formData, password_confirm: text })}
                            secureTextEntry
                            error={errors.password_confirm}
                            className="mb-6"
                        />

                        <Button
                            onPress={handleRegister}
                            loading={loading}
                            size="lg"
                            className="mb-4"
                        >
                            <Text className="text-white font-semibold">
                                Create Account
                            </Text>
                        </Button>

                        <View className="flex-row justify-center items-center">
                            <Text className="text-muted-foreground">
                                Already have an account?{' '}
                            </Text>
                            <Pressable

                                onPress={() => router.push('/(auth)/login')}
                                className="px-1"
                            >
                                <Text className="text-muted-foreground">

                                    Login
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}