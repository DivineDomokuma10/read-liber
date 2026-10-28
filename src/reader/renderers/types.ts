import type { ComponentType } from "react";

/**
 * Format-agnostic position shape mirrored from the DB row (page, percent).
 * Each strategy maps its native progress model onto this — text strategies
 * keep page pinned at 1 and report scroll percent; a page-based format like
 * PDF reports real pages.
 */
export type ReaderPosition = {
  page: number;
  percent: number;
};

/**
 * The one contract every renderer strategy implements.
 *
 * Renderers stay pure presentation + format knowledge: they never see the
 * DocumentRow, never import the database — the reader screen resolves the
 * URI (local copy first) and owns persistence (via usePositionPersistence).
 */
export type RendererProps = {
  uri: string;
  restore: ReaderPosition;
  onPositionChange: (page: number, percent: number) => void;
  /**
   * Fired for a genuine single tap ON the content (scroll, fling, pinch and
   * multi-touch do not qualify) — the screen uses it to toggle reading
   * controls. Optional: strategies that can't discriminate taps omit it.
   */
  onTap?: () => void;
  /**
   * Fired when the user actively navigates content (scroll gesture drag or
   * momentum for text strategies; page moves for the PDF strategy). The
   * screen collapses reading controls on it to stay in clean-read mode.
   */
  onScrollStart?: () => void;
  /**
   * Text strategies render their typography scaled by this factor
   * (user A-/A+ preference). PDF and other native renderers ignore it —
   * their zoom is the document's native scale.
   */
  fontSizeScale?: number;
};

export interface RendererStrategy {
  Component: ComponentType<RendererProps>;
}
