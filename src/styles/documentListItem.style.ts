import { StyleSheet } from "react-native";

import type { ThemePalette } from "@/theme";
import {
  fonts,
  glassSurface,
  interaction,
  radius,
  tracking,
  typography,
} from "@/theme";

/** Document row — DS §8 and docs/ui/home.png. */
export const makeDocumentListItemStyle = (colors: ThemePalette) =>
  StyleSheet.create({
    row: {
      minHeight: 92,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: radius.card,
      flexDirection: "row",
      alignItems: "stretch",
      ...glassSurface(colors),
    },
    openArea: {
      flex: 1,
      minHeight: 90,
      paddingTop: 13,
      paddingBottom: 13,
      paddingLeft: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
    },
    meta: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      color: colors.text.primary,
      fontFamily: fonts.ui.bold,
      fontSize: typography.listTitle.size,
      lineHeight:
        typography.listTitle.size * typography.listTitle.lineHeightFactor,
      letterSpacing: typography.listTitle.size * tracking.listTitle,
    },
    detailRow: {
      minHeight: 16,
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    detail: {
      flexShrink: 1,
      color: colors.text.secondary,
      fontFamily: fonts.ui.medium,
      fontSize: typography.metadata.sizeMin,
      lineHeight:
        typography.metadata.sizeMin * typography.metadata.lineHeightFactor,
    },
    detailDivider: {
      color: colors.text.muted,
      fontFamily: fonts.ui.medium,
      fontSize: typography.metadata.sizeMin,
      lineHeight:
        typography.metadata.sizeMin * typography.metadata.lineHeightFactor,
    },
    progressRow: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
    progressTrack: {
      flex: 1,
      height: 3,
      borderRadius: radius.pill,
      backgroundColor: colors.divider,
      overflow: "hidden",
    },
    progressFill: {
      height: 3,
      borderRadius: radius.pill,
      backgroundColor: colors.brand.secondary,
    },
    progressLabel: {
      width: 30,
      color: colors.text.secondary,
      fontFamily: fonts.ui.medium,
      fontSize: typography.metadata.sizeMin,
      lineHeight:
        typography.metadata.sizeMin * typography.metadata.lineHeightFactor,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    rowMissing: {
      opacity: 0.52,
    },
    favoriteButton: {
      width: interaction.preferredTarget,
      minHeight: interaction.preferredTarget,
      marginRight: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    favoriteButtonPending: {
      opacity: 0.45,
    },
  });
