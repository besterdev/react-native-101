import { Link } from "expo-router"
import { Pressable, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme"

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            About
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Open Detail to see the stack push and back button.
          </ThemedText>

          <Link href="/about/details" asChild>
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <ThemedView type="backgroundElement" style={styles.buttonInner}>
                <ThemedText type="link">Go to Detail</ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
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
  button: {
    marginTop: Spacing.two,
  },
  buttonInner: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
})
