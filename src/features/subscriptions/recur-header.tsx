import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { upcomingPayments } from "./model";
import { NotificationBell } from "./notification-bell";
import { useSubscriptions } from "./subscriptions-context";
import { CircleButton } from "./ui";

export function RecurHeader({
  active,
  onSettings,
  onReminders,
}: {
  active: boolean;
  onSettings: () => void;
  onReminders: () => void;
}) {
  const { subscriptions, unread, markRemindersRead } = useSubscriptions();
  return (
    <View style={styles.header}>
      <NotificationBell
        unread={unread && upcomingPayments(subscriptions).length > 0}
        active={active}
        onPress={() => {
          markRemindersRead();
          onReminders();
        }}
      />
      <Image
        source={require("@/assets/brand/recur-logo.svg")}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="Recur"
      />
      <CircleButton label="Settings" icon="settings" onPress={onSettings} />
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 68,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { width: 74.4, height: 28 },
});
