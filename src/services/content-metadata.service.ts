import { NativeModule, requireOptionalNativeModule } from "expo";

export type ContentMetadata = {
  displayName: string | null;
  mimeType: string | null;
  size: number | null;
};

declare class ContentMetadataNativeModule extends NativeModule {
  getMetadataAsync(uri: string): Promise<ContentMetadata>;
}

/**
 * Optional keeps JavaScript compatible with an older installed development
 * build while the new local native module awaits an EAS rebuild.
 */
const nativeModule =
  requireOptionalNativeModule<ContentMetadataNativeModule>("ContentMetadata");

export async function getContentMetadata(
  uri: string,
): Promise<ContentMetadata | null> {
  if (!nativeModule) {
    return null;
  }

  try {
    return await nativeModule.getMetadataAsync(uri);
  } catch {
    // Metadata is an enhancement, not an import precondition. The existing
    // URI/content-signature fallbacks remain authoritative when a provider
    // rejects its query projection or the temporary grant has expired.
    if (__DEV__) {
      console.warn("Content provider metadata unavailable; using fallbacks.");
    }
    return null;
  }
}
