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
