import { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import type { RendererProps } from "./types";
import type { MdBlock } from "./common/markdown";
import { parseMarkdown } from "./common/markdown";
import { InlineText } from "./common/InlineText";
import { usePlainText } from "./common/usePlainText";
import { ReadingScroll } from "./common/ReadingScroll";
import { readerStyle as styles } from "@/styles";

const HEADING_STYLE: Record<number, string> = {
  1: "mdH1",
  2: "mdH2",
  3: "mdH3",
  4: "mdH4",
  5: "mdH5",
  6: "mdH6",
};

function renderBlock(block: MdBlock) {
  switch (block.kind) {
    case "heading": {
      const styleKey = HEADING_STYLE[block.level];
      return styleKey ? (
        <Text style={styles[styleKey as keyof typeof styles]}>
          <InlineText spans={block.spans} />
        </Text>
      ) : null;
    }
    case "paragraph":
      return (
        <Text style={styles.paragraph}>
          <InlineText spans={block.spans} />
        </Text>
      );
    case "listItem":
      return (
        <View
          style={[
            styles.mdListRow,
            block.indent > 0 && { paddingLeft: block.indent * 16 },
          ]}
        >
          <Text style={styles.mdListMarker}>{block.label}</Text>
          <Text style={styles.mdListItemText}>
            <InlineText spans={block.spans} />
          </Text>
        </View>
      );
    case "code":
      return (
        <Text style={styles.mdCodeBlock}>
          {block.text}
          {"\n"}
        </Text>
      );
    case "quote":
      return (
        <Text style={styles.mdQuote}>
          <InlineText spans={block.spans} />
        </Text>
      );
    case "rule":
      return <View style={styles.mdRule} />;
  }
}

/**
 * MD strategy — same progress model as TXT (scroll percent), same text
 * loader, but a real Markdown block structure instead of raw paragraphs.
 * Indented lists become flat rows with a fixed indent step; nested
 * constructs like tables and images render as literal text (spec:23 scope).
 */
export function MdRenderer({ uri, restore, onPositionChange }: RendererProps) {
  const state = usePlainText(uri);
  const ready = state.status === "ready";

  const blocks = useMemo(
    () => (ready ? parseMarkdown(state.text) : []),
    [ready, state],
  );

  return (
    <ReadingScroll
      restore={restore}
      onPositionChange={onPositionChange}
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
        ? blocks.map((block, index) => (
            <View key={index}>{renderBlock(block)}</View>
          ))
        : null}
    </ReadingScroll>
  );
}
