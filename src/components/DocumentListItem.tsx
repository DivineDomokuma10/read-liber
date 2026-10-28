import { Text, TouchableOpacity, View } from "react-native";
import type { Document } from "@/types/document";
import { documentListItemStyle as styles } from "@/styles";
import { formatLastOpened } from "@/utils";

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
  const missing = document.available === false;

  return (
    <TouchableOpacity
      style={[styles.row, missing && styles.rowMissing]}
      onPress={() => onPress(document)}
      accessibilityRole="button"
      accessibilityLabel={
        "Open " + document.name + (missing ? ", file unavailable" : "")
      }
      activeOpacity={missing ? 1 : undefined}
    >
      <Text style={[styles.icon, missing && styles.iconMissing]}>
        {TYPE_ICON[document.type]}
      </Text>
      <View style={styles.meta}>
        <Text style={[styles.name, missing && styles.nameMissing]} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={[styles.detail, missing && styles.nameMissing]}>
          {missing
            ? `${TYPE_LABEL[document.type]} · File unavailable`
            : `${TYPE_LABEL[document.type]} · Page ${document.page} · ${formatLastOpened(document.lastOpened)}`}
        </Text>
      </View>
      {/* TODO (Phase 3): favorite star toggle goes here. */}
    </TouchableOpacity>
  );
}
