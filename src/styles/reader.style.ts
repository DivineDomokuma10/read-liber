import { StyleSheet } from "react-native";

import type { ThemePalette } from "@/theme";

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
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
    },
    stateMessage: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      opacity: 0.6,
    },
    primaryButton: {
      marginTop: 24,
      minHeight: 44,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22,
      // Primary CTA fill (DS §9); full restyle lands in DS-7.
      backgroundColor: colors.brand.primary,
    },
    primaryButtonLabel: {
      fontSize: 15,
      fontWeight: "600",
      // Inverted-on-dark token arrives with DS-7.
      color: "#fff",
    },
    secondaryButton: {
      marginTop: 12,
      minHeight: 44,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text.primary,
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
      fontSize: 16,
      lineHeight: 26,
      marginBottom: 14,
      color: colors.text.primary,
    },
    contentPadding: {
      padding: 20,
    },
    mdH1: {
      fontSize: 26,
      fontWeight: "700",
      lineHeight: 32,
      marginTop: 20,
      marginBottom: 10,
      color: colors.text.primary,
    },
    mdH2: {
      fontSize: 22,
      fontWeight: "700",
      lineHeight: 28,
      marginTop: 18,
      marginBottom: 8,
      color: colors.text.primary,
    },
    mdH3: {
      fontSize: 19,
      fontWeight: "600",
      lineHeight: 25,
      marginTop: 16,
      marginBottom: 8,
      color: colors.text.primary,
    },
    mdH4: {
      fontSize: 17,
      fontWeight: "600",
      lineHeight: 23,
      marginTop: 14,
      marginBottom: 6,
      color: colors.text.primary,
    },
    mdH5: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 22,
      marginTop: 12,
      marginBottom: 6,
      color: colors.text.primary,
    },
    mdH6: {
      fontSize: 15,
      fontWeight: "600",
      lineHeight: 21,
      marginTop: 12,
      marginBottom: 6,
      opacity: 0.8,
      color: colors.text.primary,
    },
    spanStrong: {
      fontWeight: "700",
    },
    spanEm: {
      fontStyle: "italic",
    },
    spanCode: {
      fontFamily: "monospace",
      // Inline code tone is restyled in DS-16.
      backgroundColor: "#f2f2f2",
      fontSize: 15,
    },
    spanLink: {
      textDecorationLine: "underline",
      color: colors.text.primary,
    },
    mdListRow: {
      flexDirection: "row",
      marginBottom: 8,
    },
    mdListMarker: {
      fontSize: 16,
      lineHeight: 26,
      width: 26,
      color: colors.text.primary,
    },
    mdListItemText: {
      flex: 1,
      fontSize: 16,
      lineHeight: 26,
      color: colors.text.primary,
    },
    mdCodeBlock: {
      fontFamily: "monospace",
      fontSize: 14,
      lineHeight: 22,
      // Code block tone is restyled in DS-16.
      backgroundColor: "#f5f5f5",
      padding: 12,
      borderRadius: 6,
      marginBottom: 14,
      color: colors.text.primary,
    },
    mdQuote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.divider,
      paddingLeft: 12,
      fontSize: 16,
      lineHeight: 26,
      marginBottom: 14,
      opacity: 0.75,
      color: colors.text.primary,
    },
    mdRule: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      marginVertical: 16,
    },
    docxUnsupported: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 14,
      opacity: 0.55,
      color: colors.text.primary,
    },
    docxImageWrap: {
      alignItems: "center",
      marginBottom: 16,
    },
    docxImage: {
      width: "100%",
      height: 200,
      backgroundColor: "#f5f5f5",
    },
    docxImageLoaded: {
      backgroundColor: undefined,
    },
    docxCaption: {
      marginTop: -6,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
      opacity: 0.6,
      color: colors.text.primary,
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
      borderColor: "#d0d0d0",
      borderRadius: 4,
      padding: 10,
      marginBottom: 16,
    },
    docxChartTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 8,
      color: colors.text.primary,
    },
    docxChartLabel: {
      fontSize: 12,
      lineHeight: 16,
      color: colors.text.primary,
    },
    docxChartBarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    docxChartBarLabel: {
      fontSize: 12,
      lineHeight: 16,
      width: 84,
      color: colors.text.primary,
      opacity: 0.8,
    },
    docxChartBarTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#ececec",
      overflow: "hidden",
      flexDirection: "row",
    },
    docxChartBarSegment: {
      height: 6,
      borderRadius: 3,
      backgroundColor: "#2e2e2e",
    },
    docxChartNote: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 16,
      opacity: 0.55,
      color: colors.text.primary,
    },
    tblGrid: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#d0d0d0",
      borderRadius: 4,
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
      borderTopColor: "#d0d0d0",
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
      borderLeftColor: "#d0d0d0",
    },
    tblFixedCell: {
      width: 116,
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    tblCellText: {
      fontSize: 14,
      lineHeight: 19,
      color: colors.text.primary,
    },
    tblHeaderText: {
      fontWeight: "700",
    },
    tblHeaderRow: {
      backgroundColor: "#fafafa",
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
      width: 44,
      height: 44,
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
