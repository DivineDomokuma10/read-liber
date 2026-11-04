import { StyleSheet } from "react-native";

import type { ThemePalette } from "@/theme";

/** Empty library screen styles — restyled against DS §15 in DS-15. */
export const makeEmptyLibraryStyle = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    icon: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      opacity: 0.6,
    },
    fab: {
      position: "absolute",
      right: 24,
      bottom: 32,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      // Primary CTA fill (DS §9); full restyle lands in DS-14.
      backgroundColor: colors.brand.primary,
    },
    fabLabel: {
      fontSize: 28,
      lineHeight: 30,
      // Inverted-on-dark token arrives with DS-7/DS-14.
      color: "#fff",
    },
  });
