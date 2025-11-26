import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://172.26.80.1:8000/api'; // Change to IP

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    await AsyncStorage.setItem('accessToken', access);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                // You can add navigation to login here
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// API endpoints
export const authAPI = {
    register: (data: any) => api.post('/auth/register/', data),
    login: (data: any) => api.post('/auth/login/', data),
    getProfile: () => api.get('/auth/profile/'),
    updateProfile: (data: any) => api.put('/auth/profile/', data),
};

export const vehiclesAPI = {
    getAll: (params?: any) => api.get('/vehicles/', { params }),
    getById: (id: number) => api.get(`/vehicles/${id}/`),
    calculateVehicle: (data: any) => api.post('/vehicles/calculate_vehicle/', data),
};

export const bookingsAPI = {
    getAll: () => api.get('/bookings/'),
    getById: (id: number) => api.get(`/bookings/${id}/`),
    create: (data: any) => api.post('/bookings/', data),
    getQuote: (data: any) => api.post('/bookings/get_quote/', data),
    getAllQuotes: (data: any) => api.post('/bookings/get_all_quotes/', data),
    cancel: (id: number) => api.post(`/bookings/${id}/cancel/`),
    rate: (id: number, data: any) => api.post(`/bookings/${id}/rate/`, data),
};

export const proofAPI = {
    upload: (formData: FormData) =>
        api.post('/proof/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getByBooking: (bookingId: number) =>
        api.get('/proof/by_booking/', { params: { booking_id: bookingId } }),
};

export const paymentsAPI = {
    initiate: (data: any) => api.post('/payments/initiate/', data),
    verify: (data: any) => api.post('/payments/verify/', data),
    getByBooking: (bookingId: number) =>
        api.get('/payments/by_booking/', { params: { booking_id: bookingId } }),
};

export const trackingAPI = {
    getLive: (bookingId: number) =>
        api.get('/tracking/live/', { params: { booking_id: bookingId } }),
    getByBooking: (bookingId: number) =>
        api.get('/tracking/by_booking/', { params: { booking_id: bookingId } }),
};

export const subscriptionsAPI = {
    getPlans: () => api.get('/plans/'),
    getAll: () => api.get('/subscriptions/'),
    subscribe: (data: any) => api.post('/subscriptions/', data),
    getActive: () => api.get('/subscriptions/active/'),
    getAnalytics: () => api.get('/subscriptions/analytics/'),
    cancel: (id: number) => api.post(`/subscriptions/${id}/cancel/`),
};