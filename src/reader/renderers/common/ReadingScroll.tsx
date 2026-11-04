import { ReactNode, useCallback, useRef } from "react";
import {
  Pressable,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  View,
} from "react-native";

import type { ReaderPosition } from "../types";
import { makeReaderStyle } from "@/styles";
import { useStyles } from "@/theme/useTheme";

type ReadingScrollProps = {
  restore: ReaderPosition;
  onPositionChange: (page: number, percent: number) => void;
  /**
   * Fired for a user-initiated scroll gesture (begin-drag and momentum),
   * NOT for the programmatic restore scroll — the screen auto-hides reading
   * controls on this signal.
   */
  onScrollStart?: () => void;
  /**
   * Fired for a tap on the content. RN's touch system discriminates the
   * gesture for us: drags/flings turn into scroll events, so a resolved
   * "press" here is a genuine tap.
   */
  onTap?: () => void;
  /** True once the strategy has real content to show; gates the ScrollView. */
  ready: boolean;
  children: ReactNode;
};

/**
 * Scroll shell for every percent-based strategy (TXT, MD, and the structured
 * DOCX block pipeline). Owns the scroll restore + percent reporting entirely:
 * strategies pass content and never touch refs.
 *
 * Restore applies once per mount, riding on measurement: percent needs both
 * viewport height (onLayout) and content height (onContentSizeChange)
 * before an offset is settable.
 */
export function ReadingScroll({
  restore,
  onPositionChange,
  onScrollStart,
  onTap,
  ready,
  children,
}: ReadingScrollProps) {
  const styles = useStyles(makeReaderStyle);
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

  const signalScrollStart = useCallback(() => {
    onScrollStart?.();
  }, [onScrollStart]);

  const content = onTap ? (
    <Pressable
      accessible={false}
      onPress={onTap}
      style={styles.contentPadding}
    >
      {children}
    </Pressable>
  ) : (
    <View style={styles.contentPadding}>{children}</View>
  );

  return (
    <View style={styles.rendererWrap} onLayout={handleLayout}>
      {ready ? (
        <ScrollView
          ref={scrollRef}
          style={styles.contentScroll}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={64}
          onScrollBeginDrag={signalScrollStart}
          onMomentumScrollBegin={signalScrollStart}
        >
          {content}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );
}
