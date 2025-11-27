import React, { useState } from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Truck } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { SafeAreaView } from 'react-native-safe-area-context';

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

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await authAPI.register(formData);

            const { user, tokens } = response.data;
            await setAuth(user, tokens.access, tokens.refresh);

            Alert.alert('Success', 'Account created successfully!');
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Register error:', error.response?.data);
            const errorData = error.response?.data;

            if (errorData) {
                // Set field-specific errors
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
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 20,
                        paddingBottom: 40

                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo */}
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-3">
                            <Truck size={32} color="#fff" />
                        </View>
                        <Text className="text-2xl font-bold text-foreground">Create Account</Text>
                    </View>

                    {/* Register Form */}
                    <View className="space-y-4">
                        <Input
                            label="Username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChangeText={(text) => setFormData({ ...formData, username: text })}
                            error={errors.username?.[0]}
                            className="mb-4"
                        />

                        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                            <Input
                                label="First Name"
                                placeholder="John"
                                value={formData.first_name}
                                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                                error={errors.first_name?.[0]}
                                className="flex-1"
                            />
                            <Input
                                label="Last Name"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                                error={errors.last_name?.[0]}
                                className="flex-1"
                            />
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
                            <Text className='text-background'>

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
                                <Text className="text-foreground p-0 m-0">

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