import type { ThemePalette } from "./palette.types";

/** Dark theme — DS §3 ".theme-dark" block. */
export const darkPalette: ThemePalette = {
  text: {
    primary: "#ebede8",
    secondary: "#a8aea8",
    muted: "#8f9790",
  },
  brand: {
    primary: "#dbe5dd",
    onPrimary: "#202521",
    secondary: "#8eaa98",
    soft: "#2d3931",
  },
  background: {
    primary: "#171c18",
    secondary: "#1b211c",
  },
  ambient: {
    linearStart: "#171c18",
    linearMiddle: "#1b211c",
    linearEnd: "#191b18",
    topGlow: "#425c49",
    topGlowOpacity: 0.72,
    sideGlow: "#544733",
    sideGlowOpacity: 0.45,
  },
  readingSurface: "#20231f",
  glass: {
    background: "rgba(37, 44, 38, 0.58)",
    backgroundHover: "rgba(44, 53, 46, 0.72)",
    border: "rgba(255, 255, 255, 0.09)",
  },
  filterPill: {
    activeBackground: "#dbe5dd",
    activeText: "#202521",
    inactiveBackground: "rgba(37, 44, 38, 0.3)",
    inactiveText: "#a8aea8",
    border: "rgba(255, 255, 255, 0.09)",
  },
  divider: "#424943",
  favorite: {
    color: "#d8b766",
    background: "#3d382a",
  },
  feedback: {
    errorText: "#f2c9aa",
    errorBackground: "#3b2a20",
  },
};
