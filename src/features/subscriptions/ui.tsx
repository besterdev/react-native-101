import { Image } from "expo-image";
import { type PropsWithChildren } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { MotionPressable } from "./motion";

export const colors = {
  background: "#f2f2f7",
  ink: "#1c1c1e",
  muted: "#5f606b",
  orange: "#ff7a1a",
  orangeInk: "#b34706",
  line: "#e9e9ed",
};
export const fonts = {
  regular: "RecurInter-Regular",
  medium: "RecurInter-Medium",
  semibold: "RecurInter-SemiBold",
  bold: "RecurInter-Bold",
  display: "RecurInter-Display",
};
const icons = {
  monthChevron: require("@/assets/brand/calendar/month-chevron.svg"),
  search: require("@/assets/brand/subscriptions/search-field.svg"),
  youtube: require("@/assets/brand/subscriptions/youtube-mark.svg"),
  bell: require("@/assets/brand/overview/bell.svg"),
  settings: require("@/assets/brand/overview/settings.svg"),
  plus: require("@/assets/brand/overview/plus.svg"),
  trend: require("@/assets/brand/overview/trend.svg"),
  stack: require("@/assets/brand/overview/stack.svg"),
  calendar: require("@/assets/brand/overview/calendar.svg"),
  viewAll: require("@/assets/brand/overview/viewAll.svg"),
  chevron: require("@/assets/brand/overview/chevron.svg"),
  spotify: require("@/assets/brand/overview/spotify.svg"),
  cloud: require("@/assets/brand/overview/cloud.svg"),
  close: require("@/assets/brand/overview/close.svg"),
  down: require("@/assets/brand/overview/down.svg"),
  buttonPlus: require("@/assets/brand/overview/buttonPlus.svg"),
};
export type IconName = keyof typeof icons;
const iconSizes: Record<IconName, [number, number]> = {
  monthChevron: [22, 22],
  search: [18, 18],
  youtube: [24, 24],
  bell: [22, 22],
  settings: [22, 22],
  plus: [22, 22],
  trend: [13, 13],
  stack: [20, 20],
  calendar: [20, 20],
  viewAll: [14, 14],
  chevron: [10, 13],
  spotify: [24, 24],
  cloud: [24, 24],
  close: [16.081, 17],
  down: [9.459, 6],
  buttonPlus: [18, 18],
};
export function Icon({ name }: { name: IconName }) {
  const [width, height] = iconSizes[name];
  return (
    <Image
      source={icons[name]}
      style={{ width, height }}
      contentFit="contain"
      accessible={false}
    />
  );
}
export function Copy({
  children,
  style,
  ...props
}: PropsWithChildren<{
  style?: StyleProp<TextStyle>;
  accessibilityRole?: "header" | "alert";
  accessibilityLiveRegion?: "polite";
}>) {
  return (
    <Text {...props} style={[styles.copy, style]}>
      {children}
    </Text>
  );
}
export function PrimaryButton({
  title,
  onPress,
  plus = false,
}: {
  title: string;
  onPress: () => void;
  plus?: boolean;
}) {
  return (
    <MotionPressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.primary}
    >
      {plus ? <Icon name="buttonPlus" /> : null}
      <Copy style={styles.primaryText}>{title}</Copy>
    </MotionPressable>
  );
}
export function CircleButton({
  label,
  icon,
  primary,
  onPress,
  style,
  children,
}: PropsWithChildren<{
  label: string;
  icon: IconName;
  primary?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}>) {
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.circle, primary && styles.orange, style]}
    >
      {children ?? <Icon name={icon} />}
    </MotionPressable>
  );
}
export function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Copy style={styles.factLabel}>{label}</Copy>
      <Copy style={styles.factValue}>{value}</Copy>
    </View>
  );
}
const styles = StyleSheet.create({
  copy: {
    fontFamily: fonts.regular,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
  primary: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.orange,
    experimental_backgroundImage: "linear-gradient(110deg, #ff941f, #ff6b12)",
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 23,
    color: "#ffffff",
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  orange: {
    backgroundColor: colors.orange,
    experimental_backgroundImage: "linear-gradient(110deg, #ff941f, #ff6b12)",
    boxShadow: "0px 3px 10px #ff7a1a30",
  },
  fact: {
    minHeight: 48,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  factLabel: { color: colors.muted, flexShrink: 1 },
  factValue: { fontFamily: fonts.medium, textAlign: "right", flexShrink: 1 },
});
