import { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";

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

function renderBlock(block: DocxBlock, styles: ReturnType<typeof scaledReaderStyles>) {
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
      return (
        <Text style={styles.docxUnsupported}>
          [ table, {block.rows.length} {block.rows.length === 1 ? "row" : "rows"} ]
        </Text>
      );
    case "image":
      return <Text style={styles.docxUnsupported}>[ image ]</Text>;
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
            <View key={index}>{renderBlock(block, styles)}</View>
          ))
        : null}
    </ReadingScroll>
  );
}
