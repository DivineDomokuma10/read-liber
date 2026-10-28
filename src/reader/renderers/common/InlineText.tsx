import { ReactNode } from "react";
import { Text } from "react-native";

import type { InlineSpan } from "./markdown";
import { readerStyle as styles } from "@/styles";

/**
 * Renders parsed inline spans as nested <Text>, preserving nesting as RN
 * requires for mixed styling (bold/italic/code/link inside one line).
 */
export function InlineText({ spans }: { spans: InlineSpan[] }): ReactNode {
  return spans.map((span, index) => {
    switch (span.type) {
      case "strong":
        return (
          <Text key={index} style={styles.spanStrong}>
            {span.text}
          </Text>
        );
      case "em":
        return (
          <Text key={index} style={styles.spanEm}>
            {span.text}
          </Text>
        );
      case "code":
        return (
          <Text key={index} style={styles.spanCode}>
            {span.text}
          </Text>
        );
      case "link":
        return (
          <Text key={index} style={styles.spanLink}>
            {span.text}
          </Text>
        );
      default:
        return span.text;
    }
  });
}
