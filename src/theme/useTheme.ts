import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { darkPalette } from "./colors.dark";
import { lightPalette } from "./colors.light";
import type { ThemePalette } from "./palette.types";

export type Theme = {
  isDark: boolean;
  colors: ThemePalette;
};

/** Follows the system color scheme; palette values come from the DS §3 tokens. */
export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return useMemo(
    () => ({ isDark, colors: isDark ? darkPalette : lightPalette }),
    [isDark],
  );
}

/**
 * Builds a style sheet through a theme factory, memoized per palette so
 * light/dark switches are the only rebuild trigger. Factories should be
 * module-level exports (stable identity), not inline lambdas.
 */
export function useStyles<T>(makeStyles: (colors: ThemePalette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors, makeStyles]);
}
