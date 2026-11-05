import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  calendarDays,
  calendarLabel,
  paymentsInMonth,
  shiftMonth,
} from "./calendar-model";
import { DEMO_DATE, money } from "./model";
import { MotionPressable, Reveal } from "./motion";
import { RecurHeader } from "./recur-header";
import { SubscriptionRow } from "./subscription-row";
import {
  SubscriptionSheets,
  type SubscriptionSheet,
} from "./subscription-sheets";
import { useSubscriptions } from "./subscriptions-context";
import { colors, Copy, fonts, Icon, PrimaryButton } from "./ui";

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CalendarScreen() {
  const { loading } = useSubscriptions();
  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          color={colors.orange}
          accessibilityLabel="Loading calendar"
        />
      </View>
    );
  return <CalendarContent />;
}

function CalendarContent() {
  const { subscriptions } = useSubscriptions();
  const [selected, setSelection] = useState(
    () =>
      paymentsInMonth(subscriptions, DEMO_DATE.slice(0, 7)).find(
        (item) => item.date >= DEMO_DATE,
      )?.date ?? DEMO_DATE,
  );
  const [sheet, setSheet] = useState<SubscriptionSheet>(null);
  const month = selected.slice(0, 7);
  const payments = paymentsInMonth(subscriptions, month);
  const selectedPayments = payments.filter((item) => item.date === selected);
  const dueDates = new Set(payments.map((item) => item.date));
  const days = calendarDays(month);
  const total = payments.reduce((sum, item) => sum + item.price, 0);
  const title = calendarLabel(`${month}-01`, {
    month: "long",
    year: "numeric",
  });
  function changeMonth(offset: number) {
    const next = shiftMonth(month, offset);
    setSelection(paymentsInMonth(subscriptions, next)[0]?.date ?? `${next}-01`);
  }
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
          <Copy accessibilityRole="header" style={styles.title}>
            Calendar
          </Copy>
          <Copy style={styles.subtitle}>Know what’s due, and when.</Copy>
          <Reveal style={styles.calendar}>
            <View style={styles.monthHeader}>
              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                hitSlop={4}
                onPress={() => changeMonth(-1)}
                style={styles.monthButton}
              >
                <View style={styles.previous}>
                  <Icon name="monthChevron" />
                </View>
              </MotionPressable>
              <Copy accessibilityRole="header" style={styles.monthTitle}>
                {title}
              </Copy>
              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel="Next month"
                hitSlop={4}
                onPress={() => changeMonth(1)}
                style={styles.monthButton}
              >
                <Icon name="monthChevron" />
              </MotionPressable>
            </View>
            <View style={styles.grid}>
              <View style={styles.weekdays}>
                {weekdays.map((day) => (
                  <View key={day} style={styles.daySlot}>
                    <Copy style={styles.weekday}>{day[0]}</Copy>
                  </View>
                ))}
              </View>
              {Array.from({ length: days.length / 7 }, (_, week) => (
                <View key={week} style={styles.week}>
                  {days.slice(week * 7, week * 7 + 7).map((date, index) => (
                    <View key={date ?? `empty-${index}`} style={styles.daySlot}>
                      {date ? (
                        <MotionPressable
                          accessibilityRole="button"
                          accessibilityLabel={`${calendarLabel(date, { day: "numeric", month: "long", year: "numeric" })}${dueDates.has(date) ? ", payment due" : ""}${date === DEMO_DATE ? ", today" : ""}`}
                          accessibilityState={{ selected: date === selected }}
                          aria-selected={date === selected}
                          onPress={() => setSelection(date)}
                          style={[
                            styles.day,
                            date === selected && styles.selectedDay,
                          ]}
                        >
                          <Copy
                            style={[
                              styles.dayNumber,
                              date === DEMO_DATE && styles.today,
                              date === selected && styles.selectedNumber,
                            ]}
                          >
                            {Number(date.slice(8))}
                          </Copy>
                          {dueDates.has(date) ? (
                            <View
                              style={[
                                styles.dot,
                                date === selected && styles.selectedDot,
                              ]}
                            />
                          ) : null}
                        </MotionPressable>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </Reveal>
          <View style={styles.summary} accessibilityLiveRegion="polite">
            <Copy style={styles.summaryCopy}>
              {payments.length} {payments.length === 1 ? "payment" : "payments"}{" "}
              this month
            </Copy>
            <Copy style={styles.total}>฿{money(total)}</Copy>
          </View>
          <View style={styles.dayHeader} accessibilityLiveRegion="polite">
            <Copy accessibilityRole="header" style={styles.dayTitle}>
              {calendarLabel(selected, { day: "numeric", month: "short" })}
            </Copy>
            <Copy style={styles.paymentCount}>
              {selectedPayments.length}{" "}
              {selectedPayments.length === 1 ? "payment" : "payments"}
            </Copy>
          </View>
          <Reveal key={selected} style={styles.list}>
            {selectedPayments.map((item, index) => (
              <SubscriptionRow
                key={item.id}
                item={item}
                billingDate
                last={index === selectedPayments.length - 1}
                onPress={() =>
                  setSheet({ detail: item.id, occurrenceDate: selected })
                }
              />
            ))}
            {!selectedPayments.length ? (
              <View style={styles.empty}>
                <Copy style={styles.emptyTitle}>No payments due</Copy>
                <Copy style={styles.emptyCopy}>
                  You have no scheduled payments on this day.
                </Copy>
              </View>
            ) : null}
          </Reveal>
          <MotionPressable
            accessibilityRole="button"
            accessibilityLabel="Go to today"
            onPress={() => setSelection(DEMO_DATE)}
            style={styles.todayButton}
          >
            <Copy style={styles.todayLabel}>Today · 16 October</Copy>
          </MotionPressable>
          <Copy style={styles.forecastNote}>
            Sample calendar · Scheduled full charges, including future
            projections.
          </Copy>
          <View style={styles.add}>
            <PrimaryButton
              title="Add subscription"
              plus
              onPress={() => setSheet("add")}
            />
          </View>
        </ScrollView>
      </View>
      <SubscriptionSheets
        sheet={sheet}
        onClose={() => setSheet(null)}
        onSelect={setSheet}
        addDate={selected < DEMO_DATE ? DEMO_DATE : selected}
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
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
  },
  subtitle: { fontSize: 13, lineHeight: 21, color: colors.muted, marginTop: 7 },
  calendar: {
    marginTop: 24,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  previous: { transform: [{ rotate: "180deg" }] },
  monthTitle: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24 },
  grid: { marginTop: 17 },
  weekdays: { flexDirection: "row", gap: 4, paddingBottom: 7 },
  weekday: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: "center",
  },
  week: { flexDirection: "row", gap: 4, marginTop: 4 },
  daySlot: { flex: 1, alignItems: "center" },
  day: {
    width: "100%",
    minHeight: 44,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: { fontSize: 16, lineHeight: 23 },
  today: { fontFamily: fonts.bold, color: colors.orange },
  selectedDay: {
    backgroundColor: colors.orange,
    experimental_backgroundImage: "linear-gradient(110deg, #ff941f, #ff6b12)",
  },
  selectedNumber: { color: "#ffffff" },
  dot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.orange,
  },
  selectedDot: { backgroundColor: "#ffffff" },
  summary: {
    marginTop: 5,
    paddingVertical: 17,
    paddingHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dcdce2",
  },
  summaryCopy: { fontSize: 12, lineHeight: 17, color: colors.muted },
  total: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 31 },
  dayHeader: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 7,
  },
  dayTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  paymentCount: { fontSize: 14, lineHeight: 19, color: colors.muted },
  todayButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    marginTop: 8,
  },
  todayLabel: { fontFamily: fonts.medium, color: colors.orangeInk },
  forecastNote: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  list: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
  },
  empty: { padding: 20, gap: 4 },
  emptyTitle: { fontFamily: fonts.medium, textAlign: "center" },
  emptyCopy: { fontSize: 12, color: colors.muted, textAlign: "center" },
  add: { marginTop: 18, paddingBottom: 24 },
});
