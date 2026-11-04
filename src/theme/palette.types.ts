/**
 * Color palettes — transcribed verbatim from docs/ui/design-system.md §3
 * (light + dark theme blocks). Do not reinterpret; change the design doc
 * first, then mirror the exact values here.
 */

/** Palette shared between light and dark themes (same keys, same shape). */
export type ThemePalette = {
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  brand: {
    primary: string;
    onPrimary: string;
    secondary: string;
    soft: string;
  };
  background: {
    primary: string;
    secondary: string;
  };
  ambient: {
    linearStart: string;
    linearMiddle: string;
    linearEnd: string;
    topGlow: string;
    topGlowOpacity: number;
    sideGlow: string;
    sideGlowOpacity: number;
  };
  readingSurface: string;
  glass: {
    background: string;
    backgroundHover: string;
    border: string;
  };
  filterPill: {
    activeBackground: string;
    activeText: string;
    inactiveBackground: string;
    inactiveText: string;
    border: string;
  };
  divider: string;
  favorite: {
    color: string;
    background: string;
  };
};
