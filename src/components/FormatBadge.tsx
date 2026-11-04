import { StyleSheet, Text, View } from "react-native";

import { FileGlyphIcon } from "@/components/icons";
import type { Document } from "@/types/document";
import { fonts, formatColors, radius } from "@/theme";

type Props = {
  type: Document["type"];
  variant?: "icon" | "tag";
};

const FORMAT_LABEL: Record<Document["type"], string> = {
  pdf: "PDF",
  docx: "DOCX",
  md: "MD",
  txt: "TXT",
};

/** DS §3/§6 format marker, used as a row illustration or metadata tag. */
export function FormatBadge({ type, variant = "icon" }: Props) {
  const colors = formatColors[type];
  const label = FORMAT_LABEL[type];

  if (variant === "tag") {
    return (
      <View
        accessible={false}
        style={[styles.tag, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.tagLabel, { color: colors.color }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View
      accessible={false}
      style={[styles.iconBadge, { backgroundColor: colors.background }]}
    >
      <FileGlyphIcon size={19} color={colors.color} />
      <Text style={[styles.iconLabel, { color: colors.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  iconLabel: {
    fontFamily: fonts.ui.bold,
    fontSize: 7,
    lineHeight: 8,
    letterSpacing: 0.2,
  },
  tag: {
    minHeight: 16,
    paddingHorizontal: 4,
    borderRadius: radius.small,
    alignItems: "center",
    justifyContent: "center",
  },
  tagLabel: {
    fontFamily: fonts.ui.bold,
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0.2,
  },
});
