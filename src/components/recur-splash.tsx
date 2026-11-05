import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import animation from '@/assets/animations/recur-splash.json';

type Props = { onFinish: () => void };

export function RecurSplash({ onFinish }: Props) {
  const [started, setStarted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const laidOut = useRef(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (enabled) => { if (active) setReduceMotion(enabled); },
      () => { if (active) setReduceMotion(true); },
    );
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!started) return;
    if (reduceMotion) {
      onFinish();
      return;
    }
    // Do not block access if the native player fails to send its completion event.
    const timeout = setTimeout(onFinish, 4000);
    return () => clearTimeout(timeout);
  }, [started, reduceMotion, onFinish]);

  return (
    <View
      accessibilityLabel="Recur is opening"
      accessibilityRole="progressbar"
      accessibilityViewIsModal
      style={styles.overlay}
      onLayout={() => {
        if (laidOut.current) return;
        laidOut.current = true;
        // The white overlay must be mounted before dismissing the native launch screen.
        void SplashScreen.hideAsync().catch(() => undefined).finally(() => setStarted(true));
      }}>
      {started && reduceMotion === false ? (
        <LottieView
          source={animation}
          autoPlay
          loop={false}
          resizeMode="contain"
          style={styles.animation}
          webStyle={{ width: 320, height: 160 }}
          onAnimationFinish={(cancelled) => { if (!cancelled) onFinish(); }}
          onAnimationFailure={onFinish}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  animation: { width: 320, height: 160 },
});
