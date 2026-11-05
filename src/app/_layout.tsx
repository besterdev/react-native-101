import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RecurSplash } from '@/components/recur-splash';
import { SessionProvider, useSession } from '@/ctx/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SessionProvider>
      <AppBootstrap />
    </SessionProvider>
  );
}

function AppBootstrap() {
  const { isLoading } = useSession();
  const [fontsLoaded, fontError] = useFonts({
    'RecurInter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
    'RecurInter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
    'RecurInter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
    'RecurInter-Display': require('@/assets/fonts/Inter-Display.ttf'),
    'RecurInter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
  });
  const [splashFinished, setSplashFinished] = useState(false);
  const finishSplash = useCallback(() => setSplashFinished(true), []);

  if (isLoading || (!fontsLoaded && !fontError)) return null;

  return (
    <View style={styles.container}>
      <View
        style={styles.container}
        pointerEvents={splashFinished ? 'auto' : 'none'}
        accessibilityElementsHidden={!splashFinished}
        importantForAccessibility={splashFinished ? 'auto' : 'no-hide-descendants'}>
        {splashFinished ? <RootNavigator /> : null}
      </View>
      {!splashFinished ? <RecurSplash onFinish={finishSplash} /> : null}
    </View>
  );
}

function RootNavigator() {
  const { isLoading, session } = useSession();

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
