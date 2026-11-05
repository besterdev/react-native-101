import {
  ActionSheetIOS,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useState } from "react";
import { Copy, Icon, fonts } from "./ui";

type Props = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};
export function ChoiceField({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value)?.label;
  function choose() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: label,
          options: [...options.map((o) => o.label), "Cancel"],
          cancelButtonIndex: options.length,
          userInterfaceStyle: "light",
        },
        (index) => {
          if (options[index]) onChange(options[index].value);
        },
      );
    } else setOpen(!open);
  }
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected}`}
        accessibilityState={{ expanded: open }}
        onPress={choose}
        style={styles.field}
      >
        <Copy style={styles.value}>{selected}</Copy>
        <Icon name="down" />
      </Pressable>
      {open ? (
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: option.value === value }}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              style={styles.option}
            >
              <Copy>{option.label}</Copy>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  field: {
    minHeight: 48,
    paddingHorizontal: 13,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  value: { fontFamily: fonts.medium, fontSize: 16, flexShrink: 1 },
  options: {
    backgroundColor: "#ffffff",
    marginTop: 4,
    borderRadius: 12,
    padding: 4,
  },
  option: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12 },
});
