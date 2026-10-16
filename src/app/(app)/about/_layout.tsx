import { Stack } from "expo-router"
import { useColorScheme } from "react-native"

import { Colors } from "@/constants/theme"

export default function AboutLayout() {
  const scheme = useColorScheme()
  const colors = Colors[scheme === "unspecified" ? "light" : scheme]

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "About" }} />
      <Stack.Screen name="details" options={{ title: "Detail" }} />
    </Stack>
  )
}
