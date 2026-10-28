import { useRef, useState } from "react";
import { Text, View } from "react-native";
import Pdf from "react-native-pdf";

import type { RendererProps } from "./types";
import { readerStyle as styles } from "@/styles";

/**
 * PDF strategy — native pdfium rendering (react-native-pdf), which is why
 * this format broke out of Expo Go: it needs a dev build.
 *
 * Progress model: real pages (restore.page), percent reported for the
 * library row ("PDF · Page 37 · 37%"). Pinch + double-tap zoom come from
 * the native view; the strategy wires page persistence only.
 */
export function PdfRenderer({
  uri,
  restore,
  onPositionChange,
  onTap,
  onScrollStart,
}: RendererProps) {
  const [error, setError] = useState<string | null>(null);
  // Initial page is a mount-time decision; later changes come from the user.
  const [initialPage] = useState(() => Math.max(Math.round(restore.page) || 1, 1));
  // The first onPageChanged is often the initial layout's page settle, not a
  // user gesture — skip it before treating page moves as navigation.
  const pageEventCount = useRef(0);

  if (error) {
    return (
      <View style={styles.body}>
        <Text style={styles.stateTitle}>Couldn’t open PDF</Text>
        <Text style={styles.stateMessage}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.rendererWrap}>
      <Pdf
        source={{ uri }}
        page={initialPage}
        fitPolicy={0}
        spacing={8}
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        onPageChanged={(page, total) => {
          pageEventCount.current += 1;
          onPositionChange(page, total > 0 ? Math.round((page / total) * 100) : 0);
          if (pageEventCount.current > 1) {
            onScrollStart?.();
          }
        }}
        onPageSingleTap={() => {
          onTap?.();
        }}
        onError={(e: unknown) => {
          const message =
            typeof e === "string"
              ? e
              : e instanceof Error
                ? e.message
                : "This PDF could not be displayed.";
          setError(message);
        }}
      />
    </View>
  );
}
