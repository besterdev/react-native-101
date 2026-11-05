import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Copy, colors, fonts } from "./ui";

type Props = { value: string; onChange: (value: string) => void };
export function DateField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const date = new Date(value + "T12:00:00");
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next payment date"
        onPress={() => setOpen(!open)}
        style={styles.field}
      >
        <Copy style={styles.value}>{date.toLocaleDateString("en-GB")}</Copy>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          presentation="dialog"
          minimumDate={new Date("2026-10-16T00:00:00")}
          accentColor={colors.orange}
          themeVariant="light"
          onDismiss={() => setOpen(false)}
          onValueChange={(_, next) => {
            onChange(
              `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`,
            );
            setOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  field: {
    minHeight: 50,
    paddingHorizontal: 13,
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  value: { fontFamily: fonts.medium, fontSize: 16 },
});
