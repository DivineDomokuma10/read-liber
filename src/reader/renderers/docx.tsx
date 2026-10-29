import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import type { RendererProps } from "./types";
import type { DocxBlock } from "./common/docx/blocks";
import { useDocxDocument } from "./common/useDocxDocument";
import { ReadingScroll } from "./common/ReadingScroll";
import { scaledReaderStyles } from "./common/styleScaling";

const HEADING_STYLE: Record<number, string> = {
  1: "mdH1",
  2: "mdH2",
  3: "mdH3",
  4: "mdH4",
  5: "mdH5",
  6: "mdH6",
};

/** Reserved height until the image's true aspect ratio is known on load. */
const IMAGE_PLACEHOLDER_HEIGHT = 200;
const IMAGE_MAX_HEIGHT = 480;
const VIEWER_IMAGE_MAX_HEIGHT = 640;

/**
 * Fullscreen image viewer: dark modal, contain-fit image, pinch where the
 * platform ScrollView supports it (iOS), ✕ + hardware back to dismiss.
 */
function DocxImageViewer({
  uri,
  caption,
  onClose,
  styles,
}: {
  uri: string;
  caption: string | null;
  onClose: () => void;
  styles: ReturnType<typeof scaledReaderStyles>;
}) {
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <Modal
      visible
      transparent={false}
      animationType="fade"
      accessibilityLabel={`Image viewer${caption ? `: ${caption}` : ""}`}
      onRequestClose={onClose}
    >
      <View style={styles.viewerOverlay}>
        <ScrollView
          style={{ flex: 1 }}
          maximumZoomScale={3}
          minimumZoomScale={1}
          centerContent
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Image
            source={{ uri }}
            style={{
              width: "100%",
              height: ratio === null ? IMAGE_PLACEHOLDER_HEIGHT : undefined,
              aspectRatio: ratio === null ? undefined : 1 / Math.max(ratio, 0.01),
              maxHeight: VIEWER_IMAGE_MAX_HEIGHT,
            }}
            resizeMode="contain"
            onLoad={(e) => {
              const { width, height: imgHeight } = e.nativeEvent.source ?? {};
              if (imgHeight && width) {
                setRatio(imgHeight / width);
              }
            }}
          />
        </ScrollView>

        {caption ? <Text style={styles.docxCaption}>{caption}</Text> : null}

        <Pressable
          onPress={onClose}
          style={styles.viewerCloseTouch}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close image viewer"
        >
          <Text style={styles.viewerCloseLabel}>{"\u2715"}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

/**
 * Inline image with aspect-ratio fit: reserved height up front (no scroll
 * jumps while loading), measured ratio on load, contain-fit within viewport
 * width and a max display height. A failed image degrades to text, never
 * an error state — the document keeps reading.
 */
function DocxImage({
  uri,
  caption,
  onOpen,
  styles,
}: {
  uri: string;
  caption: string | null;
  onOpen: () => void;
  styles: ReturnType<typeof scaledReaderStyles>;
}) {
  const [ratio, setRatio] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  // uri swaps re-mount via key in the JSX below — state resets for free.

  if (failed) {
    return <Text style={styles.docxUnsupported}>[ image unavailable ]</Text>;
  }

  const height =
    ratio === null
      ? IMAGE_PLACEHOLDER_HEIGHT
      : Math.min(Math.round(ratio * 10000) / 10, IMAGE_MAX_HEIGHT);

  return (
    <View style={styles.docxImageWrap}>
      <Pressable onPress={onOpen} accessibilityRole="imagebutton" accessibilityLabel="View image fullscreen">
        <Image
          source={{ uri }}
          style={[
            styles.docxImage,
            ratio !== null && styles.docxImageLoaded,
            ratio !== null && { height },
          ]}
          resizeMode="contain"
          onLoad={(e) => {
            const { width, height: imgHeight } = e.nativeEvent.source ?? {};
            if (imgHeight && width) {
              setRatio(imgHeight / width);
            }
          }}
          onError={() => setFailed(true)}
        />
      </Pressable>
      {caption ? (
        <Text style={styles.docxCaption}>{caption}</Text>
      ) : null}
    </View>
  );
}

/**
 * DOCX table layout, sized for phones:
 *
 * - ≤4 columns: equal-flex grid inside the reading flow — text wraps, no
 *   horizontal chrome at all (the common case reads like the document).
 * - >4 columns: whole table gets its own horizontal ScrollView with a
 *   fixed column width; the global vertical scroll (percent progress) is
 *   untouched.
 */
function DocxTable({
  table,
  styles,
}: {
  table: Extract<DocxBlock, { kind: "table" }>;
  styles: ReturnType<typeof scaledReaderStyles>;
}) {
  const colCount = Math.max(1, ...table.rows.map((row) => row.length));
  const showHeader = table.header && table.rows.length > 1;

  const cells = (row: string[], fixed: boolean) =>
    Array.from({ length: colCount }, (_, col) => (
      <View
        key={col}
        style={
          fixed
            ? styles.tblFixedCell
            : [
                styles.tblCell,
                col > 0 && styles.tblCellDivider,
              ]
        }
      >
        <Text
          style={[
            styles.tblCellText,
            showHeader && row === table.rows[0] && styles.tblHeaderText,
          ]}
        >
          {row[col] ?? ""}
        </Text>
      </View>
    ));

  const rows = (fixed: boolean) =>
    table.rows.map((row, rowIndex) => (
      <View
        key={rowIndex}
        style={[
          styles.tblRow,
          showHeader && rowIndex === 0 && styles.tblHeaderRow,
          rowIndex > 0 && styles.tblRowDivider,
        ]}
      >
        {cells(row, fixed)}
      </View>
    ));

  if (colCount > 4) {
    return (
      <ScrollView horizontal style={styles.tblScrollX} showsHorizontalScrollIndicator>
        {rows(true)}
      </ScrollView>
    );
  }
  return <View style={styles.tblGrid}>{rows(false)}</View>;
}

function renderBlock(
  block: DocxBlock,
  styles: ReturnType<typeof scaledReaderStyles>,
  mediaUris: Map<string, string>,
  onImageOpen: (uri: string, caption: string | null) => void,
) {
  switch (block.kind) {
    case "paragraph":
      return <Text style={styles.paragraph}>{block.text}</Text>;
    case "heading": {
      const styleKey = HEADING_STYLE[block.level];
      return styleKey ? (
        <Text style={styles[styleKey as keyof typeof styles]}>{block.text}</Text>
      ) : (
        <Text style={styles.paragraph}>{block.text}</Text>
      );
    }
    case "table":
      return <DocxTable table={block} styles={styles} />;
    case "image": {
      const uri = mediaUris.get(block.rid);
      return uri ? (
        <DocxImage
          key={uri}
          uri={uri}
          caption={block.caption}
          onOpen={() => onImageOpen(uri, block.caption)}
          styles={styles}
        />
      ) : (
        <Text style={styles.docxUnsupported}>
          {block.caption ? `[ image unavailable — ${block.caption} ]` : "[ image unavailable ]"}
        </Text>
      );
    }
    case "chart":
      return <Text style={styles.docxUnsupported}>[ chart ]</Text>;
    case "placeholder":
      return <Text style={styles.docxUnsupported}>— {block.label} —</Text>;
  }
}

/**
 * DOCX strategy — renders the structured block model from the two-pass
 * extractor: real headings/paragraphs/tables plus image/chart/SmartArt
 * markers. Phase progression: table layout lands in Phase B, real images
 * and charts in Phase C/D.
 */
export function DocxRenderer({
  uri,
  restore,
  onPositionChange,
  onTap,
  onScrollStart,
  fontSizeScale,
}: RendererProps) {
  const state = useDocxDocument(uri);
  const ready = state.status === "ready";
  const styles = useMemo(
    () => scaledReaderStyles(fontSizeScale ?? 1),
    [fontSizeScale],
  );

  const [viewer, setViewer] = useState<{
    uri: string;
    caption: string | null;
  } | null>(null);

  const onImageOpen = useCallback((uri: string, caption: string | null) => {
    setViewer({ uri, caption });
  }, []);

  const blocks = useMemo(
    () => (ready ? state.document.blocks : []),
    [ready, state],
  );

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
          <Text style={styles.stateMessage}>
            This file has no readable content.
          </Text>
        </View>
      ) : null}

      {state.status === "error" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>Couldn’t open document</Text>
          <Text style={styles.stateMessage}>{state.message}</Text>
        </View>
      ) : null}

      {ready
        ? blocks.map((block, index) => (
            <View key={index}>
              {renderBlock(block, styles, state.document.mediaUris, onImageOpen)}
            </View>
          ))
        : null}

      {viewer ? (
        <DocxImageViewer
          key={viewer.uri}
          uri={viewer.uri}
          caption={viewer.caption}
          onClose={() => setViewer(null)}
          styles={styles}
        />
      ) : null}
    </ReadingScroll>
  );
}
