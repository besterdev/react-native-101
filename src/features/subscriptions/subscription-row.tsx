import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";
import { MotionPressable } from "./motion";
import { daysUntil, money, type Subscription } from "./model";
import { colors, Copy, fonts, Icon } from "./ui";

export function SubscriptionRow({
  item,
  onPress,
  last = false,
  billingDate = false,
}: {
  item: Subscription;
  onPress: () => void;
  last?: boolean;
  billingDate?: boolean;
}) {
  const days = daysUntil(item.date);
  const due = !item.active
    ? "Paused"
    : days === 0
      ? "Due today"
      : days < 0
        ? "Payment overdue"
        : `In ${days} ${days === 1 ? "day" : "days"}`;
  const caption =
    billingDate && item.active
      ? `${new Date(item.date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${item.cycle}`
      : due;
  // Web uses the card reveal so rows stay in normal document flow.
  return (
    <Animated.View
      collapsable={false}
      entering={
        Platform.OS === "web"
          ? undefined
          : FadeIn.duration(200).reduceMotion(ReduceMotion.System)
      }
      exiting={
        Platform.OS === "web"
          ? undefined
          : FadeOut.duration(140).reduceMotion(ReduceMotion.System)
      }
      layout={
        Platform.OS === "web"
          ? undefined
          : LinearTransition.duration(220).reduceMotion(ReduceMotion.System)
      }
    >
      <MotionPressable
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ฿${money(item.price)}, ${caption}`}
        onPress={onPress}
        style={styles.row}
      >
        <ServiceIcon item={item} />
        <View style={styles.description}>
          <Copy style={styles.name}>{item.name}</Copy>
          <Copy style={styles.plan}>{item.plan}</Copy>
        </View>
        <View style={styles.amount}>
          <Copy style={styles.price}>฿{money(item.price)}</Copy>
          <Copy
            style={[
              styles.due,
              !billingDate && item.active && days <= 2 && styles.soon,
            ]}
          >
            {caption}
          </Copy>
        </View>
        <Icon name="chevron" />
      </MotionPressable>
      {!last ? <View style={styles.divider} /> : null}
    </Animated.View>
  );
}
export function ServiceIcon({ item }: { item: Subscription }) {
  const backgroundColor = {
    netflix: "#201f22",
    spotify: "#e3f0dd",
    cloud: "#e6edf7",
    youtube: "#f9e6e2",
    figma: "#ece8f6",
    notion: "#ededf0",
    custom: "#fff0df",
  }[item.brand];
  return (
    <View style={[styles.serviceIcon, { backgroundColor }]}>
      {item.brand === "spotify" ? (
        <Icon name="spotify" />
      ) : item.brand === "cloud" ? (
        <Icon name="cloud" />
      ) : item.brand === "youtube" ? (
        <Icon name="youtube" />
      ) : (
        <Copy
          style={[
            styles.initial,
            {
              color:
                item.brand === "netflix"
                  ? "#e8383b"
                  : item.brand === "figma"
                    ? "#7d62ac"
                    : "#3a3a3c",
              fontSize: item.brand === "netflix" ? 28 : 24,
            },
          ]}
        >
          {item.name.slice(0, 1).toUpperCase()}
        </Copy>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: { fontFamily: fonts.bold, fontSize: 27, lineHeight: 32 },
  description: { flex: 1, minWidth: 0, gap: 3 },
  name: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
  plan: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  amount: { alignItems: "flex-end", flexShrink: 1, maxWidth: "48%", gap: 4 },
  price: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 19 },
  due: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  soon: { color: "#b06119" },
  divider: { height: 1, marginLeft: 66, backgroundColor: colors.line },
});
