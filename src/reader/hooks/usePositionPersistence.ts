import { useCallback, useEffect, useRef } from "react";

import { Database } from "@/services/db.services";
import type { ReaderPosition } from "@/reader/renderers/types";

const SAVE_DEBOUNCE_MS = 400;

/**
 * Owns WHEN reading positions are written (renderers own WHAT they report).
 *
 * - Debounced saves while scrolling (no per-frame DB writes).
 * - Unmount flush is never debounced, so back navigation cannot lose the
 *   position of the document the user is leaving.
 */
export function usePositionPersistence(documentId: string) {
  const pending = useRef<ReaderPosition>({ page: 1, percent: 0 });
  const lastSaved = useRef<ReaderPosition>({ page: 1, percent: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback((id: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (
      pending.current.page === lastSaved.current.page &&
      pending.current.percent === lastSaved.current.percent
    ) {
      return;
    }

    lastSaved.current = { ...pending.current };
    void Database.updateReadingPosition(
      id,
      pending.current.page,
      pending.current.percent,
    ).catch((e) => console.error("Position save failed:", e));
  }, []);

  /**
   * Save-on-unmount path lives in the effect so it also runs when the ID
   * changes (document swapped) — the old document keeps its own position.
   */
  useEffect(() => {
    if (!documentId) {
      return;
    }
    pending.current = { page: 1, percent: 0 };
    lastSaved.current = { page: 1, percent: 0 };

    return () => {
      flush(documentId);
    };
  }, [documentId, flush]);

  const onPositionChange = useCallback((page: number, percent: number) => {
    pending.current = { page, percent };

    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => flush(documentId), SAVE_DEBOUNCE_MS);
  }, [flush, documentId]);

  return { onPositionChange };
}
