/** Normalize filename queries consistently for both the query and candidates. */
export function normalizeLibraryQuery(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/**
 * Case-insensitive filename filtering for the already-loaded local library.
 * Input ordering is preserved, so recency/favorite ordering remains owned by
 * the caller. An empty query returns a shallow copy rather than the original
 * mutable array.
 */
export function filterDocumentsByName<T extends { name: string }>(
  documents: readonly T[],
  query: string,
): T[] {
  const normalizedQuery = normalizeLibraryQuery(query);
  if (!normalizedQuery) {
    return documents.slice();
  }

  return documents.filter((document) =>
    document.name.toLocaleLowerCase().includes(normalizedQuery),
  );
}
