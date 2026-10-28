import { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import type { RendererProps } from "./types";
import { useDocxText } from "./common/useDocxText";
import { ReadingScroll } from "./common/ReadingScroll";
import { scaledReaderStyles } from "./common/styleScaling";

/**
 * DOCX strategy — V1 trade-off is text-only extraction: real text in
 * reading order, no layout fidelity (tables/geometry/images are out of
 * scope for now). Shares the TXT pipeline's scroll shell + progress model
 * (percent), so position persistence behaves identically across text
 * formats.
 */
export function DocxRenderer({
  uri,
  restore,
  onPositionChange,
  onTap,
  onScrollStart,
  fontSizeScale,
}: RendererProps) {
  const state = useDocxText(uri);
  const ready = state.status === "ready";
  const styles = useMemo(
    () => scaledReaderStyles(fontSizeScale ?? 1),
    [fontSizeScale],
  );

  const paragraphs = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    return state.text
      .split("\n\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [state]);

  return (
    <ReadingScroll
      restore={restore}
      onPositionChange={onPositionChange}
      onTap={onTap}
      onScrollStart={onScrollStart}
      ready={ready}
    >
      {state.status === "loading" ? <ActivityIndicator /> : null}

      {state.status === "empty" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>Empty document</Text>
          <Text style={styles.stateMessage}>This file contains no text.</Text>
        </View>
      ) : null}

      {state.status === "error" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>Couldn’t open document</Text>
          <Text style={styles.stateMessage}>{state.message}</Text>
        </View>
      ) : null}

      {ready
        ? paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))
        : null}
    </ReadingScroll>
  );
}
