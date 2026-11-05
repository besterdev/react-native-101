import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MotionPressable, Reveal } from "./motion";
import { SafeAreaView } from "react-native-safe-area-context";
import { dueInWeek, money, monthlySpending, upcomingPayments } from "./model";
import { RecurHeader } from "./recur-header";
import {
  SubscriptionSheets,
  type SubscriptionSheet,
} from "./subscription-sheets";
import { useSubscriptions } from "./subscriptions-context";
import { PeriodToggle } from "./period-toggle";
import { SubscriptionRow } from "./subscription-row";
import { CircleButton, colors, Copy, fonts, Icon } from "./ui";

export default function OverviewScreen() {
  const { loading, subscriptions, monthlyBudget } = useSubscriptions();
  const [period, setPeriod] = useState<"month" | "year">("month");
  const [sheet, setSheet] = useState<SubscriptionSheet>(null);
  const monthly = monthlySpending(subscriptions);
  const upcoming = upcomingPayments(subscriptions);
  const activeCount = subscriptions.filter((s) => s.active).length;
  const factor = period === "month" ? 1 : 12;
  const [whole, decimals] = (monthly * factor)
    .toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .split(".");
  const budgetPercent = Math.round((monthly / monthlyBudget) * 100);
  const budget = useSharedValue(0);
  useEffect(() => {
    if (!loading)
      budget.set(
        withTiming(Math.min(budgetPercent, 100), {
          duration: 420,
          reduceMotion: ReduceMotion.System,
        }),
      );
  }, [budget, budgetPercent, loading]);
  const budgetStyle = useAnimatedStyle(() => ({ width: `${budget.get()}%` }));
  function close() {
    setSheet(null);
  }
  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          color={colors.orange}
          accessibilityLabel="Loading subscriptions"
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
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Copy style={styles.date}>Friday, 16 October</Copy>
          <View style={styles.titleRow}>
            <Copy accessibilityRole="header" style={styles.title}>
              Overview
            </Copy>
            <CircleButton
              label="Add subscription"
              icon="plus"
              primary
              onPress={() => setSheet("add")}
            />
          </View>
          <Reveal delay={40} style={styles.summary}>
            <View style={styles.summaryHeader}>
              <Copy style={styles.summaryLabel}>
                {period === "month" ? "Monthly" : "Yearly"} spending
              </Copy>
              <PeriodToggle value={period} onChange={setPeriod} />
            </View>
            <View
              accessible
              accessibilityLabel={`Total ${period} spending ฿${whole}.${decimals}`}
            >
              <Reveal key={period} style={styles.total}>
                <Copy style={styles.currency}>฿</Copy>
                <Copy style={styles.amount}>{whole}</Copy>
                <Copy style={styles.decimals}>.{decimals}</Copy>
              </Reveal>
            </View>
            <View style={styles.comparison}>
              <Copy style={styles.comparisonText}>
                Sample data ·{" "}
                {period === "month"
                  ? "Monthly equivalent"
                  : "Yearly projection"}
              </Copy>
            </View>
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Monthly budget used"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.min(budgetPercent, 100),
                text: `${budgetPercent}% of budget used`,
              }}
              style={styles.progress}
            >
              <Animated.View style={[styles.progressFill, budgetStyle]} />
            </View>
            <View style={styles.budgetCaption}>
              <Copy style={styles.budgetText}>
                {budgetPercent}% of ฿{money(monthlyBudget * factor)}{" "}
                {period === "month" ? "monthly" : "yearly"} budget
              </Copy>
              <Copy
                style={[
                  styles.budgetStatus,
                  monthly > monthlyBudget && { color: "#c44631" },
                ]}
              >
                {monthly > monthlyBudget ? "Over budget" : "On track"}
              </Copy>
            </View>
            <Copy style={styles.equivalentNote}>
              Yearly plans are averaged across 12 months.
            </Copy>
          </Reveal>
          <Reveal delay={100} style={styles.stats}>
            <View style={styles.stat}>
              <Icon name="stack" />
              <View>
                <Copy style={styles.statValue}>{activeCount} active</Copy>
                <Copy style={styles.statLabel}>Subscriptions</Copy>
              </View>
            </View>
            <View style={styles.stat}>
              <Icon name="calendar" />
              <View>
                <Copy style={styles.statValue}>
                  ฿{money(dueInWeek(subscriptions))}
                </Copy>
                <Copy style={styles.statLabel}>Due in 7 days</Copy>
              </View>
            </View>
          </Reveal>
          <Reveal delay={160} style={styles.sectionHeading}>
            <View style={styles.sectionTitle}>
              <Copy accessibilityRole="header" style={styles.sectionName}>
                Coming up
              </Copy>
              <Copy style={styles.count}>{Math.min(upcoming.length, 3)}</Copy>
            </View>
            <MotionPressable
              accessibilityRole="button"
              onPress={() => setSheet("all")}
              style={styles.viewAll}
            >
              <Copy style={styles.viewAllText}>View all</Copy>
              <Icon name="viewAll" />
            </MotionPressable>
          </Reveal>
          <Reveal delay={210} style={styles.list}>
            {upcoming.slice(0, 3).map((item, index, visible) => (
              <SubscriptionRow
                key={item.id}
                item={item}
                last={index === visible.length - 1}
                onPress={() => setSheet({ detail: item.id })}
              />
            ))}
            {!upcoming.length ? (
              <Copy style={styles.empty}>
                No upcoming payments. Add a subscription to get started.
              </Copy>
            ) : null}
          </Reveal>
        </ScrollView>
      </View>
      <SubscriptionSheets sheet={sheet} onClose={close} onSelect={setSheet} />
    </SafeAreaView>
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
  },
  date: { fontSize: 13, lineHeight: 18, color: colors.muted },
  titleRow: {
    marginTop: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
  },
  summary: {
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: { fontSize: 13, color: colors.muted, flexShrink: 1 },
  total: { flexDirection: "row", alignItems: "baseline", marginTop: 12 },
  currency: {
    fontSize: 30,
    lineHeight: 40,
    fontFamily: fonts.medium,
    marginRight: 3,
  },
  amount: {
    fontSize: 42,
    lineHeight: 51,
    fontFamily: fonts.bold,
    letterSpacing: -1.8,
  },
  decimals: {
    fontSize: 28,
    lineHeight: 37,
    fontFamily: fonts.bold,
    color: colors.muted,
    letterSpacing: -1,
  },
  comparison: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  comparisonText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    flexShrink: 1,
  },
  progress: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#e8e8ed",
    marginTop: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.orange,
    borderRadius: 3,
  },
  budgetCaption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 11,
  },
  budgetText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    flexShrink: 1,
  },
  budgetStatus: {
    fontSize: 12,
    lineHeight: 18,
    color: "#26734d",
    fontFamily: fonts.medium,
  },
  stats: { flexDirection: "row", gap: 10, marginTop: 10 },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 17,
    backgroundColor: "#ffffff",
  },
  statValue: { fontSize: 16, lineHeight: 22, fontFamily: fonts.semibold },
  statLabel: { fontSize: 12, lineHeight: 18, color: colors.muted },
  equivalentNote: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  sectionHeading: {
    marginTop: 16,
    marginBottom: 10,
    minHeight: 39,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionName: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  count: { fontSize: 14, color: colors.muted },
  viewAll: {
    flexDirection: "row",
    gap: 4,
    minHeight: 44,
    alignItems: "center",
  },
  viewAllText: { fontSize: 13, color: colors.orangeInk },
  list: { backgroundColor: "#ffffff", borderRadius: 20, overflow: "hidden" },
  empty: { padding: 20, color: colors.muted },
});
