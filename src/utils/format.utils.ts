import type { DocumentType } from "@/types/document";

/**
 * Format the persisted reading model for a library row.
 * PDFs persist real pages; reflowable text formats persist scroll percentage.
 * Invalid/stale values are clamped so metadata never exposes `NaN`, negative
 * pages, or percentages outside 0–100.
 */
export function formatReadingPosition(
  type: DocumentType,
  page: number,
  percent: number,
): string {
  if (type === "pdf") {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.round(page)) : 1;
    return `Page ${safePage}`;
  }

  const safePercent = Number.isFinite(percent)
    ? Math.min(100, Math.max(0, Math.round(percent)))
    : 0;
  return `${safePercent}%`;
}

/**
 * Pure relative-time formatter: "2 min ago", "3 h ago", "4 d ago",
 * "2 wk ago", "3 mo ago". Pass `now` in (defaults to Date.now())
 * so the function stays pure and testable.
 */
export function formatLastOpened(
  lastOpened: number,
  now: number = Date.now(),
): string {
  const diffMin = Math.max(1, Math.round((now - lastOpened) / 60000));
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays} d ago`;
  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} wk ago`;
  const diffMonths = Math.round(diffDays / 30);
  return `${diffMonths} mo ago`;
}
