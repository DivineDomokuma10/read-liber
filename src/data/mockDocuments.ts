import type { Document } from "@/types/document";

/**
 * Mock library used for Phase 1 UI work only.
 * Mirrors the examples in discovery:7 and spec:11.
 *
 * TODO (Phase 3): delete this file once expo-sqlite persistence lands.
 * The library screen should read from the DB instead.
 */
const now = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: "mock-1",
    uri: "mock://database-systems.pdf",
    name: "Database Systems",
    mime: "application/pdf",
    type: "pdf",
    lastOpened: now - 2 * MIN,
    page: 37,
    percent: 37,
    favorite: false,
  },
  {
    id: "mock-2",
    uri: "mock://readme.md",
    name: "README",
    mime: "text/markdown",
    type: "md",
    lastOpened: now - 1 * DAY,
    page: 1,
    percent: 100,
    favorite: true,
  },
  {
    id: "mock-3",
    uri: "mock://siwes-report.docx",
    name: "SIWES Report",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    type: "docx",
    lastOpened: now - 3 * DAY,
    page: 12,
    percent: 14,
    favorite: false,
  },
];
