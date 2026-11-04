import { StyleSheet } from "react-native";

import type { ThemePalette } from "@/theme";
import {
  fonts,
  glassSurface,
  interaction,
  layout,
  radius,
  tracking,
  typography,
} from "@/theme";

/**
 * Library screen styles — DS chunks DS-10/DS-12/DS-15 restyle values.
 * Values not yet restyled keep their pre-design colors pending their chunk.
 */
export const makeLibraryStyle = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: layout.headerGutter,
      paddingVertical: 12,
    },
    headerTitleBlock: {
      gap: 5,
    },
    headerEyebrow: {
      color: colors.text.secondary,
      fontFamily: fonts.ui.bold,
      fontSize: typography.eyebrow.sizeMin,
      lineHeight: typography.eyebrow.sizeMin,
      letterSpacing: typography.eyebrow.sizeMin * tracking.eyebrow,
      textTransform: "uppercase",
    },
    searchHeader: {
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: layout.screenGutter,
    },
    headerTitle: {
      color: colors.text.primary,
      fontFamily: fonts.ui.semiBold,
      fontSize: typography.screenTitle.size,
      lineHeight:
        typography.screenTitle.size * typography.screenTitle.lineHeightFactor,
      letterSpacing: typography.screenTitle.size * tracking.title,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    filters: {
      minHeight: 44,
      paddingHorizontal: layout.screenGutter,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    themeIndicator: {
      width: interaction.preferredTarget,
      height: interaction.preferredTarget,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      ...glassSurface(colors),
    },
    searchField: {
      flex: 1,
      minHeight: interaction.preferredTarget,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: radius.medium,
      ...glassSurface(colors),
    },
    searchIcon: {
      marginLeft: 14,
    },
    searchInput: {
      flex: 1,
      minHeight: interaction.preferredTarget,
      paddingLeft: 10,
      paddingRight: 4,
      paddingVertical: 8,
      color: colors.text.primary,
      fontFamily: fonts.ui.regular,
      fontSize: 16,
    },
    searchClear: {
      width: interaction.preferredTarget,
      height: interaction.preferredTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    searchClearLabel: {
      color: colors.text.secondary,
      fontSize: 24,
      lineHeight: 26,
    },
    searchCancel: {
      minWidth: 60,
      minHeight: interaction.preferredTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    searchCancelLabel: {
      color: colors.text.primary,
      fontFamily: fonts.ui.semiBold,
      fontSize: 14,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      paddingHorizontal: 20,
      paddingVertical: 8,
      opacity: 0.6,
    },
    listWrap: {
      flex: 1,
    },
    listContent: {
      paddingBottom: 104,
    },
    stateContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingBottom: 56,
    },
    stateTitle: {
      marginBottom: 8,
      fontSize: 20,
      fontWeight: "600",
      textAlign: "center",
    },
    stateMessage: {
      marginTop: 12,
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.65,
      textAlign: "center",
    },
    retryButton: {
      minWidth: 112,
      minHeight: interaction.preferredTarget,
      marginTop: 24,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22,
      // Primary CTA fills use the brand color (DS §9); full restyle in DS-7.
      backgroundColor: colors.brand.primary,
    },
    retryButtonLabel: {
      // Label over a dark fill; inverted-on-dark token arrives with DS-7.
      color: "#fff",
      fontSize: 15,
      fontWeight: "600",
    },
    primaryStateButton: {
      minWidth: 112,
      marginTop: 24,
    },
    secondaryStateButton: {
      minWidth: 144,
      minHeight: interaction.preferredTarget,
      marginTop: 8,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryStateButtonLabel: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    errorBanner: {
      minHeight: 48,
      marginHorizontal: 20,
      marginBottom: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 8,
      // Error banner tones are restyled in DS-15.
      backgroundColor: "#FFF4E8",
    },
    errorBannerText: {
      flex: 1,
      color: "#6A3511",
      fontSize: 13,
      lineHeight: 18,
    },
    errorBannerAction: {
      minWidth: interaction.preferredTarget,
      minHeight: interaction.preferredTarget,
      color: "#6A3511",
      fontSize: 14,
      fontWeight: "700",
      lineHeight: interaction.preferredTarget,
      textAlign: "center",
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
      // Primary CTA fills use the brand color (DS §9); full restyle in DS-14.
      backgroundColor: colors.brand.primary,
    },
    fabLabel: {
      fontSize: 28,
      lineHeight: 30,
      // Inverted-on-dark token arrives with DS-7/DS-14.
      color: "#fff",
    },
  });
