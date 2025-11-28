# Porter Logistics - React Native App

A modern logistics and delivery management application built with React Native (Expo), featuring real-time tracking, multiple service options, and business subscriptions.

![Porter Logistics](https://img.shields.io/badge/React%20Native-v0.74-blue)
![Expo](https://img.shields.io/badge/Expo-v51-black)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.3-blue)

## ✨ Features

### Core Features
- 🚚 **Multi-Vehicle Booking System** - Bikes, Mini Trucks, Trucks, and Tempos
- 📍 **Real-Time Tracking** - Live location updates and ETA
- 💳 **Multiple Payment Options** - UPI, Card, Wallet, and Cash
- ⭐ **Rating System** - Rate drivers and provide feedback
- 📸 **Proof System** - Upload pickup/dropoff photos

### Differentiated Features
- 🧮 **Equipment Utilization Calculator** - AI-powered vehicle recommendations
- 🎯 **Multiple Quote Options** - Fast, Economy, and Helper service types
- 🌱 **Green Fleet Option** - Electric vehicles with 5% discount
- 💼 **Business Subscriptions** - Monthly, Quarterly, and Yearly plans
- 📊 **Business Analytics** - Detailed insights and reporting

## 🏗️ Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: React Native Reusables
- **State Management**: Zustand
- **API Client**: Axios
- **Navigation**: Expo Router
- **Icons**: Lucide React Native

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Studio
- Backend API running (see backend README)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd porter-logistics-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment

Update the API base URL in `lib/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000/api'; 
// Replace YOUR_IP_ADDRESS with your computer's IP
// Example: http://192.168.1.100:8000/api
```

**Finding Your IP Address:**
- **Mac/Linux**: `ifconfig | grep inet`
- **Windows**: `ipconfig`

⚠️ **Important**: Don't use `localhost` or `127.0.0.1` when testing on physical devices!

### 4. Start the Development Server
```bash
npx expo start
```

### 5. Run on Device/Emulator

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan QR code with Expo Go app

## 📱 App Structure
```
porter-logistics-app/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── index.tsx             # Home screen
│   │   ├── bookings.tsx          # Active bookings
│   │   ├── history.tsx           # Booking history
│   │   └── profile.tsx           # User profile
│   ├── booking/                  # Booking flow screens
│   │   ├── pickup-location.tsx
│   │   ├── dropoff-location.tsx
│   │   ├── item-details.tsx
│   │   ├── vehicle-selection.tsx
│   │   ├── quotes.tsx
│   │   └── confirm.tsx
│   ├── payment/                  # Payment screens
│   │   └── [id].tsx
│   ├── tracking/                 # Tracking screens
│   │   └── [id].tsx
│   ├── vehicles/                 # Vehicle screens
│   │   ├── list.tsx
│   │   └── [id].tsx
│   ├── subscription/             # Subscription screens
│   │   ├── plans.tsx
│   │   └── analytics.tsx
│   ├── rating/                   # Rating screen
│   │   └── [id].tsx
│   └── _layout.tsx               # Root layout
├── components/                    # Reusable components
│   └── ui/                       # UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── separator.tsx
├── lib/                          # Utilities
│   ├── api.ts                    # API client & endpoints
│   ├── store.ts                  # Zustand state management
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Helper functions
├── constants/                     # Constants
│   └── Colors.ts                 # Theme colors
├── assets/                       # Images, fonts, etc.
└── package.json
```

## 🎯 Key Screens & Features

### Authentication
- **Login** - Phone number and password authentication
- **Register** - User type selection (Personal/Business) with company details

### Home Screen
- Quick booking button
- Feature highlights
- Popular vehicles showcase
- Subscription banner (business users)

### Booking Flow
1. **Pickup Location** - Address and contact details
2. **Dropoff Location** - Delivery address
3. **Item Details** - Description, weight, and utilization calculator
4. **Vehicle Selection** - Browse and filter vehicles
5. **Quote Comparison** - Compare Fast, Economy, and Helper options
6. **Confirmation** - Review and confirm booking
7. **Payment** - Multiple payment methods

### Active Bookings
- List of ongoing deliveries
- Real-time status updates
- Quick access to tracking

### Tracking
- Live driver location
- ETA updates
- Driver details and contact
- Proof media viewing

### Profile
- User information
- Subscription management (business users)
- Settings and preferences
- Logout

### Business Features
- **Subscription Plans** - View and subscribe to plans
- **Analytics Dashboard** - Booking statistics, spending, vehicle usage

## 🔑 User Types & Access

### Personal Account
- Create bookings
- Track deliveries
- Payment options
- Rating system
- Booking history

### Business Account
- All Personal features
- Subscribe to plans
- Business analytics
- Priority support
- Custom invoicing
- Volume discounts

## 🎨 Theme Support

The app supports both light and dark themes:
```typescript
// Automatically detects system theme
import { useColorScheme } from 'nativewind';

const { colorScheme } = useColorScheme(); // 'light' or 'dark'
```

## 🧪 Testing

### Testing User Accounts

You can create test accounts:

**Personal User:**
```
Username: john_doe
Phone: 9876543210
Password: test123
```

**Business User:**
```
Username: acme_corp
Phone: 9876543211
Password: test123
Company: Acme Corporation
```

### Testing Features

1. **Equipment Calculator**: Enter weight and dimensions in item details
2. **Quote Comparison**: View all three service types
3. **Green Fleet**: Enable in item details, filter electric vehicles
4. **Subscription**: Register as business user, go to Profile → Subscriptions
5. **Analytics**: Subscribe first, then access via Profile

## 📦 Building for Production

### iOS
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios
```

### Android
```bash
# Build APK
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

## 🐛 Common Issues & Solutions

### 1. "Network Error" or "Request Failed"

**Solution**: Check API base URL in `lib/api.ts`
- Ensure backend is running
- Use correct IP address (not localhost)
- Check firewall settings

### 2. "Cannot connect to Metro"

**Solution**:
```bash
# Clear cache
npx expo start -c

# Or reset project
rm -rf node_modules
npm install
```

### 3. Android Build Errors

**Solution**:
```bash
cd android
./gradlew clean
cd ..
npx expo start
```

### 4. "Module not found" errors

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables

Create a `.env` file (optional):
```bash
API_BASE_URL=http://192.168.1.100:8000/api
```

Then update `lib/api.ts`:
```typescript
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.100:8000/api';
```

## 🔐 Security Notes

- JWT tokens stored in AsyncStorage
- Automatic token refresh on 401 errors
- Secure password input fields
- Protected API routes

## 📈 Performance Optimization

- Image lazy loading
- List virtualization with FlatList
- Memoized components
- Debounced search inputs
- Cached API responses
