// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     ScrollView,
//     Alert,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { MapPin } from 'lucide-react-native';
// import { Button, Input, Card, CardContent } from '@/components/ui';
// import { useBookingStore } from '@/lib/store';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function PickupLocationScreen() {
//     const router = useRouter();
//     const setPickupLocation = useBookingStore((state) => state.setPickupLocation);

//     const [address, setAddress] = useState('');
//     const [contactName, setContactName] = useState('');
//     const [contactPhone, setContactPhone] = useState('');
//     const [errors, setErrors] = useState<any>({});

//     // Mock coordinates (in production, use geocoding API)
//     const mockCoordinates = {
//         lat: 11.0168,
//         lng: 76.9558,
//     };

//     const handleContinue = () => {
//         // Validate
//         const newErrors: any = {};
//         if (!address) newErrors.address = 'Address is required';
//         if (!contactName) newErrors.contactName = 'Contact name is required';
//         if (!contactPhone) newErrors.contactPhone = 'Contact phone is required';

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             return;
//         }

//         // Save to store
//         setPickupLocation({
//             address,
//             contactName,
//             contactPhone,
//             lat: mockCoordinates.lat,
//             lng: mockCoordinates.lng,
//         });

//         router.push('/booking/dropoff-location');
//     };

//     return (
//         <SafeAreaView className="flex-1 bg-background">
//             <ScrollView className="flex-1 px-6 py-6">
//                 {/* Info Card */}
//                 <Card className="mb-6">
//                     <CardContent className="flex-row items-start py-4">
//                         <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
//                             <MapPin size={20} color="#1E3A8A" />
//                         </View>
//                         <View className="flex-1">
//                             <Text className="text-sm font-semibold text-foreground mb-1">
//                                 Pickup Location
//                             </Text>
//                             <Text className="text-xs text-muted-foreground">
//                                 Enter the address where we should pick up your items
//                             </Text>
//                         </View>
//                     </CardContent>
//                 </Card>

//                 {/* Form */}
//                 <View className="space-y-4">
//                     <Input
//                         label="Pickup Address"
//                         placeholder="Enter complete address with landmarks"
//                         value={address}
//                         onChangeText={setAddress}
//                         multiline
//                         numberOfLines={3}
//                         error={errors.address}
//                         className="mb-4"
//                     />

//                     <Input
//                         label="Contact Person Name"
//                         placeholder="Who will hand over the items?"
//                         value={contactName}
//                         onChangeText={setContactName}
//                         error={errors.contactName}
//                         className="mb-4"
//                     />

//                     <Input
//                         label="Contact Phone Number"
//                         placeholder="Contact number for pickup"
//                         value={contactPhone}
//                         onChangeText={setContactPhone}
//                         keyboardType="phone-pad"
//                         error={errors.contactPhone}
//                         className="mb-6"
//                     />

//                     <Button
//                         onPress={handleContinue}
//                         size="lg"
//                     >
//                         <Text className='text-background'>
//                             Continue to Dropoff
//                         </Text>
//                     </Button>
//                 </View>
//             </ScrollView>
//         </SafeAreaView>
//     );
// }

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useBookingStore } from '@/lib/store';
import { GOOGLE_MAPS_API_KEY } from '@/lib/constants';

export default function PickupLocationScreen() {
  const router = useRouter();
  const setPickupLocation = useBookingStore((state) => state.setPickupLocation);
  const autocompleteRef = useRef<any>(null);
  
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<any>({});

  const handlePlaceSelect = (data: any, details: any) => {
    if (details) {
      setAddress(details.formatted_address);
      setCoordinates({
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng,
      });
    }
  };

  const handleContinue = () => {
    // Validate
    const newErrors: any = {};
    if (!address) newErrors.address = 'Please select a location';
    if (!contactName) newErrors.contactName = 'Contact name is required';
    if (!contactPhone) newErrors.contactPhone = 'Contact phone is required';
    if (coordinates.lat === 0) newErrors.address = 'Please select a valid location';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save to store
    setPickupLocation({
      address,
      contactName,
      contactPhone,
      lat: coordinates.lat,
      lng: coordinates.lng,
    });

    router.push('/booking/dropoff-location');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6 py-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <Card className="mb-6">
            <CardContent className="flex-row items-start py-4">
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                <MapPin size={20} color="#1E3A8A" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Pickup Location
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Search and select your pickup location
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Google Places Autocomplete */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              Search Location
            </Text>
            <GooglePlacesAutocomplete
              ref={autocompleteRef}
              placeholder="Search for pickup location..."
              fetchDetails={true}
              onPress={handlePlaceSelect}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
                components: 'country:in', // Restrict to India
              }}
              styles={{
                container: {
                  flex: 0,
                },
                textInputContainer: {
                  backgroundColor: 'transparent',
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                },
                textInput: {
                  height: 48,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  fontSize: 14,
                  color: '#111827',
                },
                predefinedPlacesDescription: {
                  color: '#1E3A8A',
                },
                listView: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  marginTop: 4,
                },
                row: {
                  padding: 13,
                  height: 60,
                  flexDirection: 'row',
                  backgroundColor: '#FFFFFF',
                },
                separator: {
                  height: 0.5,
                  backgroundColor: '#E5E7EB',
                },
                description: {
                  fontSize: 14,
                  color: '#111827',
                },
              }}
              enablePoweredByContainer={false}
              nearbyPlacesAPI="GooglePlacesSearch"
              debounce={400}
            />
            {errors.address && (
              <Text className="text-xs text-destructive mt-1">{errors.address}</Text>
            )}
          </View>

          {/* Selected Address Display */}
          {address ? (
            <View className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <Text className="text-xs text-green-700 font-semibold mb-1">
                Selected Location:
              </Text>
              <Text className="text-sm text-green-900">{address}</Text>
            </View>
          ) : null}

          {/* Contact Details */}
          <Input
            label="Contact Person Name"
            placeholder="Who will hand over the items?"
            value={contactName}
            onChangeText={setContactName}
            error={errors.contactName}
            className="mb-4"
          />

          <Input
            label="Contact Phone Number"
            placeholder="Contact number for pickup"
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
            error={errors.contactPhone}
            className="mb-6"
          />

          <Button
            onPress={handleContinue}
            size="lg"
            disabled={!address || !coordinates.lat}
          >
            Continue to Dropoff
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}