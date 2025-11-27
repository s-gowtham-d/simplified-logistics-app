import { Stack } from 'expo-router';

export default function BookingLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#1E3A8A',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="pickup-location"
                options={{ title: 'Pickup Location' }}
            />
            <Stack.Screen
                name="dropoff-location"
                options={{ title: 'Dropoff Location' }}
            />
            <Stack.Screen
                name="item-details"
                options={{ title: 'Item Details' }}
            />
            <Stack.Screen
                name="vehicle-selection"
                options={{ title: 'Select Vehicle' }}
            />
            <Stack.Screen
                name="quotes"
                options={{ title: 'Select Service' }}
            />
            <Stack.Screen
                name="confirm"
                options={{ title: 'Confirm Booking' }}
            />
        </Stack>
    );
}