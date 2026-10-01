import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { libraryStyle } from "@/styles";
import type { Document } from "@/types/document";
import { toDocument } from "@/utils";
import { Database } from "@/services/db.services";

import { EmptyLibrary } from "@/components/EmptyLibrary";
import { DocumentListItem } from "@/components/DocumentListItem";
import { useDocFilePicker } from "@/hooks";

/**
 * Home / Library — spec:7, spec:8, spec:11.
 * Not a file manager: recent docs + search + open action only.
 * Reads from expo-sqlite; empty DB renders <EmptyLibrary /> (spec:8).
 */
export default function Library() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const { onFilePick } = useDocFilePicker();

  const loadDocuments = useCallback(async () => {
    try {
      const rows = await Database.getDocuments();
      setDocuments(rows.map(toDocument));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDocuments();
    }, [loadDocuments]),
  );

  const handleOpenDocument = async () => {
    const saved = await onFilePick();
    if (saved) {
      await loadDocuments();
    }
  };

  const handlePressDocument = (doc: Document) => {
    console.log("TODO (Phase 4): open reader for", doc.id);
  };

  return (
    <SafeAreaView
      style={libraryStyle.container}
      edges={["top", "left", "right"]}
    >
      <View style={libraryStyle.header}>
        <Text style={libraryStyle.headerTitle}>Reader</Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Search library"
          onPress={() => console.log("TODO (Phase 6): library search")}
        >
          <Text style={libraryStyle.headerIcon}>{"\u{1F50D}"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={libraryStyle.sectionTitle}>Recent</Text>

      {documents.length === 0 ? (
        <EmptyLibrary onOpenDocument={handleOpenDocument} />
      ) : (
        <View style={libraryStyle.listWrap}>
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DocumentListItem document={item} onPress={handlePressDocument} />
            )}
          />
          <TouchableOpacity
            style={libraryStyle.fab}
            onPress={handleOpenDocument}
            accessibilityRole="button"
            accessibilityLabel="Open a document"
          >
            <Text style={libraryStyle.fabLabel}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
