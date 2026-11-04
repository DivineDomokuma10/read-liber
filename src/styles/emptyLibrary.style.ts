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
  });
