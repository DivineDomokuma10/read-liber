import { StyleSheet } from "react-native";

import type { ThemePalette } from "@/theme";

/**
 * Document list row styles — rebuilt against DS §8 in DS-13; values below
 * are the pre-design ones only lightly tokenized.
 */
export const makeDocumentListItemStyle = (colors: ThemePalette) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    openArea: {
      flex: 1,
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingLeft: 16,
      gap: 12,
    },
    icon: {
      fontSize: 28,
    },
    meta: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: "500",
    },
    detail: {
      fontSize: 13,
      opacity: 0.6,
      marginTop: 2,
    },
    rowMissing: {
      opacity: 0.5,
    },
    iconMissing: {
      opacity: 0.5,
    },
    nameMissing: {
      opacity: 0.55,
    },
    favoriteButton: {
      width: 56,
      height: 56,
      marginRight: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    favoriteButtonPending: {
      opacity: 0.45,
    },
    favoriteLabel: {
      color: colors.text.secondary,
      fontSize: 26,
      lineHeight: 30,
    },
    favoriteLabelSelected: {
      // Favorite fill — DS §3 `--favorite`.
      color: colors.favorite.color,
    },
  });
