import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { libraryStyle } from "@/styles";
import type { Document } from "@/types/document";
import { MOCK_DOCUMENTS } from "@/data/mockDocuments";

import { EmptyLibrary } from "@/components/EmptyLibrary";
import { DocumentListItem } from "@/components/DocumentListItem";
import { useDocFilePicker } from "@/hooks";

/**
 * Home / Library — spec:7, spec:8, spec:11.
 * Not a file manager: recent docs + search + open action only.
 */

// TODO (Phase 3): replace this flag with `documents` loaded from
// expo-sqlite. Empty array must render <EmptyLibrary /> (spec:8).
const USE_MOCK_DATA = true;

export default function Library() {
  const { error, fileData, onFilePick } = useDocFilePicker();
  const documents: Document[] = USE_MOCK_DATA ? MOCK_DOCUMENTS : [];

  const handleOpenDocument = async () => {
    await onFilePick();
    console.log("TODO (Phase 2): open native file picker");
  };

  const handlePressDocument = (doc: Document) => {
    // TODO (Phase 2/4): router.push(`/reader?id=${doc.id}`).
    console.log("TODO (Phase 4): open reader for", doc.id);
  };

  return (
    <SafeAreaView
      style={libraryStyle.container}
      edges={["top", "left", "right"]}
    >
      <View style={libraryStyle.header}>
        <Text style={libraryStyle.headerTitle}>Reader</Text>
        {/* TODO (Phase 6): library search by filename (spec:19). */}
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
          {/* TODO (Phase 2): same picker as the empty state. */}
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

      {error && !fileData && <Text>{error}</Text>}
      {!error && fileData && (
        <View>
          <Text>File info:</Text>
          <Text>name: {fileData.name}</Text>
          <Text>size: {fileData?.size}</Text>
          <Text>: {fileData?.uri}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
