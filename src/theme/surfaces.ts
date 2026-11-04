import type { ViewStyle } from "react-native";

import type { ThemePalette } from "./palette.types";

/**
 * Native approximation of DS §7's outer glass shadow.
 *
 * React Native does not support CSS backdrop-filter or inset box-shadow.
 * The translucent fill reveals the ambient SVG below while this native
 * shadow provides separation. Android elevation is deliberately restrained.
 */
export const glassShadow: ViewStyle = {
  shadowColor: "#2d372f",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.065,
  shadowRadius: 12,
  elevation: 2,
};

/** Shared DS §7 glass fill, border, and native shadow. */
export function glassSurface(colors: ThemePalette): ViewStyle {
  return {
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.glass.background,
    ...glassShadow,
  };
}

/** Hover/pressed glass fill token for supporting controls. */
export function glassSurfacePressed(colors: ThemePalette): ViewStyle {
  return {
    backgroundColor: colors.glass.backgroundHover,
  };
}
