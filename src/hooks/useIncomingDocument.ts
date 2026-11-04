import { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { router, useRootNavigationState } from "expo-router";

import type { DocumentRow } from "@/types";
import { Database } from "@/services/db.services";
import { reuseDuplicateDocument } from "@/services/dedupe.service";
import { ingestToLocal } from "@/services/ingest.service";
import {
  cleanupIntentAsset,
  isSharedIntentUrl,
  mimeToDocumentType,
  resolveIntentAsset,
  toDocumentRow,
  UnsupportedTypeError,
} from "@/utils";

/** Destination accepted by the typed-routes-enabled router.replace(). */
type Href = Parameters<typeof router.replace>[0];

/**
 * Consumes documents the OS hands the app ("Open with" from WhatsApp, Files,
 * etc.) — ACTION_VIEW intents carrying `content://` / `file://` URIs.
 *
 * Deliberately mirrors useDocPicker's pipeline (resolve → MIME-type check →
 * durable ingest → DB row) so a shared document behaves exactly like a
 * picked one, including unsupported-type and save-failure messaging.
 */

/**
 * Save with the picker's alert/retry contract: one visible failure yields a
 * Retry dialog; the promise resolves with the final outcome.
 */
async function persistRow(row: DocumentRow): Promise<boolean> {
  const attempt = async (): Promise<boolean> => {
    try {
      const result = await Database.saveDocument(row);
      return result.changes === 1;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  if (await attempt()) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    Alert.alert(
      "Couldn't save document",
      "Storage write failed. Tap Retry to try again.",
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        {
          text: "Retry",
          onPress: () => {
            void attempt().then(resolve);
          },
        },
      ],
    );
  });
}

async function handleSharedDocument(
  url: string,
  navigate: (href: Href) => void,
) {
  const asset = await resolveIntentAsset(url);

  if (!asset) {
    Alert.alert(
      "Couldn't open file",
      "The document couldn't be copied into Read Liber. Please try again.",
    );
    navigate("/");
    return;
  }

  /**
   * Reject unsupported types before any durable copy is made — no orphan
   * ingested file for a document that can't be read anyway.
   */
  try {
    mimeToDocumentType(asset.mimeType);
  } catch (e) {
    if (e instanceof UnsupportedTypeError) {
      Alert.alert(`"${asset.name}" isn't a supported type yet.`);
      navigate("/");
      return;
    }
    throw e;
  }

  const localUri = await ingestToLocal(asset);
  const duplicate = await reuseDuplicateDocument(asset, localUri);

  if (duplicate) {
    // Both the staged intent copy and any redundant permanent copy are now
    // unnecessary; the dedupe service already retained/adopted the file the
    // existing row needs.
    cleanupIntentAsset(asset);
    navigate(`/reader?id=${duplicate.id}`);
    return;
  }

  try {
    const row = toDocumentRow(asset, localUri);
    const saved = await persistRow(row);

    if (saved) {
      navigate(`/reader?id=${row.id}`);
    } else {
      navigate("/");
    }
  } finally {
    /**
     * The staged cache copy is disposable only when a permanent copy exists;
     * a cache-only row (ingest failed) still needs its cache URI to work.
     */
    if (localUri) {
      cleanupIntentAsset(asset);
    }
  }
}

export function useIncomingDocument() {
  const rootNavigationState = useRootNavigationState();
  const handledRef = useRef<string | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  /**
   * Navigation may not be attached yet on intent-driven cold starts, so a
   * destination is staged and flushed when the router becomes ready. Refs
   * only — navigation is an external system, not state to cascade through
   * renders.
   */
  const pendingHrefRef = useRef<Href | null>(null);
  const navReadyRef = useRef(false);

  useEffect(() => {
    navReadyRef.current = Boolean(rootNavigationState);

    if (navReadyRef.current && pendingHrefRef.current) {
      const href = pendingHrefRef.current;
      pendingHrefRef.current = null;
      router.replace(href);
    }
  }, [rootNavigationState]);

  const navigate = useCallback((href: Href) => {
    if (navReadyRef.current) {
      router.replace(href);
    } else {
      pendingHrefRef.current = href;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const enqueue = (url: string) => {
      queueRef.current = queueRef.current
        .then(() => handleSharedDocument(url, navigate))
        .catch((e) => {
          console.error("Shared document handling failed:", e);
          Alert.alert(
            "Something went wrong",
            "The document couldn't be opened. Please try again.",
          );
          navigate("/");
        });
    };

    const consume = (url: string | null) => {
      if (!active || !url) {
        return;
      }

      /**
       * Cold start can surface the intent twice (getInitialURL + the first
       * `url` event) — process each URL once, and keep the pipeline
       * sequential if multiple different files arrive in quick succession.
       */
      if (handledRef.current === url) {
        return;
      }
      handledRef.current = url;

      if (!isSharedIntentUrl(url)) {
        return;
      }

      enqueue(url);
    };

    void Linking.getInitialURL().then(consume);
    const subscription = Linking.addEventListener("url", (event) =>
      consume(event.url),
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, [navigate]);
}
