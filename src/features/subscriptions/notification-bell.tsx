import { useIsFocused } from "expo-router";
import { useEffect } from "react";
import { AppState, StyleSheet, View, type AppStateStatus } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { CircleButton, Icon } from "./ui";

export function NotificationBell({
  unread,
  active = true,
  onPress,
}: {
  unread: boolean;
  active?: boolean;
  onPress: () => void;
}) {
  const angle = useSharedValue(0);
  const focused = useIsFocused();
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    function update(state: AppStateStatus) {
      cancelAnimation(angle);
      angle.set(0);
      if (!unread || !active || !focused || reducedMotion || state !== "active")
        return;
      const swing = (degrees: number, duration: number) =>
        withTiming(degrees, {
          duration,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.System,
        });
      angle.set(
        withRepeat(
          withSequence(
            ReduceMotion.System,
            withDelay(900, swing(-7, 85), ReduceMotion.System),
            swing(7, 130),
            swing(-5, 115),
            swing(3, 105),
            swing(-1.5, 90),
            swing(0, 90),
            withDelay(5200, swing(0, 0), ReduceMotion.System),
          ),
          -1,
          false,
          undefined,
          ReduceMotion.System,
        ),
      );
    }
    update(AppState.currentState);
    const subscription = AppState.addEventListener("change", update);
    return () => {
      subscription.remove();
      cancelAnimation(angle);
    };
  }, [active, angle, focused, reducedMotion, unread]);
  const bellStyle = useAnimatedStyle(() => ({
    // Pivot near the top of the bell; the button and unread dot stay still.
    transform: [
      { translateY: -8 },
      { rotateZ: `${angle.get()}deg` },
      { translateY: 8 },
    ],
  }));
  return (
    <View>
      <CircleButton label="Payment reminders" icon="bell" onPress={onPress}>
        <Animated.View testID="notification-bell" style={bellStyle}>
          <Icon name="bell" />
        </Animated.View>
      </CircleButton>
      {unread ? (
        <View
          testID="notification-unread"
          pointerEvents="none"
          style={styles.dot}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef5949",
    top: 10,
    right: 10,
  },
});
