import { makeReaderStyle } from "./reader.style";
import { makeLibraryStyle } from "./library.style";

export { makeLibraryStyle } from "./library.style";
export { makeOnboardingStyle } from "./onboarding.style";
export { makeDocumentListItemStyle } from "./documentListItem.style";
export { makeEmptyLibraryStyle } from "./emptyLibrary.style";
export { makeNotFoundStyle } from "./notFound.style";
export { makeReaderStyle } from "./reader.style";

export type LibraryStyle = ReturnType<typeof makeLibraryStyle>;
export type ReaderStyle = ReturnType<typeof makeReaderStyle>;
