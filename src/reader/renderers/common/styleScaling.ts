import { useMemo } from "react";
import type { TextStyle } from "react-native";

import { makeReaderStyle, type ReaderStyle } from "@/styles";
import { useTheme } from "@/theme/useTheme";
import type { ThemePalette } from "@/theme";

/**
 * Typography keys that respond to the reader's global text-size preference.
 * Layout-only styles (lists' flex containers, code block padding, rules) stay
 * untouched; everything with a fontSize breathes with the scale.
 */
const TEXT_KEYS = [
  "paragraph",
  "mdH1",
  "mdH2",
  "mdH3",
  "mdH4",
  "mdH5",
  "mdH6",
  "mdListMarker",
  "mdListItemText",
  "mdQuote",
  "mdCodeBlock",
  "spanCode",
  "docxUnsupported",
  "docxCaption",
  "tblCellText",
  "docxChartTitle",
  "docxChartLabel",
  "docxChartBarLabel",
  "docxChartNote",
] as const;

type TextKey = (typeof TEXT_KEYS)[number];

function scaleTextStyle(style: TextStyle, scale: number): TextStyle {
  if (scale === 1 || style.fontSize === undefined) {
    return { ...style };
  }
  const scaled: TextStyle = {
    ...style,
    fontSize: Math.round(style.fontSize * scale),
    lineHeight:
      style.lineHeight != null
        ? Math.round(
            typeof style.lineHeight === "number" ? style.lineHeight * scale : style.lineHeight,
          )
        : undefined,
  };
  if (typeof style.marginTop === "number") {
    scaled.marginTop = Math.round(style.marginTop * scale);
  }
  if (typeof style.marginBottom === "number") {
    scaled.marginBottom = Math.round(style.marginBottom * scale);
  }
  return scaled;
}

/**
 * Returns the reader style sheet for `colors`, with typography scaled by
 * `scale` (1 = the base sheet). Recomputed cheaply on preference changes;
 * text strategies memoize it so in-flight renders never see a mixed scale.
 */
export function makeScaledReaderStyles(
  colors: ThemePalette,
  scale: number,
): ReaderStyle {
  const readerStyle = makeReaderStyle(colors);
  if (scale === 1) {
    return readerStyle;
  }
  const scaled = TEXT_KEYS.reduce((map, key) => {
    map[key] = scaleTextStyle(readerStyle[key] as TextStyle, scale);
    return map;
  }, {} as Record<TextKey, TextStyle>);
  return { ...readerStyle, ...scaled } as ReaderStyle;
}

/** Hook form for renderers: theme colors + font-size scale → style sheet. */
export function useScaledReaderStyles(scale: number): ReaderStyle {
  const { colors } = useTheme();
  return useMemo(
    () => makeScaledReaderStyles(colors, scale),
    [colors, scale],
  );
}
