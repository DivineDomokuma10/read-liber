import type { DocumentType } from "@/types/document";
import { PlaceholderRenderer } from "./placeholder";
import { TxtRenderer } from "./txt";
import { MdRenderer } from "./md";
import { DocxRenderer } from "./docx";
import { PdfRenderer } from "./pdf";
import type { RendererStrategy } from "./types";

/**
 * Strategy selector — the ONLY place that maps a document type to a
 * renderer. Every V1 format is real now; the null-object remains available
 * for future formats.
 */
const STRATEGIES: Record<DocumentType, RendererStrategy> = {
  txt: { Component: TxtRenderer },
  md: { Component: MdRenderer },
  docx: { Component: DocxRenderer },
  pdf: { Component: PdfRenderer },
};

export function resolveStrategy(type: DocumentType): RendererStrategy {
  return STRATEGIES[type] ?? { Component: PlaceholderRenderer };
}
