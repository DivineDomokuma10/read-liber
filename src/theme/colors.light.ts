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
    secondary: "#789483",
    soft: "#dbe5dd",
  },
  background: {
    primary: "#f6f8f4",
    secondary: "#edf2ed",
  },
  readingSurface: "#fbf9f2",
  glass: {
    background: "rgba(255, 255, 255, 0.58)",
    backgroundHover: "rgba(255, 255, 255, 0.72)",
    border: "rgba(255, 255, 255, 0.76)",
  },
  divider: "rgba(104, 116, 107, 0.14)",
  favorite: {
    color: "#c99f4e",
    background: "#fbf5e8",
  },
};
