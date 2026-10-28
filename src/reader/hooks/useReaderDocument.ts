import { useCallback, useEffect, useState } from "react";

import { Database } from "@/services/db.services";
import type { DocumentRow } from "@/types";

export type ReaderDocumentState =
  | { status: "loading" }
  | { status: "ready"; document: DocumentRow }
  | { status: "not-found" }
  | { status: "error"; message: string };

/**
 * Loads one document row for the reader and marks it as recently opened.
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

  return {
    state: documentId ? state : ({ status: "not-found" } as const),
    reload,
  };
}
