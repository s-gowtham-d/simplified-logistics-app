// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     ScrollView,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { MapPin } from 'lucide-react-native';
// import { Button, Input, Card, CardContent } from '@/components/ui';
// import { useBookingStore } from '@/lib/store';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function DropoffLocationScreen() {
//     const router = useRouter();
//     const setDropoffLocation = useBookingStore((state) => state.setDropoffLocation);

//     const [address, setAddress] = useState('');
//     const [contactName, setContactName] = useState('');
//     const [contactPhone, setContactPhone] = useState('');
//     const [errors, setErrors] = useState<any>({});

//     // Mock coordinates
//     const mockCoordinates = {
//         lat: 11.0510,
//         lng: 76.9973,
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
//         setDropoffLocation({
//             address,
//             contactName,
//             contactPhone,
//             lat: mockCoordinates.lat,
//             lng: mockCoordinates.lng,
//         });

//         router.push('/booking/item-details');
//     };

//     return (
//         <SafeAreaView className="flex-1 bg-background">
//             <ScrollView className="flex-1 px-6 py-6">
//                 {/* Info Card */}
//                 <Card className="mb-6">
//                     <CardContent className="flex-row items-start py-4">
//                         <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
//                             <MapPin size={20} color="#10B981" />
//                         </View>
//                         <View className="flex-1">
//                             <Text className="text-sm font-semibold text-foreground mb-1">
//                                 Dropoff Location
//                             </Text>
//                             <Text className="text-xs text-muted-foreground">
//                                 Where should we deliver your items?
//                             </Text>
//                         </View>
//                     </CardContent>
//                 </Card>

//                 {/* Form */}
//                 <View className="space-y-4">
//                     <Input
//                         label="Dropoff Address"
//                         placeholder="Enter complete delivery address"
//                         value={address}
//                         onChangeText={setAddress}
//                         multiline
//                         numberOfLines={3}
//                         error={errors.address}
//                         className="mb-4"
//                     />

//                     <Input
//                         label="Recipient Name"
//                         placeholder="Who will receive the items?"
//                         value={contactName}
//                         onChangeText={setContactName}
//                         error={errors.contactName}
//                         className="mb-4"
//                     />

//                     <Input
//                         label="Recipient Phone"
//                         placeholder="Contact number for delivery"
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
//                             Continue to Item Details
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

export default function DropoffLocationScreen() {
  const router = useRouter();
  const setDropoffLocation = useBookingStore((state) => state.setDropoffLocation);
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
    setDropoffLocation({
      address,
      contactName,
      contactPhone,
      lat: coordinates.lat,
      lng: coordinates.lng,
    });

    router.push('/booking/item-details');
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
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <MapPin size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Dropoff Location
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Search and select your delivery location
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
              placeholder="Search for dropoff location..."
              fetchDetails={true}
              onPress={handlePlaceSelect}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
                components: 'country:in',
              }}
              styles={{
                container: { flex: 0 },
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
                listView: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  marginTop: 4,
                },
                row: {
                  padding: 13,
                  height: 60,
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
            label="Recipient Name"
            placeholder="Who will receive the items?"
            value={contactName}
            onChangeText={setContactName}
            error={errors.contactName}
            className="mb-4"
          />

          <Input
            label="Recipient Phone"
            placeholder="Contact number for delivery"
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
            Continue to Item Details
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}