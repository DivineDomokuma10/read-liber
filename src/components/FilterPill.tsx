import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue,
} from "react-native";

import { fonts, interaction, radius } from "@/theme";
import { useTheme } from "@/theme/useTheme";

type Props = {
  active: boolean;
  label: string;
  onPress: () => void;
  icon?: (color: ColorValue) => ReactNode;
};

/** DS §11 visual pill inside a 44pt accessible touch target. */
export function FilterPill({ active, label, onPress, icon }: Props) {
  const { colors } = useTheme();
  const palette = colors.filterPill;
  const contentColor = active ? palette.activeText : palette.inactiveText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Show ${label.toLowerCase()} documents`}
      onPress={onPress}
      style={styles.touchTarget}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.pill,
            {
              backgroundColor: active
                ? palette.activeBackground
                : pressed
                  ? colors.glass.backgroundHover
                  : palette.inactiveBackground,
              borderColor: active ? palette.activeBackground : palette.border,
            },
          ]}
        >
          {icon?.(contentColor)}
          <Text style={[styles.label, { color: contentColor }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchTarget: {
    minHeight: interaction.preferredTarget,
    justifyContent: "center",
  },
  pill: {
    height: 34,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  label: {
    fontFamily: fonts.ui.semiBold,
    fontSize: 13,
    lineHeight: 13,
  },
});
