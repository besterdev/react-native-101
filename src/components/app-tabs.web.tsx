import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AppTabs() {
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <View style={styles.bar}>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="home">Overview</TabButton>
          </TabTrigger>
          <TabTrigger name="subscriptions" href="/subscriptions" asChild>
            <TabButton icon="subscriptions">Subscriptions</TabButton>
          </TabTrigger>
          <TabTrigger name="calendar" href="/calendar" asChild>
            <TabButton icon="calendar">Calendar</TabButton>
          </TabTrigger>
          <TabTrigger
            name="explore"
            href="/explore"
            style={{ display: "none" }}
          />
          <TabTrigger name="insights" href="/insights" asChild>
            <TabButton icon="insights">Insights</TabButton>
          </TabTrigger>
          <TabTrigger name="about" href="/about" style={{ display: "none" }} />
        </View>
      </TabList>
    </Tabs>
  );
}
export function TabButton({
  children,
  isFocused,
  icon,
  ...props
}: TabTriggerSlotProps & {
  icon: "home" | "subscriptions" | "calendar" | "insights";
}) {
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={typeof children === "string" ? children : undefined}
      aria-selected={!!isFocused}
      style={({ pressed }) => [
        styles.button,
        isFocused && styles.selected,
        pressed && { opacity: 0.65 },
      ]}
    >
      <Image
        source={
          icon === "subscriptions"
            ? require("@/assets/brand/subscriptions/nav-subscriptions.png")
            : icon === "home"
              ? require("@/assets/images/tabIcons/home.png")
              : icon === "calendar"
                ? require("@/assets/brand/calendar/nav-calendar.png")
                : require("@/assets/brand/insights/nav-insights.png")
        }
        style={{ width: 23, height: 23 }}
        contentFit="contain"
        tintColor={isFocused ? "#ff7a1a" : "#73737b"}
        accessible={false}
      />
      <Text style={[styles.label, isFocused && styles.selectedLabel]}>
        {children}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  tabs: { flex: 1 },
  slot: { flex: 1 },
  bar: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    width: "88%",
    maxWidth: 432,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 6,
    borderRadius: 28,
    boxShadow: "0px 5px 24px #1c1c1e14",
  },
  button: {
    flex: 1,
    minHeight: 57,
    gap: 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  selected: { backgroundColor: "#e9e9ed" },
  label: { color: "#5f606b", fontFamily: "RecurInter-Medium", fontSize: 11 },
  selectedLabel: { color: "#1c1c1e" },
});
