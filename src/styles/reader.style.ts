import { StyleSheet } from "react-native";

import type { ThemePalette } from "@/theme";
import {
  fonts,
  interaction,
  radius,
  tracking,
  typography,
} from "@/theme";

/**
 * Reader container, floating chrome, and reading typography styles.
 * Reading content colors are restyled against DS §12 in DS-16; floating
 * chrome in DS-17/DS-18. Every layout key is pre-design and must remain
 * stable for `styleScaling.ts`, which scales these typography entries.
 */
export const makeReaderStyle = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.readingSurface,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    backButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    backLabel: {
      fontSize: 24,
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
    },
    body: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    stateTitle: {
      color: colors.text.primary,
      fontFamily: fonts.ui.bold,
      fontSize: 20,
      textAlign: "center",
    },
    stateMessage: {
      marginTop: 8,
      color: colors.text.secondary,
      fontFamily: fonts.ui.regular,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
    },
    primaryButton: {
      marginTop: 24,
      minHeight: 44,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.button,
      backgroundColor: colors.brand.primary,
    },
    primaryButtonLabel: {
      color: colors.brand.onPrimary,
      fontFamily: fonts.ui.semiBold,
      fontSize: 15,
    },
    secondaryButton: {
      marginTop: 12,
      minHeight: 44,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonLabel: {
      color: colors.text.primary,
      fontFamily: fonts.ui.semiBold,
      fontSize: 15,
    },
    documentType: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 1,
      opacity: 0.4,
    },
    rendererWrap: {
      flex: 1,
    },
    contentScroll: {
      flex: 1,
    },
    paragraph: {
      color: colors.readingText,
      fontFamily: fonts.reading.regular,
      fontSize: typography.readingBody.size,
      lineHeight:
        typography.readingBody.size * typography.readingBody.lineHeightFactor,
      marginBottom: 19,
    },
    contentPadding: {
      paddingTop: 104,
      paddingHorizontal: 33,
      paddingBottom: 64,
    },
    mdH1: {
      color: colors.readingText,
      fontFamily: fonts.reading.medium,
      fontSize: typography.readingTitle.size,
      lineHeight:
        typography.readingTitle.size * typography.readingTitle.lineHeightFactor,
      letterSpacing: typography.readingTitle.size * tracking.readingTitle,
      marginTop: 0,
      marginBottom: 28,
    },
    mdH2: {
      color: colors.readingText,
      fontFamily: fonts.reading.semiBold,
      fontSize: 24,
      lineHeight: 33,
      marginTop: 24,
      marginBottom: 12,
    },
    mdH3: {
      color: colors.readingText,
      fontFamily: fonts.reading.semiBold,
      fontSize: typography.readingSection.size,
      lineHeight:
        typography.readingSection.size *
        typography.readingSection.lineHeightFactor,
      marginTop: 20,
      marginBottom: 10,
    },
    mdH4: {
      color: colors.readingText,
      fontFamily: fonts.reading.semiBold,
      fontSize: 17,
      lineHeight: 24,
      marginTop: 18,
      marginBottom: 8,
    },
    mdH5: {
      color: colors.readingText,
      fontFamily: fonts.reading.semiBold,
      fontSize: 16,
      lineHeight: 22,
      marginTop: 16,
      marginBottom: 6,
    },
    mdH6: {
      color: colors.text.secondary,
      fontFamily: fonts.reading.semiBold,
      fontSize: 15,
      lineHeight: 21,
      marginTop: 12,
      marginBottom: 6,
    },
    spanStrong: {
      fontFamily: fonts.reading.semiBold,
    },
    spanEm: {
      fontFamily: fonts.reading.regularItalic,
    },
    spanCode: {
      fontFamily: "monospace",
      backgroundColor: colors.background.secondary,
      fontSize: 15,
    },
    spanLink: {
      textDecorationLine: "underline",
      color: colors.brand.secondary,
    },
    mdListRow: {
      flexDirection: "row",
      marginBottom: 8,
    },
    mdListMarker: {
      color: colors.readingText,
      fontFamily: fonts.reading.regular,
      fontSize: typography.readingBody.size,
      lineHeight:
        typography.readingBody.size * typography.readingBody.lineHeightFactor,
      width: 26,
    },
    mdListItemText: {
      flex: 1,
      color: colors.readingText,
      fontFamily: fonts.reading.regular,
      fontSize: typography.readingBody.size,
      lineHeight:
        typography.readingBody.size * typography.readingBody.lineHeightFactor,
    },
    mdCodeBlock: {
      fontFamily: "monospace",
      fontSize: 14,
      lineHeight: 22,
      backgroundColor: colors.background.secondary,
      padding: 12,
      borderRadius: radius.small,
      marginBottom: 19,
      color: colors.readingText,
    },
    mdQuote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.brand.secondary,
      paddingLeft: 12,
      color: colors.readingText,
      fontFamily: fonts.reading.regular,
      fontSize: typography.readingBody.size,
      lineHeight:
        typography.readingBody.size * typography.readingBody.lineHeightFactor,
      marginBottom: 19,
    },
    mdRule: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      marginVertical: 16,
    },
    docxUnsupported: {
      color: colors.text.secondary,
      fontFamily: fonts.ui.regular,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 14,
    },
    docxImageWrap: {
      alignItems: "center",
      marginBottom: 16,
    },
    docxImage: {
      width: "100%",
      height: 200,
      backgroundColor: colors.background.secondary,
    },
    docxImageLoaded: {
      backgroundColor: undefined,
    },
    docxCaption: {
      marginTop: -6,
      color: colors.text.secondary,
      fontFamily: fonts.ui.regular,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
    },
    viewerOverlay: {
      flex: 1,
      // Image viewer overlays on black by design (photos); not themed.
      backgroundColor: "#000",
    },
    viewerCloseTouch: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
    },
    viewerCloseLabel: {
      fontSize: 20,
      color: "#fff",
    },
    docxChart: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      borderRadius: radius.small,
      padding: 10,
      marginBottom: 16,
    },
    docxChartTitle: {
      color: colors.readingText,
      fontFamily: fonts.reading.semiBold,
      fontSize: 15,
      marginBottom: 8,
    },
    docxChartLabel: {
      color: colors.readingText,
      fontFamily: fonts.reading.regular,
      fontSize: 12,
      lineHeight: 16,
    },
    docxChartBarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    docxChartBarLabel: {
      color: colors.readingText,
      fontFamily: fonts.ui.regular,
      fontSize: 12,
      lineHeight: 16,
      width: 84,
    },
    docxChartBarTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.divider,
      overflow: "hidden",
      flexDirection: "row",
    },
    docxChartBarSegment: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.brand.secondary,
    },
    docxChartNote: {
      marginTop: 8,
      color: colors.text.secondary,
      fontFamily: fonts.ui.regular,
      fontSize: 12,
      lineHeight: 16,
    },
    tblGrid: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      borderRadius: radius.small,
      overflow: "hidden",
      marginBottom: 16,
    },
    tblScrollX: {
      marginBottom: 16,
    },
    tblRow: {
      flexDirection: "row",
    },
    tblRowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    tblCell: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 6,
      minHeight: 32,
      justifyContent: "center",
    },
    tblCellDivider: {
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: colors.divider,
    },
    tblFixedCell: {
      width: 116,
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    tblCellText: {
      color: colors.readingText,
      fontFamily: fonts.reading.regular,
      fontSize: 14,
      lineHeight: 19,
    },
    tblHeaderText: {
      fontFamily: fonts.reading.semiBold,
    },
    tblHeaderRow: {
      backgroundColor: colors.brand.soft,
    },
    controlsBar: {
      position: "absolute",
      bottom: 16,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      minHeight: 44,
      paddingLeft: 8,
      paddingRight: 16,
      borderRadius: 22,
      backgroundColor: "#fff",
      // Elevation/shadow so the pill survives PDF pages with white backgrounds.
      shadowColor: "#000",
      shadowOpacity: 0.14,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    controlsButton: {
      width: interaction.preferredTarget,
      height: interaction.preferredTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    controlsButtonLabel: {
      fontSize: 22,
    },
    controlsSizeLabel: {
      fontSize: 16,
      fontWeight: "700",
    },
    controlsSizeDisabled: {
      opacity: 0.25,
    },
    positionLabel: {
      minWidth: 68,
      textAlign: "center",
      fontSize: 13,
      fontWeight: "600",
      color: colors.text.primary,
      opacity: 0.85,
    },
  });
