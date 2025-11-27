import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: number;
    username: string;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    user_type: string;
    company_name: string | null;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
    clearAuth: () => Promise<void>;
    loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    setAuth: async (user, accessToken, refreshToken) => {
        await AsyncStorage.multiSet([
            ['user', JSON.stringify(user)],
            ['accessToken', accessToken],
            ['refreshToken', refreshToken],
        ]);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
    },

    clearAuth: async () => {
        await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },

    loadAuth: async () => {
        const [user, accessToken, refreshToken] = await AsyncStorage.multiGet([
            'user',
            'accessToken',
            'refreshToken',
        ]);

        if (user[1] && accessToken[1] && refreshToken[1]) {
            set({
                user: JSON.parse(user[1]),
                accessToken: accessToken[1],
                refreshToken: refreshToken[1],
                isAuthenticated: true,
            });
        }
    },
}));

interface BookingState {
    pickupLocation: any | null;
    dropoffLocation: any | null;
    selectedVehicle: any | null;
    bookingType: string;
    itemsDescription: string;
    estimatedWeight: string;
    isGreenFleet: boolean;

    setPickupLocation: (location: any) => void;
    setDropoffLocation: (location: any) => void;
    setSelectedVehicle: (vehicle: any) => void;
    setBookingType: (type: string) => void;
    setItemsDescription: (desc: string) => void;
    setEstimatedWeight: (weight: string) => void;
    setIsGreenFleet: (value: boolean) => void;
    clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
    pickupLocation: null,
    dropoffLocation: null,
    selectedVehicle: null,
    bookingType: 'economy',
    itemsDescription: '',
    estimatedWeight: '',
    isGreenFleet: false,

    setPickupLocation: (location) => set({ pickupLocation: location }),
    setDropoffLocation: (location) => set({ dropoffLocation: location }),
    setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
    setBookingType: (type) => set({ bookingType: type }),
    setItemsDescription: (desc) => set({ itemsDescription: desc }),
    setEstimatedWeight: (weight) => set({ estimatedWeight: weight }),
    setIsGreenFleet: (value) => set({ isGreenFleet: value }),
    clearBooking: () => set({
        pickupLocation: null,
        dropoffLocation: null,
        selectedVehicle: null,
        bookingType: 'economy',
        itemsDescription: '',
        estimatedWeight: '',
        isGreenFleet: false,
    }),
}));