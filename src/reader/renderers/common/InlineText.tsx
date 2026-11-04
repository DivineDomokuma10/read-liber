import { ReactNode } from "react";
import { Text } from "react-native";

import type { InlineSpan } from "./markdown";
import { makeReaderStyle, type ReaderStyle } from "@/styles";
import { useStyles } from "@/theme/useTheme";

type InlineTextProps = {
  spans: InlineSpan[];
  /** Scaled style sheet variant (see useScaledReaderStyles); defaults to base. */
  overrideStyles?: ReaderStyle;
};

/**
 * Renders parsed inline spans as nested <Text>, preserving nesting as RN
 * requires for mixed styling (bold/italic/code/link inside one line).
 */
export function InlineText({ spans, overrideStyles }: InlineTextProps): ReactNode {
  const styles = useStyles(makeReaderStyle);
  const resolved = overrideStyles ?? styles;
  return spans.map((span, index) => {
    switch (span.type) {
      case "strong":
        return (
          <Text key={index} style={resolved.spanStrong}>
            {span.text}
          </Text>
        );
      case "em":
        return (
          <Text key={index} style={resolved.spanEm}>
            {span.text}
          </Text>
        );
      case "code":
        return (
          <Text key={index} style={resolved.spanCode}>
            {span.text}
          </Text>
        );
      case "link":
        return (
          <Text key={index} style={resolved.spanLink}>
            {span.text}
          </Text>
        );
      default:
        return span.text;
    }
  });
}
