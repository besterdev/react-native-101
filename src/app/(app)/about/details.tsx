import { StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme"

export default function AboutDetailsScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            Detail
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Use the header back button to return to About.
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
})
