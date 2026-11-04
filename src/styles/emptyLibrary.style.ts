import { StyleSheet } from "react-native";

import type { ThemePalette } from "@/theme";
import { fonts, radius } from "@/theme";

/** Quiet, centered Library empty state — DS §15 component inventory. */
export const makeEmptyLibraryStyle = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingBottom: 72,
    },
    iconSurface: {
      width: 64,
      height: 64,
      marginBottom: 20,
      borderRadius: radius.large,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brand.soft,
    },
    title: {
      marginBottom: 8,
      color: colors.text.primary,
      fontFamily: fonts.ui.semiBold,
      fontSize: 20,
      lineHeight: 25,
      textAlign: "center",
    },
    subtitle: {
      color: colors.text.secondary,
      fontFamily: fonts.ui.regular,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
    },
  });
