import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { readerStyle as styles } from "@/styles";
import type { DocumentRow } from "@/types";
import { useReaderDocument } from "./hooks/useReaderDocument";

const TYPE_LABEL: Record<DocumentRow["type"], string> = {
  pdf: "PDF",
  docx: "DOCX",
  md: "Markdown",
  txt: "TXT",
};

function goToLibrary() {
  router.dismissTo("/library");
}

type Props = {
  documentId?: string;
};

export function ReaderScreen({ documentId }: Props) {
  const { state, reload } = useReaderDocument(documentId);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
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

      {state.status === "loading" ? (
        <View style={styles.body}>
          <ActivityIndicator accessibilityLabel="Loading document" />
        </View>
      ) : null}

      {state.status === "ready" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>{state.document.name}</Text>
          <Text style={styles.documentType}>
            {TYPE_LABEL[state.document.type]}
          </Text>
          <Text style={styles.stateMessage}>
            Reader rendering is coming in the next step.
          </Text>
        </View>
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
