import { StyleSheet } from "react-native";

import type { ThemePalette } from "@/theme";

/**
 * "Not found" screen styles. This screen is the intent-receive placeholder;
 * it mirrors the EmptyLibrary look so a handoff never feels like an error.
 */
export const makeNotFoundStyle = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: colors.background.primary,
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
      textAlign: "center",
    },
  });
