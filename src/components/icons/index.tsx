import type { ColorValue } from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Polygon,
} from "react-native-svg";

import { interaction } from "@/theme";

/**
 * Outline icon set — DS §10. Simple 24px-grid outline icons drawn at
 * strokeWidth 1.8 with round caps/joins; tint comes from the color prop so
 * callers always pass a palette color.
 *
 * Glyph geometry follows the feather/mi icon shape language (MIT-licensed
 * open-source sets) — path data redrawn to stay consistent at 1.8 stroke.
 */

export type IconProps = {
  /** Square size in px (round icons use the same box). */
  size?: number;
  /** Stroke/fill color — pass a palette value. */
  color: ColorValue;
  /** Overrides the DS §10 default of 1.8. */
  strokeWidth?: number;
};

function base(size: number, strokeWidth: number, color: ColorValue) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24" as const,
    fill: "none" as const,
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function MoonIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)}>
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
  );
}

export function SearchIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)}>
      <Circle cx="11" cy="11" r="7" />
      <Line x1="21" y1="21" x2="16.3" y2="16.3" />
    </Svg>
  );
}

export function XCircleIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)}>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="15" y1="9" x2="9" y2="15" />
      <Line x1="9" y1="9" x2="15" y2="15" />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

export function StarIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)}>
      <Polygon points="12 2.5 14.91 8.26 21 9.27 16.6 13.64 17.68 19.77 12 16.77 6.32 19.77 7.4 13.64 3 9.27 9.09 8.26 12 2.5" />
    </Svg>
  );
}

export function StarFilledIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)} fill={color}>
      <Polygon points="12 2.5 14.91 8.26 21 9.27 16.6 13.64 17.68 19.77 12 16.77 6.32 19.77 7.4 13.64 3 9.27 9.09 8.26 12 2.5" />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function TextSizeIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)}>
      <Polyline points="4 7 4 4 20 4 20 7" />
      <Line x1="9" y1="20" x2="15" y2="20" />
      <Line x1="12" y1="4" x2="12" y2="20" />
    </Svg>
  );
}

export function EllipsisIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)}>
      <Circle cx="5" cy="12" r="1" />
      <Circle cx="12" cy="12" r="1" />
      <Circle cx="19" cy="12" r="1" />
    </Svg>
  );
}

/**
 * Shared document glyph used inside format badge squares (DS-9 / DS-13).
 * Drawn smaller than the box so the badge's soft background frames it.
 */
export function FileGlyphIcon({ size = 20, color, strokeWidth = interaction.iconStrokeWidth }: IconProps) {
  return (
    <Svg {...base(size, strokeWidth, color)}>
      <Path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3z" />
      <Polyline points="13.5 3 13.5 8.5 19 8.5" />
      <Line x1="8.5" y1="12.5" x2="15.5" y2="12.5" />
      <Line x1="8.5" y1="16" x2="13.5" y2="16" />
    </Svg>
  );
}
