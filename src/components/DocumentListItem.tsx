import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Document } from "@/types/document";

type Props = {
  document: Document;
  onPress: (document: Document) => void;
};

const TYPE_ICON: Record<Document["type"], string> = {
  pdf: "📄",
  docx: "📄",
  md: "📝",
  txt: "📝",
};

const TYPE_LABEL: Record<Document["type"], string> = {
  pdf: "PDF",
  docx: "DOCX",
  md: "Markdown",
  txt: "TXT",
};

/** One row of the library list — spec:11. List, not cards. */
export function DocumentListItem({ document, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(document)}
      accessibilityRole="button"
      accessibilityLabel={"Open " + document.name}
    >
      <Text style={styles.icon}>{TYPE_ICON[document.type]}</Text>
      <View style={styles.meta}>
        <Text style={styles.name} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={styles.detail}>
          {TYPE_LABEL[document.type]} · Page {document.page} ·{" "}
          {formatLastOpened(document.lastOpened)}
        </Text>
      </View>
      {/* TODO (Phase 3): favorite star toggle goes here. */}
    </TouchableOpacity>
  );
}

// TODO (you): move this to a `src/utils/format.ts` and handle
// minutes / hours / days / weeks properly. Keep it pure + tested.
function formatLastOpened(lastOpened: number): string {
  const diffMin = Math.max(1, Math.round((Date.now() - lastOpened) / 60000));
  if (diffMin < 60) return diffMin + " min ago";
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return diffHours + " h ago";
  const diffDays = Math.round(diffHours / 24);
  return diffDays + " d ago";
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  meta: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  detail: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
});
