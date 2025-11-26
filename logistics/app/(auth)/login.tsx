import React, { useState } from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Truck } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const handleLogin = async () => {
        // Validate
        const newErrors: any = {};
        if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await authAPI.login({
                phone_number: phoneNumber,
                password,
            });

            const { user, tokens } = response.data;
            await setAuth(user, tokens.access, tokens.refresh);

            Alert.alert('Success', 'Logged in successfully!');
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Login error:', error.response?.data);
            Alert.alert(
                'Login Failed',
                error.response?.data?.error || 'Invalid credentials. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerClassName="flex-grow justify-center px-6"
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo/Branding */}
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4">
                            <Truck size={40} color="#fff" />
                        </View>
                        <Text className="text-3xl font-bold text-foreground">Porter Logistics</Text>
                        <Text className="text-muted-foreground mt-2">
                            Your trusted delivery partner
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View className="space-y-4">
                        <Text className="text-2xl font-bold text-foreground mb-6">
                            Welcome Back
                        </Text>

                        <Input
                            label="Phone Number"
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            error={errors.phoneNumber}
                            className="mb-4"
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            error={errors.password}
                            className="mb-6"
                        />
                        <Button
                            onPress={handleLogin}
                            loading={loading}
                            size="lg"
                            className="mb-4"
                        >
                            <Text className='text-background'>
                                Login
                            </Text>
                        </Button>

                        <View className="flex-row justify-center items-center">
                            <Text className="text-muted-foreground">
                                Don't have an account?{' '}
                            </Text>
                            <Pressable
                                onPress={() => router.push('/(auth)/register')}
                                className="px-1"
                            >
                                <Text className="text-muted-foreground">

                                    Sign Up
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}