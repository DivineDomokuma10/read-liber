import { useState } from "react";
import { Alert } from "react-native";
import { getDocumentAsync } from "expo-document-picker";

import type { DocumentRow } from "@/types";
import { Database } from "@/services/db.services";
import { ACCEPTED_MIME_TYPE } from "@/data/constant";
import { toDocumentRow, UnsupportedTypeError } from "@/utils";

export const useDocFilePicker = () => {
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<DocumentRow | null>(null);

  const persist = async (row: DocumentRow): Promise<boolean> => {
    try {
      const result = await Database.saveDocument(row);
      if (result.changes === 1) {
        setLastSaved(row);
        setError(null);
        return true;
      }
      setError("Could not save document. Please try again.");
      return false;
    } catch (e) {
      console.error(e);
      setError("Could not save document. Please try again.");
      return false;
    }
  };

  const onFilePick = async (): Promise<DocumentRow | null> => {
    try {
      const result = await getDocumentAsync({
        type: ACCEPTED_MIME_TYPE,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        // User dismissed the picker — not an error.
        setError(null);
        return null;
      }

      const asset = result.assets[0];
      let pending: DocumentRow;
      try {
        pending = toDocumentRow(asset);
      } catch (e) {
        if (e instanceof UnsupportedTypeError) {
          setError(`"${asset.name}" isn't a supported type yet.`);
          return null;
        }
        throw e;
      }

      const saved = await persist(pending);
      if (!saved) {
        Alert.alert(
          "Couldn't save document",
          "Storage write failed. Tap Retry to try again.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Retry", onPress: () => void persist(pending) },
          ],
        );
        return null;
      }
      return pending;
    } catch (e) {
      console.error(e);
      setError("Something went wrong opening the picker. Please try again.");
      return null;
    }
  };

  return {
    error,
    lastSaved,
    onFilePick,
  };
};
