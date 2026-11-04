import { useCallback, useMemo, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { makeLibraryStyle } from "@/styles";
import { useStyles } from "@/theme/useTheme";
import type { Document } from "@/types/document";
import {
  filterDocumentsByName,
  isFileAccessible,
  normalizeLibraryQuery,
  toDocument,
} from "@/utils";
import { Database } from "@/services/db.services";

import { EmptyLibrary } from "@/components/EmptyLibrary";
import { DocumentListItem } from "@/components/DocumentListItem";
import { useDocFilePicker } from "@/hooks";

type LibraryState =
  | { status: "loading"; documents: Document[] }
  | { status: "ready"; documents: Document[] }
  | { status: "error"; documents: Document[]; message: string };

type LibrarySection = {
  key: "favorites" | "recent";
  title: "Favorites" | "Recent";
  data: Document[];
};

/**
 * Home / Library — spec:7, spec:8, spec:11.
 * Not a file manager: recent docs + search + open action only.
 * Reads from expo-sqlite; empty DB renders <EmptyLibrary /> (spec:8).
 */
export default function Library() {
  const { onFilePick } = useDocFilePicker();
  const styles = useStyles(makeLibraryStyle);
  const [state, setState] = useState<LibraryState>({
    status: "loading",
    documents: [],
  });
  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState("");
  const [favoritePendingIds, setFavoritePendingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const latestRequestRef = useRef(0);
  const favoritePendingRef = useRef<Set<string>>(new Set());

  const loadDocuments = useCallback(async (showLoading = false) => {
    const requestId = ++latestRequestRef.current;

    if (showLoading) {
      setState((current) =>
        current.documents.length > 0
          ? current
          : { status: "loading", documents: [] },
      );
    }

    try {
      const rows = await Database.getDocuments();
      const documents = rows.map((row) => ({
        ...toDocument(row),
        /**
         * Only rows without a permanent ingested copy need a live stat —
         * the cache/content URI they point to can expire. Ingested copies
         * live in app-private storage and are trusted without re-statting
         * (a missing ingested copy surfaces when the document is opened).
         */
        available: row.local_uri ? true : isFileAccessible(row.uri),
      }));

      if (requestId !== latestRequestRef.current) {
        return false;
      }

      setState({ status: "ready", documents });
      return true;
    } catch (e) {
      console.error("Library load failed:", e);

      if (requestId !== latestRequestRef.current) {
        return false;
      }

      setState((current) => ({
        status: "error",
        documents: current.documents,
        message: "Your library couldn’t be loaded. Please try again.",
      }));
      return false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDocuments(true);

      return () => {
        // Invalidate work started by the screen that just lost focus. A later
        // focus/mutation owns a larger request id and cannot be overwritten.
        latestRequestRef.current += 1;
      };
    }, [loadDocuments]),
  );

  const handleOpenDocument = async () => {
    const saved = await onFilePick();
    if (saved) {
      await loadDocuments();
      router.push({ pathname: "/reader", params: { id: saved.id } });
    }
  };

  const handlePressDocument = (doc: Document) => {
    router.push({ pathname: "/reader", params: { id: doc.id } });
  };

  const handleFavoriteChange = useCallback(
    async (document: Document, favorite: boolean) => {
      if (favoritePendingRef.current.has(document.id)) {
        return;
      }

      favoritePendingRef.current.add(document.id);
      // A mutation owns the newest state; invalidate any older focus refresh
      // whose result could otherwise overwrite this favorite value.
      latestRequestRef.current += 1;
      setFavoriteError(null);
      setFavoritePendingIds((current) => {
        const next = new Set(current);
        next.add(document.id);
        return next;
      });

      try {
        const result = await Database.setFavorite(
          document.id,
          favorite ? 1 : 0,
        );
        if (result.changes !== 1) {
          throw new Error(`Document ${document.id} was not updated.`);
        }

        setState((current) => ({
          ...current,
          documents: current.documents.map((item) =>
            item.id === document.id ? { ...item, favorite } : item,
          ),
        }));
      } catch (error) {
        console.error("Favorite update failed:", error);
        setFavoriteError("Favorite couldn’t be updated. Please try again.");
      } finally {
        favoritePendingRef.current.delete(document.id);
        setFavoritePendingIds((current) => {
          const next = new Set(current);
          next.delete(document.id);
          return next;
        });
      }
    },
    [],
  );

  const documents = state.documents;
  const hasDocuments = documents.length > 0;
  const normalizedQuery = normalizeLibraryQuery(query);
  const hasSearchQuery = normalizedQuery.length > 0;
  const visibleDocuments = useMemo(
    () => filterDocumentsByName(documents, query),
    [documents, query],
  );
  const hasVisibleDocuments = visibleDocuments.length > 0;
  const sections = useMemo<LibrarySection[]>(() => {
    const favorites = visibleDocuments.filter((document) => document.favorite);
    const recent = visibleDocuments.filter((document) => !document.favorite);
    const next: LibrarySection[] = [];

    if (favorites.length > 0) {
      next.push({ key: "favorites", title: "Favorites", data: favorites });
    }
    if (recent.length > 0) {
      next.push({ key: "recent", title: "Recent", data: recent });
    }

    return next;
  }, [visibleDocuments]);

  const closeSearch = () => {
    setQuery("");
    setSearchActive(false);
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <View
        style={[
          styles.header,
          searchActive && styles.searchHeader,
        ]}
      >
        {searchActive ? (
          <>
            <View style={styles.searchField}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                autoFocus
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                inputMode="search"
                returnKeyType="search"
                maxLength={120}
                placeholder="Search documents"
                placeholderTextColor="#747474"
                selectionColor="#111111"
                underlineColorAndroid="transparent"
                style={styles.searchInput}
                accessibilityRole="search"
                accessibilityLabel="Search documents by filename"
              />
              {query.length > 0 ? (
                <TouchableOpacity
                  style={styles.searchClear}
                  onPress={() => setQuery("")}
                  accessibilityRole="button"
                  accessibilityLabel="Clear library search"
                >
                  <Text style={styles.searchClearLabel}>{"\u00D7"}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.searchCancel}
              onPress={closeSearch}
              accessibilityRole="button"
              accessibilityLabel="Cancel library search"
            >
              <Text style={styles.searchCancelLabel}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.headerTitle}>Reader</Text>

            <TouchableOpacity
              style={styles.headerAction}
              accessibilityRole="button"
              accessibilityLabel="Search library"
              onPress={() => setSearchActive(true)}
            >
              <Text style={styles.headerIcon}>{"\u{1F50D}"}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {hasDocuments ? (
        <>
          {favoriteError ? (
            <View
              style={styles.errorBanner}
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.errorBannerText}>{favoriteError}</Text>
              <TouchableOpacity
                onPress={() => setFavoriteError(null)}
                accessibilityRole="button"
                accessibilityLabel="Dismiss favorite error"
              >
                <Text style={styles.errorBannerAction}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {state.status === "error" ? (
            <View
              style={styles.errorBanner}
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.errorBannerText}>{state.message}</Text>
              <TouchableOpacity
                onPress={() => void loadDocuments()}
                accessibilityRole="button"
                accessibilityLabel="Retry loading library"
              >
                <Text style={styles.errorBannerAction}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {hasSearchQuery && !hasVisibleDocuments ? (
            <View style={styles.stateContainer}>
              <Text style={styles.stateTitle}>No documents found</Text>
              <Text style={styles.stateMessage}>
                Try a different filename or open a new document.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setQuery("")}
                accessibilityRole="button"
                accessibilityLabel="Clear library search"
              >
                <Text style={styles.retryButtonLabel}>Clear search</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryStateButton}
                onPress={handleOpenDocument}
                accessibilityRole="button"
                accessibilityLabel="Open a document"
              >
                <Text style={styles.secondaryStateButtonLabel}>
                  Open a document
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listWrap}>
              <SectionList
                sections={sections}
                extraData={favoritePendingIds}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section }) => (
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                )}
                renderItem={({ item }) => (
                  <DocumentListItem
                    document={item}
                    onPress={handlePressDocument}
                    onFavoriteChange={(document, favorite) =>
                      void handleFavoriteChange(document, favorite)
                    }
                    favoritePending={favoritePendingIds.has(item.id)}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.fab}
                onPress={handleOpenDocument}
                accessibilityRole="button"
                accessibilityLabel="Open a document"
              >
                <Text style={styles.fabLabel}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : state.status === "loading" ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator accessibilityLabel="Loading library" />
          <Text style={styles.stateMessage}>Loading your library…</Text>
        </View>
      ) : state.status === "error" ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Couldn’t load library</Text>
          <Text style={styles.stateMessage}>{state.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void loadDocuments(true)}
            accessibilityRole="button"
            accessibilityLabel="Retry loading library"
          >
            <Text style={styles.retryButtonLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Recent</Text>
          <EmptyLibrary onOpenDocument={handleOpenDocument} />
        </>
      )}
    </SafeAreaView>
  );
}
