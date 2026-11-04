import type { ThemePalette } from "./palette.types";

/** Light theme — DS §3 "Light theme" block. */
export const lightPalette: ThemePalette = {
  text: {
    primary: "#292a26",
    secondary: "#75766f",
    muted: "#999a92",
  },
  brand: {
    primary: "#34463c",
    onPrimary: "#ffffff",
    secondary: "#789483",
    soft: "#dbe5dd",
  },
  background: {
    primary: "#f6f8f4",
    secondary: "#edf2ed",
  },
  ambient: {
    linearStart: "#f6f8f4",
    linearMiddle: "#edf2ed",
    linearEnd: "#f5f3ed",
    topGlow: "#b4cfbd",
    topGlowOpacity: 0.72,
    sideGlow: "#d7c9ab",
    sideGlowOpacity: 0.46,
  },
  readingSurface: "#fbf9f2",
  glass: {
    background: "rgba(255, 255, 255, 0.58)",
    backgroundHover: "rgba(255, 255, 255, 0.72)",
    border: "rgba(255, 255, 255, 0.76)",
  },
  filterPill: {
    activeBackground: "#2e332e",
    activeText: "#f7f7f2",
    inactiveBackground: "rgba(255, 255, 255, 0.3)",
    inactiveText: "#75766f",
    border: "rgba(255, 255, 255, 0.56)",
  },
  divider: "rgba(104, 116, 107, 0.14)",
  favorite: {
    color: "#c99f4e",
    background: "#fbf5e8",
  },
  feedback: {
    errorText: "#6a3511",
    errorBackground: "#fff4e8",
  },
};
