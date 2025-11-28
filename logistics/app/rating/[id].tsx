import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Star, X } from 'lucide-react-native';
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui';
import { bookingsAPI } from '@/lib/api';

export default function RatingScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const bookingId = parseInt(id as string);

    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a rating before submitting');
            return;
        }

        setSubmitting(true);

        try {
            await bookingsAPI.rate(bookingId, {
                rating,
                feedback: feedback.trim(),
            });

            Alert.alert(
                'Thank You! ⭐',
                'Your feedback helps us improve our service',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Rating error:', error);
            Alert.alert('Error', 'Failed to submit rating. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-6 py-6 border-b border-border flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-bold text-foreground">
                        Rate Your Experience
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                        Booking #{bookingId}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                    <X size={24} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <View className="px-6 py-8">
                    {/* Rating Stars */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-center">
                                How was your delivery experience?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <View className="flex-row justify-center items-center py-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                        activeOpacity={0.7}
                                        className="mx-2"
                                    >
                                        <Star
                                            size={48}
                                            color={star <= rating ? '#F59E0B' : '#E5E7EB'}
                                            fill={star <= rating ? '#F59E0B' : 'transparent'}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {rating > 0 && (
                                <View className="items-center mt-2">
                                    <Text className="text-lg font-semibold text-foreground">
                                        {rating === 5 && '⭐ Excellent!'}
                                        {rating === 4 && '😊 Great!'}
                                        {rating === 3 && '🙂 Good'}
                                        {rating === 2 && '😐 Okay'}
                                        {rating === 1 && '😞 Poor'}
                                    </Text>
                                </View>
                            )}
                        </CardContent>
                    </Card>

                    {/* Feedback */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Tell us more (optional)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TextInput
                                className="w-full min-h-[120px] p-4 rounded-lg border border-border bg-background text-foreground"
                                placeholder="Share your experience with us..."
                                placeholderTextColor="#9CA3AF"
                                value={feedback}
                                onChangeText={setFeedback}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Button
                        onPress={handleSubmit}
                        loading={submitting}
                        disabled={rating === 0}
                        size="lg"
                    >
                        <Text className="text-background font-semibold">
                            Submit Rating
                        </Text>
                    </Button>

                    {/* Skip */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-4 items-center"
                    >
                        <Text className="text-sm text-muted-foreground">
                            Skip for now
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}