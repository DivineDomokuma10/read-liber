export type DocumentType = "pdf" | "docx" | "md" | "txt";

export type PickedAsset = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

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

export type DocumentRow = {
  id: string;
  uri: string;
  name: string;
  page: number;
  percent: number;
  favorite: 0 | 1;
  created_at: number;
  updated_at: number;
  size: number | null;
  local_uri: string | null;
  mime_type: string | null;
  last_opened: number | null;
  type: "pdf" | "docx" | "md" | "txt";
};
