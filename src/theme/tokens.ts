/**
 * Quiet Reader design tokens — pure data, no imports of React Native APIs.
 * Source of truth: docs/ui/design-system.md (referenced per group below).
 * Visual values must be changed there first, then transcribed here verbatim.
 */

/**
 * Spacing — DS §5 (4px base grid).
 * Keys mirror the CSS custom property names (--space-1 … --space-10).
 */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
} as const;

/** Corner radius — DS §6. */
export const radius = {
  /** Format tags */
  small: 5,
  /** File icons */
  medium: 14,
  /** Primary buttons */
  button: 16,
  /** Document rows */
  card: 20,
  /** Larger panels */
  large: 24,
  /** Filters and round controls */
  pill: 999,
} as const;

/** Motion durations in ms — DS §13. */
export const motion = {
  fast: 160,
  standard: 180,
  slow: 260,
  entry: 420,
} as const;

/**
 * Letter-spacing factors in em — DS §2. Convert to px at the text size:
 * `letterSpacing: size * tracking.title` (RN takes absolute values only).
 */
export const tracking = {
  title: -0.04,
  /** Reading h1 (DS §12) */
  readingTitle: -0.045,
  listTitle: -0.018,
  label: 0.055,
  eyebrow: 0.12,
} as const;

/**
 * Type scale — DS §2, plus the reading roles it folds into DS §12.
 * `lineHeightFactor` multiplies `size`; `letterSpacingEm` is optional and
 * must be converted with `tracking.*` — both done in style factories.
 */
export const typography = {
  screenTitle: { size: 30, lineHeightFactor: 1.2, weight: "600" },
  readingTitle: { size: 32, lineHeightFactor: 1.16, weight: "500" },
  readingSection: { size: 19, lineHeightFactor: 1.4, weight: "600" },
  readingLead: { size: 17, lineHeightFactor: 1.72, weight: "400" },
  readingBody: { size: 15, lineHeightFactor: 1.82, weight: "400" },
  listTitle: { size: 14.5, lineHeightFactor: 1.3, weight: "700" },
  button: { size: 13, lineHeightFactor: 1, weight: "700" },
  /** Metadata 10.5–12px per DS §2; pick per role with these bounds. */
  metadata: { sizeMin: 10.5, sizeMax: 12, lineHeightFactor: 1.4, weight: "500" },
  /** Eyebrow 10–13px per DS §2. */
  eyebrow: { sizeMin: 10, sizeMax: 13, lineHeightFactor: 1, weight: "700" },
} as const;

/** Layout — DS §5 mobile layout constants. */
export const layout = {
  screenMaxWidth: 430,
  screenGutter: 16,
  headerGutter: 24,
  /** Minimum bottom safe spacing: `max(safeAreaBottom, this)`. */
  safeBottomMin: 22,
} as const;

/** Interaction — DS §14 target sizes and DS §10 icon stroke. */
export const interaction = {
  minTarget: 40,
  preferredTarget: 44,
  iconStrokeWidth: 1.8,
} as const;

/**
 * Fonts — DS §2 families. Names match the resources loaded in
 * `src/app/_layout.tsx` via `expo-font` (@expo-google-fonts packages).
 * Code keeps `"monospace"` per DS §2/reading conventions.
 */
export const fonts = {
  /** DM Sans — navigation, buttons, labels, metadata, document lists. */
  ui: {
    regular: "DMSans_400Regular",
    medium: "DMSans_500Medium",
    semiBold: "DMSans_600SemiBold",
    bold: "DMSans_700Bold",
  },
  /** Literata — document content, reading headings, quotes. */
  reading: {
    regular: "Literata_400Regular",
    medium: "Literata_500Medium",
    semiBold: "Literata_600SemiBold",
    regularItalic: "Literata_400Regular_Italic",
    mediumItalic: "Literata_500Medium_Italic",
    semiBoldItalic: "Literata_600SemiBold_Italic",
  },
} as const;
