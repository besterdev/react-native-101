import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { type SubscriptionStatus } from "./model";
import { MotionPressable } from "./motion";
import { colors, Copy, fonts } from "./ui";

const options: { value: SubscriptionStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];
export function StatusFilter({
  value,
  onChange,
}: {
  value: SubscriptionStatus;
  onChange: (value: SubscriptionStatus) => void;
}) {
  const selected = options.findIndex((option) => option.value === value);
  const position = useSharedValue(selected);
  const width = useSharedValue(0);
  useEffect(() => {
    position.set(
      withTiming(selected, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [position, selected]);
  const indicator = useAnimatedStyle(() => ({
    width: Math.max(0, width.get()),
    transform: [{ translateX: position.get() * (width.get() + 2) }],
  }));
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Filter subscriptions"
      style={styles.track}
      onLayout={(event) => width.set((event.nativeEvent.layout.width - 10) / 3)}
    >
      <Animated.View
        pointerEvents="none"
        accessible={false}
        style={[styles.indicator, indicator]}
      />
      {options.map((option) => (
        <MotionPressable
          key={option.value}
          accessibilityRole="tab"
          accessibilityLabel={option.label}
          aria-selected={option.value === value}
          onPress={() => onChange(option.value)}
          style={styles.button}
        >
          <Copy
            style={[styles.label, option.value === value && styles.selected]}
          >
            {option.label}
          </Copy>
        </MotionPressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    gap: 2,
    padding: 3,
    borderRadius: 9,
    backgroundColor: "#e9e9ee",
  },
  indicator: {
    position: "absolute",
    left: 3,
    top: 3,
    bottom: 3,
    backgroundColor: colors.orange,
    borderRadius: 7,
  },
  button: {
    flex: 1,
    paddingVertical: 7,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  label: { fontSize: 13, lineHeight: 17, color: "#4a4a50" },
  selected: { color: "#ffffff", fontFamily: fonts.semibold },
});
