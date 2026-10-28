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
};

export interface RendererStrategy {
  Component: ComponentType<RendererProps>;
}
