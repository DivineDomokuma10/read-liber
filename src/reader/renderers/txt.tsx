import { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";

import type { RendererProps } from "./types";
import { usePlainText } from "./common/usePlainText";
import { readerStyle as styles } from "@/styles";

/**
 * TXT strategy — progress model: `percent` (scroll position), page pinned
 * to 1. Restores the DB percent once both viewport and content heights are
 * known; content must exist before a scroll offset is settable, which is
 * why restore rides on onContentSizeChange + onLayout rather than mount.
 */
export function TxtRenderer({ uri, restore, onPositionChange }: RendererProps) {
  const state = usePlainText(uri);
  const scrolledRef = useRef<ScrollView | null>(null);
  const restoreRef = useRef({
    viewportHeight: 0,
    contentHeight: 0,
    applied: false,
    percent: restore.percent,
  });

  const paragraphs = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    return state.text
      .split(/\n[ \t]*\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [state]);

  const tryRestore = () => {
    const r = restoreRef.current;
    if (r.applied || !scrolledRef.current) {
      return;
    }
    if (!r.viewportHeight || !r.contentHeight) {
      return;
    }

    r.applied = true;
    const denominator = Math.max(r.contentHeight - r.viewportHeight, 1);
    scrolledRef.current.scrollTo({
      y: denominator * (r.percent / 100),
      animated: false,
    });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const denominator = Math.max(contentSize.height - layoutMeasurement.height, 1);
    const ratio = Math.min(Math.max(contentOffset.y / denominator, 0), 1);
    onPositionChange(1, Math.round(ratio * 1000) / 10);
  };

  return (
    <View
      style={styles.rendererWrap}
      onLayout={(e) => {
        restoreRef.current.viewportHeight = e.nativeEvent.layout.height;
        tryRestore();
      }}
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

      {state.status === "ready" ? (
        <ScrollView
          ref={(node) => {
            scrolledRef.current = node;
          }}
          style={styles.contentScroll}
          onScroll={handleScroll}
          onContentSizeChange={(_, height) => {
            restoreRef.current.contentHeight = height;
            tryRestore();
          }}
          scrollEventThrottle={64}
        >
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
