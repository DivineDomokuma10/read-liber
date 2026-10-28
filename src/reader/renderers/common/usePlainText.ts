import { useEffect, useState } from "react";
import { File } from "expo-file-system";

export type PlainTextState =
  | { status: "loading" }
  | { status: "ready"; text: string }
  | { status: "empty" }
  | { status: "error"; message: string };

/**
 * Shared loader for every strategy that renders a file as text
 * (TXT now, Markdown in a later chunk, DOCX-extracted-text later).
 *
 * Load results are keyed to the uri that produced them: while a new uri
 * loads, the hook *derives* a loading state during render instead of
 * force-resetting state inside the effect (avoids cascading renders), and a
 * slow read of an old uri can never leak into a newer screen.
 */
export function usePlainText(uri: string): PlainTextState {
  const [result, setResult] = useState<{ uri: string; state: PlainTextState }>(
    () => ({ uri, state: { status: "loading" } }),
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const file = new File(uri);
        const text = await file.text();

        if (cancelled) {
          return;
        }

        if (!text || text.trim().length === 0) {
          setResult({ uri, state: { status: "empty" } });
          return;
        }

        setResult({ uri, state: { status: "ready", text } });
      } catch (e) {
        if (cancelled) {
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
