import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
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
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    loadAuth().then(() => {
      setIsNavigationReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isNavigationReady) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isNavigationReady]);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Slot />
      <PortalHost />
    </ThemeProvider>
  );
}