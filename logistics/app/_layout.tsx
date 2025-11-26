// import '@/global.css';

// import { NAV_THEME } from '@/lib/theme';
// import { ThemeProvider } from '@react-navigation/native';
// import { PortalHost } from '@rn-primitives/portal';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useColorScheme } from 'nativewind';

// export {
//   // Catch any errors thrown by the Layout component.
//   ErrorBoundary,
// } from 'expo-router';

// export default function RootLayout() {
//   const { colorScheme } = useColorScheme();

//   return (
//     <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
//       <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
//       <Stack />
//       <PortalHost />
//     </ThemeProvider>
//   );
// }

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import "../global.css";
import { ThemeProvider } from '@react-navigation/native';
import { NAV_THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { PortalHost } from '@rn-primitives/portal';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, loadAuth } = useAuthStore();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <PortalHost />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}