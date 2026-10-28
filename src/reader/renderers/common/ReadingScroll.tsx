import { ReactNode, useCallback, useRef } from "react";
import {
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  View,
} from "react-native";

import type { ReaderPosition } from "../types";
import { readerStyle as styles } from "@/styles";

type ReadingScrollProps = {
  restore: ReaderPosition;
  onPositionChange: (page: number, percent: number) => void;
  /** True once the strategy has real content to show; gates the ScrollView. */
  ready: boolean;
  children: ReactNode;
};

/**
 * Scroll shell for every percent-based strategy (TXT, MD, and DOCX-text via
 * the TXT pipeline). Owns the scroll restore + percent reporting entirely:
 * strategies pass content and never touch refs.
 *
 * Restore applies once per mount, riding on measurement: percent needs both
 * viewport height (onLayout) and content height (onContentSizeChange)
 * before an offset is settable.
 */
export function ReadingScroll({
  restore,
  onPositionChange,
  ready,
  children,
}: ReadingScrollProps) {
  const scrollRef = useRef<ScrollView | null>(null);
  const measured = useRef({ viewportHeight: 0, contentHeight: 0, applied: false });
  const restorePercent = useRef(restore.percent);

  const tryRestore = useCallback(() => {
    const m = measured.current;
    if (m.applied || !scrollRef.current) {
      return;
    }
    if (!m.viewportHeight || !m.contentHeight) {
      return;
    }

    m.applied = true;
    const denominator = Math.max(m.contentHeight - m.viewportHeight, 1);
    scrollRef.current.scrollTo({
      y: denominator * (restorePercent.current / 100),
      animated: false,
    });
  }, []);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    measured.current.viewportHeight = e.nativeEvent.layout.height;
    tryRestore();
  }, [tryRestore]);

  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    measured.current.contentHeight = h;
    tryRestore();
  }, [tryRestore]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const denominator = Math.max(
        contentSize.height - layoutMeasurement.height,
        1,
      );
      const ratio = Math.min(Math.max(contentOffset.y / denominator, 0), 1);
      onPositionChange(1, Math.round(ratio * 1000) / 10);
    },
    [onPositionChange],
  );

  return (
    <View style={styles.rendererWrap} onLayout={handleLayout}>
      {ready ? (
        <ScrollView
          ref={scrollRef}
          style={styles.contentScroll}
          contentContainerStyle={styles.contentPadding}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={64}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );
}
