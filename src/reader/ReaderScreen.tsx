import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { readerStyle as styles } from "@/styles";
import { resolveDocumentUri } from "@/utils";
import { resolveStrategy } from "./renderers/registry";
import { usePositionPersistence } from "./hooks/usePositionPersistence";
import { useReaderDocument } from "./hooks/useReaderDocument";

/** Controls hide again after this much idle time. */
const CONTROLS_TIMEOUT_MS = 3500;

function goToLibrary() {
  router.dismissTo("/library");
}

type Props = {
  documentId?: string;
};

export function ReaderScreen({ documentId }: Props) {
  const { state, reload } = useReaderDocument(documentId);

  /** Clean-read mode: content fills the screen; controls live on tap. */
  const [controlsVisible, setControlsVisible] = useState(true);

  /**
   * Persistence policy lives here, not in renderers: the strategy reports
   * progress, this hook decides when it becomes a DB write. documentId is
   * empty-safe — callbacks are inert until a doc is ready.
   */
  const { onPositionChange } = usePositionPersistence(documentId ?? "");

  useEffect(() => {
    if (!controlsVisible) {
      return undefined;
    }
    const timer = setTimeout(() => setControlsVisible(false), CONTROLS_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [controlsVisible]);

  /** Tap on content: flip clean mode, and restart the idle hide timer. */
  const handleContentTap = useCallback(() => {
    setControlsVisible((visible) => !visible);
  }, []);

  /** Any user scroll gesture resolves to clean mode immediately. */
  const handleScrollStart = useCallback(() => {
    setControlsVisible(false);
  }, []);

  const strategy =
    state.status === "ready" ? resolveStrategy(state.document.type) : null;

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      {controlsVisible ? (
        <View style={styles.header}>
          <Pressable
            onPress={goToLibrary}
            style={styles.backButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back to library"
          >
            <Text style={styles.backLabel}>{"\u2190"}</Text>
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {state.status === "ready" ? state.document.name : "Reader"}
          </Text>
        </View>
      ) : null}

      {state.status === "loading" ? (
        <View style={styles.body}>
          <ActivityIndicator accessibilityLabel="Loading document" />
        </View>
      ) : null}

      {state.status === "ready" && strategy ? (
        <>
          <strategy.Component
            uri={resolveDocumentUri(state.document)}
            restore={{
              page: state.document.page,
              percent: state.document.percent,
            }}
            onPositionChange={onPositionChange}
            onScrollStart={handleScrollStart}
            onTap={handleContentTap}
          />

          {controlsVisible ? (
            <View style={styles.controlsBar}>
              <Pressable
                onPress={goToLibrary}
                style={styles.controlsButton}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Back to library"
              >
                <Text style={styles.controlsButtonLabel}>{"\u2190"}</Text>
              </Pressable>
              <Text style={styles.positionLabel}>
                {state.document.type === "pdf"
                  ? `Page ${state.document.page}`
                  : `${Math.round(state.document.percent)}%`}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}

      {state.status === "not-found" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>Document not found</Text>
          <Text style={styles.stateMessage}>
            It may have been removed. Open it again from your library.
          </Text>
          <Pressable
            onPress={goToLibrary}
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Back to library"
          >
            <Text style={styles.primaryButtonLabel}>Back to library</Text>
          </Pressable>
        </View>
      ) : null}

      {state.status === "unavailable" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>File unavailable</Text>
          <Text style={styles.stateMessage}>
            The document can’t be read on this device right now. Open it again
            from your files if you still have it.
          </Text>
          <Pressable
            onPress={goToLibrary}
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Back to library"
          >
            <Text style={styles.primaryButtonLabel}>Back to library</Text>
          </Pressable>
        </View>
      ) : null}

      {state.status === "error" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>Couldn’t open document</Text>
          <Text style={styles.stateMessage}>{state.message}</Text>
          <Pressable
            onPress={() => void reload()}
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry loading document"
          >
            <Text style={styles.primaryButtonLabel}>Retry</Text>
          </Pressable>
          <Pressable
            onPress={goToLibrary}
            style={styles.secondaryButton}
            accessibilityRole="button"
            accessibilityLabel="Back to library"
          >
            <Text style={styles.secondaryButtonLabel}>Back to library</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
