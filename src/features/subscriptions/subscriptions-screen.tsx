import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  filterSubscriptions,
  money,
  monthlySpending,
  type SubscriptionStatus,
} from "./model";
import { MotionPressable, Reveal } from "./motion";
import { RecurHeader } from "./recur-header";
import { StatusFilter } from "./status-filter";
import { SubscriptionRow } from "./subscription-row";
import {
  SubscriptionSheets,
  type SubscriptionSheet,
} from "./subscription-sheets";
import { useSubscriptions } from "./subscriptions-context";
import { CircleButton, colors, Copy, fonts, Icon, PrimaryButton } from "./ui";

export default function SubscriptionsScreen() {
  const { loading, subscriptions } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus>("all");
  const [sheet, setSheet] = useState<SubscriptionSheet>(null);
  const visible = filterSubscriptions(subscriptions, query, status);
  function clearFilters() {
    setQuery("");
    setStatus("all");
  }
  const emptyTitle = !subscriptions.length
    ? "No subscriptions yet"
    : query.trim()
      ? "No subscriptions found"
      : `No ${status === "paused" ? "paused" : "active"} subscriptions`;
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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.titleRow}>
            <Copy accessibilityRole="header" style={styles.title}>
              Subscriptions
            </Copy>
            <CircleButton
              label="Add subscription"
              icon="plus"
              primary
              onPress={() => setSheet("add")}
            />
          </View>
          <Copy style={styles.subtitle}>
            All your recurring payments, together.
          </Copy>
          <View style={styles.search}>
            <View style={styles.searchSlot}>
              <Icon name="search" />
            </View>
            <TextInput
              accessibilityLabel="Find a subscription"
              placeholder="Find a subscription"
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.searchInput}
            />
            {query ? (
              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setQuery("")}
                style={styles.clear}
              >
                <Icon name="close" />
              </MotionPressable>
            ) : null}
          </View>
          <View style={styles.filters}>
            <StatusFilter value={status} onChange={setStatus} />
          </View>
          <View style={styles.summary} accessibilityLiveRegion="polite">
            <Copy style={styles.summaryText}>
              {visible.length}{" "}
              {visible.length === 1 ? "subscription" : "subscriptions"}
            </Copy>
            <Copy style={styles.summaryText}>
              ฿{money(monthlySpending(visible))} / month
            </Copy>
          </View>
          <Reveal delay={60} style={styles.list}>
            {visible.map((item, index) => (
              <SubscriptionRow
                key={item.id}
                item={item}
                billingDate
                last={index === visible.length - 1}
                onPress={() => setSheet({ detail: item.id })}
              />
            ))}
            {!visible.length ? (
              <View style={styles.empty}>
                <Copy accessibilityRole="header" style={styles.emptyTitle}>
                  {emptyTitle}
                </Copy>
                <Copy style={styles.emptyCopy}>
                  {!subscriptions.length
                    ? "Add your first recurring payment to start tracking."
                    : query.trim()
                      ? "Try another name or clear your filters."
                      : status === "paused"
                        ? "Pause tracking from a subscription’s details."
                        : "Resume a paused subscription or add a new one."}
                </Copy>
                {!subscriptions.length ? (
                  <PrimaryButton
                    title="Add subscription"
                    plus
                    onPress={() => setSheet("add")}
                  />
                ) : (
                  <MotionPressable
                    accessibilityRole="button"
                    onPress={clearFilters}
                    style={styles.clearFilters}
                  >
                    <Copy style={styles.clearFiltersText}>Clear filters</Copy>
                  </MotionPressable>
                )}
              </View>
            ) : null}
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
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  container: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center" },
  content: {
    paddingHorizontal: 20,
    paddingTop: 11,
    paddingBottom: Platform.OS === "web" ? 115 : 34,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    minHeight: 44,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
    flexShrink: 1,
  },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 21, marginTop: 7 },
  search: {
    marginTop: 22,
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingLeft: 12,
    borderRadius: 12,
    backgroundColor: "#e5e5eb",
  },
  searchSlot: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    minHeight: 43,
    paddingVertical: 10,
    paddingRight: 9,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  clear: {
    width: 44,
    minHeight: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  filters: { marginTop: 15 },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    gap: 12,
    marginTop: 20,
  },
  summaryText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  list: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
  },
  empty: { padding: 24, gap: 10 },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  emptyCopy: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 6,
  },
  clearFilters: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  clearFiltersText: { color: colors.orangeInk, fontFamily: fonts.semibold },
});
