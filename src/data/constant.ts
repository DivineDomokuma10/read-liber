import { MIME_TO_TYPE } from "@/utils/document.utils";

export const ACCEPTED_MIME_TYPE = Object.keys(MIME_TO_TYPE);

export const SLIDES = [
  {
    key: "simple",
    title: "Just open and read.",
    body: "Pick a document and start reading. Nothing in between.",
  },
  {
    key: "distraction-free",
    title: "No ads. No interruptions.",
    body: "The document is the interface. Controls stay out of the way.",
  },
  {
    key: "remember",
    title: "Continue where you stopped.",
    body: "Your reading position is remembered for every document.",
  },
];
