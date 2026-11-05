import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MotionPressable } from "./motion";
import { colors, fonts } from "./ui";

type Period = "month" | "year";

export function PeriodToggle({
  value,
  onChange,
}: {
  value: Period;
  onChange: (value: Period) => void;
}) {
  const progress = useSharedValue(value === "year" ? 1 : 0);
  const monthWidth = useSharedValue(54);
  const yearWidth = useSharedValue(49);
  useEffect(() => {
    progress.set(
      withTiming(value === "year" ? 1 : 0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [progress, value]);
  const indicatorStyle = useAnimatedStyle(() => ({
    width:
      monthWidth.get() + (yearWidth.get() - monthWidth.get()) * progress.get(),
    transform: [{ translateX: progress.get() * monthWidth.get() }],
  }));
  const monthStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], ["#ffffff", "#6d6d76"]),
  }));
  const yearStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], ["#6d6d76", "#ffffff"]),
  }));

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Spending period"
      style={styles.track}
    >
      <Animated.View
        testID="period-selection"
        pointerEvents="none"
        accessible={false}
        style={[styles.indicator, indicatorStyle]}
      />
      <MotionPressable
        accessibilityRole="tab"
        accessibilityLabel="Month"
        aria-selected={value === "month"}
        onPress={() => onChange("month")}
        onLayout={(event) => monthWidth.set(event.nativeEvent.layout.width)}
        style={styles.button}
      >
        <Animated.Text style={[styles.label, monthStyle]}>Month</Animated.Text>
      </MotionPressable>
      <MotionPressable
        accessibilityRole="tab"
        accessibilityLabel="Year"
        aria-selected={value === "year"}
        onPress={() => onChange("year")}
        onLayout={(event) => yearWidth.set(event.nativeEvent.layout.width)}
        style={styles.button}
      >
        <Animated.Text style={[styles.label, yearStyle]}>Year</Animated.Text>
      </MotionPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    flexShrink: 0,
    borderRadius: 9,
    padding: 3,
    backgroundColor: "#e9e9ee",
  },
  indicator: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 7,
    backgroundColor: colors.orange,
  },
  button: {
    minWidth: 49,
    minHeight: 44,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 18 },
});
