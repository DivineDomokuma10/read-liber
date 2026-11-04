import { Text, View } from "react-native";
import { FileGlyphIcon } from "@/components/icons";
import { makeEmptyLibraryStyle } from "@/styles";
import { useStyles, useTheme } from "@/theme/useTheme";

/**
 * Empty library state — spec:8.
 * The screen owns the shared floating Open Document action.
 */
export function EmptyLibrary() {
  const { colors } = useTheme();
  const styles = useStyles(makeEmptyLibraryStyle);
  return (
    <View style={styles.container}>
      <View style={styles.iconSurface}>
        <FileGlyphIcon size={28} color={colors.brand.secondary} />
      </View>
      <Text style={styles.title}>No documents yet</Text>
      <Text style={styles.subtitle}>
        Open a PDF, document, Markdown, or text file to begin reading.
      </Text>
    </View>
  );
}
