import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import AppTabs from "@/components/app-tabs";
import { SubscriptionsProvider } from "@/features/subscriptions/subscriptions-context";

export default function AppLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SubscriptionsProvider>
        <AppTabs />
      </SubscriptionsProvider>
    </ThemeProvider>
  );
}
