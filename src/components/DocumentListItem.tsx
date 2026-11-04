import { Text, TouchableOpacity, View } from "react-native";
import type { Document } from "@/types/document";
import { makeDocumentListItemStyle } from "@/styles";
import { useStyles } from "@/theme/useTheme";
import { formatLastOpened, formatReadingPosition } from "@/utils";

type Props = {
  document: Document;
  onPress: (document: Document) => void;
  onFavoriteChange: (document: Document, favorite: boolean) => void;
  favoritePending?: boolean;
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
export function DocumentListItem({
  document,
  onPress,
  onFavoriteChange,
  favoritePending = false,
}: Props) {
  const styles = useStyles(makeDocumentListItemStyle);
  const missing = document.available === false;
  const typeLabel = TYPE_LABEL[document.type];
  const positionLabel = formatReadingPosition(
    document.type,
    document.page,
    document.percent,
  );
  const lastOpenedLabel = formatLastOpened(document.lastOpened);
  const detailLabel = missing
    ? `${typeLabel} · File unavailable`
    : `${typeLabel} · ${positionLabel} · ${lastOpenedLabel}`;
  const accessibilityDetail = missing
    ? `${typeLabel}, file unavailable`
    : `${typeLabel}, ${positionLabel}, ${lastOpenedLabel}`;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.openArea, missing && styles.rowMissing]}
        onPress={() => onPress(document)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${document.name}, ${accessibilityDetail}`}
        activeOpacity={missing ? 1 : undefined}
      >
        <Text style={[styles.icon, missing && styles.iconMissing]}>
          {TYPE_ICON[document.type]}
        </Text>
        <View style={styles.meta}>
          <Text
            style={[styles.name, missing && styles.nameMissing]}
            numberOfLines={1}
          >
            {document.name}
          </Text>
          <Text style={[styles.detail, missing && styles.nameMissing]}>
            {detailLabel}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.favoriteButton,
          favoritePending && styles.favoriteButtonPending,
        ]}
        onPress={() => onFavoriteChange(document, !document.favorite)}
        disabled={favoritePending}
        accessibilityRole="togglebutton"
        accessibilityLabel={
          document.favorite
            ? `Remove ${document.name} from favorites`
            : `Add ${document.name} to favorites`
        }
        accessibilityState={{
          checked: document.favorite,
          disabled: favoritePending,
        }}
      >
        <Text
          style={[
            styles.favoriteLabel,
            document.favorite && styles.favoriteLabelSelected,
          ]}
        >
          {document.favorite ? "\u2605" : "\u2606"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
