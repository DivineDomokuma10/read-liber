import { useEffect, useState } from "react";
import { File } from "expo-file-system";

import {
  DocxFormatError,
  extractDocxDocument,
  type DocxDocument,
} from "./docx/extract";

export type DocxDocState =
  | { status: "loading" }
  | { status: "ready"; document: DocxDocument }
  | { status: "empty" }
  | { status: "error"; message: string };

/**
 * DOCX loader: bytes → two-pass extraction → typed block model.
 *
 * Results are keyed to the uri that produced them (same pattern as
 * usePlainText) so a slow read of a previous document can never leak into
 * a new screen. Loading is derived during render instead of reset inside
 * the effect (no cascading renders).
 *
 * The two-pass unzip + block parse is synchronous CPU work; it runs after
 * one painted frame so the loader is on screen before the freeze window.
 */
export function useDocxDocument(uri: string): DocxDocState {
  const [result, setResult] = useState<{ uri: string; state: DocxDocState }>(
    () => ({ uri, state: { status: "loading" } }),
  );

  useEffect(() => {
    let cancelled = false;
    let raf: number | null = null;

    const nextFrame = () =>
      new Promise<void>((resolve) => {
        raf = requestAnimationFrame(() => {
          raf = null;
          resolve();
        });
      });

    (async () => {
      try {
        const bytes = await new File(uri).bytes();
        if (cancelled) {
          return;
        }

        await nextFrame();
        if (cancelled) {
          return;
        }

        const document = extractDocxDocument(bytes);
        if (cancelled) {
          return;
        }

        setResult({
          uri,
          state:
            document.blocks.length === 0
              ? { status: "empty" }
              : { status: "ready", document },
        });
      } catch (e) {
        if (cancelled) {
          return;
        }

        if (e instanceof DocxFormatError) {
          setResult({ uri, state: { status: "error", message: e.message } });
          return;
        }

        console.error(e);
        setResult({
          uri,
          state: {
            status: "error",
            message: "The file could not be read. It may have been removed.",
          },
        });
      }
    })();

    return () => {
      cancelled = true;
      if (raf !== null) {
        cancelAnimationFrame(raf);
      }
    };
  }, [uri]);

  return result.uri === uri ? result.state : { status: "loading" };
}
