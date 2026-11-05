import { useEffect, type PropsWithChildren } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MotionPressable({
  style,
  onPressIn,
  onPressOut,
  ...props
}: Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle> }) {
  const pressed = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const feedback = useAnimatedStyle(() => ({
    opacity: 1 - pressed.get() * 0.15,
    transform: [{ scale: reducedMotion ? 1 : 1 - pressed.get() * 0.035 }],
  }));
  return (
    <AnimatedPressable
      {...props}
      style={[style, feedback]}
      onPressIn={(event) => {
        pressed.set(
          withTiming(1, { duration: 80, reduceMotion: ReduceMotion.System }),
        );
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.set(
          withSpring(0, {
            damping: 18,
            stiffness: 280,
            reduceMotion: ReduceMotion.System,
          }),
        );
        onPressOut?.(event);
      }}
    />
  );
}

export function Reveal({
  children,
  delay = 0,
  style,
}: PropsWithChildren<{ delay?: number; style?: StyleProp<ViewStyle> }>) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    progress.set(
      withDelay(
        delay,
        withTiming(1, {
          duration: 320,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          reduceMotion: ReduceMotion.System,
        }),
        ReduceMotion.System,
      ),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress]);
  const revealStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * 12 }],
  }));
  return <Animated.View style={[style, revealStyle]}>{children}</Animated.View>;
}
