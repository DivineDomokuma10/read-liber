import { Text, TouchableOpacity, View } from "react-native";
import { emptyLibraryStyle as styles } from "@/styles";

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
