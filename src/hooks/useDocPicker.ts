import { useState } from "react";
import { DocumentPickerAsset, getDocumentAsync } from "expo-document-picker";

import { ACCEPTED_MIME_TYPE } from "@/data/constant";

export const useDocFilePicker = () => {
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<DocumentPickerAsset | null>(null);

  const onFilePick = async () => {
    try {
      const result = await getDocumentAsync({
        type: ACCEPTED_MIME_TYPE,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        setError("Document selection failed!!!");
        setFileData(null);
      } else {
        setFileData(result.assets[0]);
        setError(null);
        console.log(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
    error,
    fileData,
    onFilePick,
  };
};
