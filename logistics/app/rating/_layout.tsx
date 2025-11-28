import { Stack } from 'expo-router';

export default function RatingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="[id]" />
        </Stack>
    );
}