/**
 * Document entity — from Phase 0 NOTES.md §5.
 *
 * Field origins (TODO: verify each as you build):
 * - picker  → uri, name, mime
 * - DB      → id, lastOpened, page, percent, favorite
 * - renderer→ page, percent (updates while reading)
 */
export type DocumentType = "pdf" | "docx" | "md" | "txt";

export type Document = {
  id: string;
  uri: string;
  name: string;
  mime: string;
  type: DocumentType;
  lastOpened: number; // epoch ms
  page: number;
  percent: number; // 0-100
  favorite: boolean;
};

// TODO (you): spec lists DOC as well as DOCX (spec:5). How will you
// represent a legacy `.doc` file in `DocumentType`? Options:
//   a) widen the union with "doc"
//   b) normalize "doc" -> "docx" at import time
// Write your choice in docs/NOTES.md Phase 1 before coding it.
