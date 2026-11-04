import { Text, View } from "react-native";
import { makeEmptyLibraryStyle } from "@/styles";
import { useStyles } from "@/theme/useTheme";

/**
 * Empty library state — spec:8.
 * The screen owns the shared floating Open Document action.
 */
export function EmptyLibrary() {
  const styles = useStyles(makeEmptyLibraryStyle);
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{"\u{1F4C4}"}</Text>
      <Text style={styles.title}>No documents yet</Text>
      <Text style={styles.subtitle}>Open a document to get started</Text>
    </View>
  );
}
