import type { DocumentType } from "@/types/document";
import { PlaceholderRenderer } from "./placeholder";
import { TxtRenderer } from "./txt";
import type { RendererStrategy } from "./types";

/**
 * Strategy selector — the ONLY place that maps a document type to a
 * renderer. C6–C8 each replace their null-object entry with the real
 * strategy; this map and its consumers stay untouched otherwise.
 */
const STRATEGIES: Record<DocumentType, RendererStrategy> = {
  txt: { Component: TxtRenderer },
  md: { Component: PlaceholderRenderer },
  docx: { Component: PlaceholderRenderer },
  pdf: { Component: PlaceholderRenderer },
};

export function resolveStrategy(type: DocumentType): RendererStrategy {
  return STRATEGIES[type] ?? { Component: PlaceholderRenderer };
}
