/**
 * Document format colors — DS §3 "Document format colors" block. Shared
 * between themes (the design doc defines a single set).
 * Keyed by `Document["type"]` so row components can look up directly.
 */

export type FormatColor = {
  color: string;
  background: string;
};

export const formatColors = {
  pdf: { color: "#c94b38", background: "#fdece9" },
  docx: { color: "#3d6eb4", background: "#e8f0fc" },
  md: { color: "#38755b", background: "#e8f4ee" },
  txt: { color: "#6d5a98", background: "#f1eef9" },
} as const satisfies Record<string, FormatColor>;

export type FormatColorKey = keyof typeof formatColors;
