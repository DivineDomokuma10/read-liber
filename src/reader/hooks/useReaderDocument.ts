import { useCallback, useEffect, useState } from "react";

import { Database } from "@/services/db.services";
import { isFileAccessible, resolveDocumentUri } from "@/utils";
import type { DocumentRow } from "@/types";

export type ReaderDocumentState =
  | { status: "loading" }
  | { status: "ready"; document: DocumentRow }
  | { status: "not-found" }
  | { status: "unavailable" }
  | { status: "error"; message: string };

/**
 * Loads one document row for the reader and marks it as recently opened.
 * The file URI is validated first: a dead cached `file://` copy or a revoked
 * `content://` grant yields `unavailable`, NOT an error — the document is
 * known (in the DB) but its bytes are gone.
 * File access/rendering is layered on top of this in later chunks.
 */
export function useReaderDocument(documentId: string | undefined) {
  const [state, setState] = useState<ReaderDocumentState>({
    status: "loading",
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!documentId) {
      return;
    }

    let cancelled = false;

    Database.getDocument(documentId)
      .then((document) => {
        if (cancelled) {
          return;
        }

        if (!document) {
          setState({ status: "not-found" });
          return;
        }

        /**
         * Validate before touching last_opened — re-opening an unreadable
         * file should not inflate its recency in the library.
         */
        if (!isFileAccessible(resolveDocumentUri(document))) {
          setState({ status: "unavailable" });
          return;
        }

        return Database.touchLastOpened(document.id).then(() => {
          if (!cancelled) {
            setState({ status: "ready", document });
          }
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        console.error(error);
        setState({
          status: "error",
          message: "This document could not be loaded.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [documentId, reloadToken]);

  const reload = useCallback(() => {
    if (!documentId) {
      return;
    }

    setState({ status: "loading" });
    setReloadToken((token) => token + 1);
  }, [documentId]);

  const setFavorite = useCallback(
    async (favorite: boolean) => {
      if (!documentId) {
        return false;
      }

      const result = await Database.setFavorite(documentId, favorite ? 1 : 0);
      if (result.changes !== 1) {
        return false;
      }

      setState((current) =>
        current.status === "ready" && current.document.id === documentId
          ? {
              ...current,
              document: {
                ...current.document,
                favorite: favorite ? 1 : 0,
              },
            }
          : current,
      );
      return true;
    },
    [documentId],
  );

  return {
    state: documentId ? state : ({ status: "not-found" } as const),
    reload,
    setFavorite,
  };
}
