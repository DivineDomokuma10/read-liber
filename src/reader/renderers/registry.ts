import type { DocumentType } from "@/types/document";
import { PlaceholderRenderer } from "./placeholder";
import { TxtRenderer } from "./txt";
import { MdRenderer } from "./md";
import { DocxRenderer } from "./docx";
import type { RendererStrategy } from "./types";

/**
 * Strategy selector — the ONLY place that maps a document type to a
 * renderer. C8 later replaces the pdf null-object entry with the real
 * strategy; this map and its consumers stay untouched otherwise.
 */
const STRATEGIES: Record<DocumentType, RendererStrategy> = {
  txt: { Component: TxtRenderer },
  md: { Component: MdRenderer },
  docx: { Component: DocxRenderer },
  pdf: { Component: PlaceholderRenderer },
};

export function resolveStrategy(type: DocumentType): RendererStrategy {
  return STRATEGIES[type] ?? { Component: PlaceholderRenderer };
}
