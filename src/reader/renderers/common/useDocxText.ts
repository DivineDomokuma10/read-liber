import { useEffect, useState } from "react";
import { File } from "expo-file-system";

import { extractDocxText, DocxFormatError } from "./docx";

export type DocxTextState =
  | { status: "loading" }
  | { status: "ready"; text: string }
  | { status: "empty" }
  | { status: "error"; message: string };

/**
 * DOCX loader: read bytes -> unzip -> extract text. Results keyed to the
 * uri that produced them (same pattern as usePlainText) so a slow read of a
 * previous document can never leak into a new screen, and the loading state
 * is derived during render instead of reset inside the effect.
 */
export function useDocxText(uri: string): DocxTextState {
  const [result, setResult] = useState<{ uri: string; state: DocxTextState }>(
    () => ({ uri, state: { status: "loading" } }),
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const file = new File(uri);
        const bytes = await file.bytes();

        if (cancelled) {
          return;
        }

        const text = extractDocxText(bytes).trim();
        if (cancelled) {
          return;
        }

        if (!text) {
          setResult({ uri, state: { status: "empty" } });
          return;
        }

        setResult({ uri, state: { status: "ready", text } });
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
    };
  }, [uri]);

  return result.uri === uri ? result.state : { status: "loading" };
}
