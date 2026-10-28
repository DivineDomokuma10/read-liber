import { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import type { RendererProps } from "./types";
import { usePlainText } from "./common/usePlainText";
import { ReadingScroll } from "./common/ReadingScroll";
import { readerStyle as styles } from "@/styles";

/**
 * TXT strategy — progress model: `percent` (scroll position), page pinned
 * to 1. Paragraph blocks instead of one giant <Text> so large files never
 * stall layout on a single node.
 */
export function TxtRenderer({
  uri,
  restore,
  onPositionChange,
  onTap,
  onScrollStart,
}: RendererProps) {
  const state = usePlainText(uri);
  const ready = state.status === "ready";

  const paragraphs = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    return state.text
      .split(/\n[ \t]*\n+/)
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
          <Text style={styles.stateTitle}>Couldn’t open file</Text>
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
