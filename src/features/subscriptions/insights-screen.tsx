import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { money, monthlySpending, spendingByCategory } from "./model";
import { MotionPressable, Reveal } from "./motion";
import { RecurHeader } from "./recur-header";
import {
  SubscriptionSheets,
  type SubscriptionSheet,
} from "./subscription-sheets";
import { useSubscriptions } from "./subscriptions-context";
import { colors, Copy, fonts } from "./ui";

export default function InsightsScreen() {
  const { loading, subscriptions, monthlyBudget } = useSubscriptions();
  const [sheet, setSheet] = useState<SubscriptionSheet>(null);
  const monthly = monthlySpending(subscriptions);
  const groups = spendingByCategory(subscriptions);
  const activeCount = subscriptions.filter((item) => item.active).length;
  const remaining = Math.round((monthlyBudget - monthly) * 100) / 100;
  const total = monthly.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          color={colors.orange}
          accessibilityLabel="Loading insights"
        />
      </View>
    );
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.container}>
        <RecurHeader
          active={sheet === null}
          onSettings={() => setSheet("settings")}
          onReminders={() => setSheet("reminders")}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={styles.content}
        >
          <View style={styles.introduction}>
            <Copy accessibilityRole="header" style={styles.title}>
              Insights
            </Copy>
            <Copy style={styles.subtitle}>
              Understand your recurring spending.
            </Copy>
          </View>
          <Reveal delay={40} style={styles.spending}>
            <Copy style={styles.spendingLabel}>Monthly spending</Copy>
            <Copy style={styles.total}>฿{total}</Copy>
            <Copy style={styles.activeCount}>
              Sample data · Across {activeCount} active{" "}
              {activeCount === 1 ? "subscription" : "subscriptions"}
            </Copy>
            {groups.map((group) => (
              <CategorySpending
                key={group.category}
                {...group}
                onPress={() => setSheet({ category: group.category })}
              />
            ))}
            {!groups.length ? (
              <View style={styles.empty}>
                <Copy style={styles.emptyTitle}>No active subscriptions</Copy>
                <Copy style={styles.emptyCopy}>
                  Add or resume a subscription to see your spending breakdown.
                </Copy>
              </View>
            ) : null}
          </Reveal>
          <Reveal delay={100} style={styles.budget}>
            <Copy accessibilityRole="header" style={styles.sectionTitle}>
              Monthly budget
            </Copy>
            <Copy
              style={[styles.remaining, remaining < 0 && styles.overBudget]}
            >
              {remaining > 0
                ? `฿${money(remaining)} left this month`
                : remaining < 0
                  ? `฿${money(-remaining)} over budget this month`
                  : "Monthly budget reached"}
            </Copy>
            <Copy style={styles.budgetCopy}>
              {remaining > 0
                ? `A ฿${money(monthlyBudget)} budget keeps things in balance. Review services you use less to make more room.`
                : `You’ve ${remaining < 0 ? "exceeded" : "used"} your ฿${money(monthlyBudget)} monthly budget. Review your recurring payments to stay on track.`}
            </Copy>
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel="Edit monthly budget"
              onPress={() => setSheet("budget")}
              style={styles.review}
            >
              <Copy style={styles.reviewText}>Edit monthly budget ›</Copy>
            </MotionPressable>
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel="Review subscriptions"
              hitSlop={6}
              onPress={() => router.navigate("/subscriptions")}
              style={styles.review}
            >
              <Copy style={styles.reviewText}>Review subscriptions ›</Copy>
            </MotionPressable>
          </Reveal>
          <Reveal delay={160} style={styles.yearly}>
            <Copy accessibilityRole="header" style={styles.sectionTitle}>
              The yearly picture
            </Copy>
            <Copy style={styles.subtitle}>
              At your current rate: ฿{money(monthly * 12)} per year.
            </Copy>
            <Copy style={styles.subtitle}>
              A projection from current plans, not recorded transactions.
            </Copy>
          </Reveal>
        </ScrollView>
      </View>
      <SubscriptionSheets
        sheet={sheet}
        onClose={() => setSheet(null)}
        onSelect={setSheet}
      />
    </SafeAreaView>
  );
}

function CategorySpending({
  category,
  amount,
  percentage,
  onPress,
}: ReturnType<typeof spendingByCategory>[number] & { onPress: () => void }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(
      withTiming(percentage, {
        duration: 420,
        reduceMotion: ReduceMotion.System,
      }),
    );
    return () => cancelAnimation(progress);
  }, [percentage, progress]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.get()}%` }));
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`View ${category} subscriptions, ${percentage}% of spending, ฿${money(amount)}`}
      onPress={onPress}
      style={styles.category}
    >
      <View style={styles.categoryHeading}>
        <Copy style={styles.categoryLabel}>
          {category} · {percentage}%
        </Copy>
        <Copy style={styles.categoryAmount}>฿{money(amount)} ›</Copy>
      </View>
      <View accessible={false} style={styles.track}>
        <Animated.View style={[styles.fill, fill]} />
      </View>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  container: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center" },
  content: {
    paddingHorizontal: 20,
    paddingTop: 11,
    paddingBottom: Platform.OS === "web" ? 115 : 34,
    gap: 14,
  },
  introduction: { gap: 4 },
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
  },
  subtitle: { fontSize: 13, lineHeight: 18, color: colors.muted },
  spending: {
    paddingHorizontal: 19,
    paddingVertical: 16,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    gap: 10,
  },
  spendingLabel: { fontSize: 13, lineHeight: 18, color: colors.muted },
  total: { fontFamily: fonts.bold, fontSize: 36, lineHeight: 50 },
  activeCount: { fontSize: 12, lineHeight: 17, color: colors.muted },
  category: { gap: 6, minHeight: 48, justifyContent: "center" },
  categoryHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    flexShrink: 1,
  },
  categoryAmount: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#e9e9ed",
  },
  fill: { height: "100%", borderRadius: 3, backgroundColor: colors.orange },
  budget: {
    paddingHorizontal: 19,
    paddingVertical: 16,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    gap: 8,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 25 },
  remaining: { fontFamily: fonts.semibold, fontSize: 23, lineHeight: 32 },
  overBudget: { color: "#c44631" },
  budgetCopy: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  review: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
  },
  reviewText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.orangeInk,
  },
  yearly: { gap: 4 },
  empty: { paddingVertical: 10, gap: 4 },
  emptyTitle: { fontFamily: fonts.medium, fontSize: 14 },
  emptyCopy: { color: colors.muted, fontSize: 12, lineHeight: 17 },
});
