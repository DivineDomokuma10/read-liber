import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onOpenDocument: () => void;
};

/**
 * Empty library state — spec:8.
 * "No documents yet" + supporting text + floating `+` action.
 */
export function EmptyLibrary({ onOpenDocument }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{"\u{1F4C4}"}</Text>
      <Text style={styles.title}>No documents yet</Text>
      <Text style={styles.subtitle}>Open a document to get started</Text>

      <TouchableOpacity
        style={styles.fab}
        onPress={onOpenDocument}
        accessibilityLabel="Open a document"
        accessibilityRole="button"
      >
        <Text style={styles.fabLabel}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  fabLabel: {
    fontSize: 28,
    lineHeight: 30,
    color: "#fff",
  },
});
