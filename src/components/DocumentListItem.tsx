import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
} from "react-native";

import { FormatBadge } from "@/components/FormatBadge";
import { StarFilledIcon, StarIcon } from "@/components/icons";
import { useReducedMotion } from "@/hooks";
import { makeDocumentListItemStyle } from "@/styles";
import { motion } from "@/theme";
import { useStyles, useTheme } from "@/theme/useTheme";
import type { Document } from "@/types/document";
import { formatLastOpened, formatReadingPosition } from "@/utils";

type Props = {
  document: Document;
  onPress: (document: Document) => void;
  onFavoriteChange: (document: Document, favorite: boolean) => void;
  favoritePending?: boolean;
};

const TYPE_LABEL: Record<Document["type"], string> = {
  pdf: "PDF",
  docx: "DOCX",
  md: "Markdown",
  txt: "TXT",
};

/** Glass document row from DS §8, preserving the existing action semantics. */
export function DocumentListItem({
  document,
  onPress,
  onFavoriteChange,
  favoritePending = false,
}: Props) {
  const { colors } = useTheme();
  const styles = useStyles(makeDocumentListItemStyle);
  const reduceMotion = useReducedMotion();
  const [pressedValue] = useState(() => new Animated.Value(0));
  const [entryValue] = useState(() => new Animated.Value(0));
  const missing = document.available === false;
  const typeLabel = TYPE_LABEL[document.type];
  const positionLabel = formatReadingPosition(
    document.type,
    document.page,
    document.percent,
  );
  const lastOpenedLabel = formatLastOpened(document.lastOpened);
  const progress = Math.min(Math.max(document.percent, 0), 100);
  const accessibilityDetail = missing
    ? `${typeLabel}, file unavailable`
    : `${typeLabel}, ${positionLabel}, ${lastOpenedLabel}, ${Math.round(progress)} percent`;

  useEffect(() => {
    if (reduceMotion) {
      entryValue.setValue(1);
      return;
    }

    const animation = Animated.timing(entryValue, {
      toValue: 1,
      duration: motion.entry,
      easing: Easing.ease,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [entryValue, reduceMotion]);

  const animateTo = (value: number) => {
    if (reduceMotion) {
      pressedValue.setValue(0);
      return;
    }

    Animated.timing(pressedValue, {
      toValue: value,
      duration: motion.standard,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.row,
        missing && styles.rowMissing,
        {
          opacity: entryValue,
          transform: [
            {
              translateY: entryValue.interpolate({
                inputRange: [0, 1],
                outputRange: [6, 0],
              }),
            },
            {
              scale: pressedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.985],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        style={styles.openArea}
        onPress={() => onPress(document)}
        onPressIn={() => animateTo(1)}
        onPressOut={() => animateTo(0)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${document.name}, ${accessibilityDetail}`}
      >
        <FormatBadge type={document.type} />

        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {document.name}
          </Text>

          <View style={styles.detailRow}>
            <FormatBadge type={document.type} variant="tag" />
            <Text style={styles.detail} numberOfLines={1}>
              {missing ? "File unavailable" : positionLabel}
            </Text>
            {!missing ? (
              <>
                <Text style={styles.detailDivider}>·</Text>
                <Text style={styles.detail} numberOfLines={1}>
                  {lastOpenedLabel}
                </Text>
              </>
            ) : null}
          </View>

          {!missing ? (
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.favoriteButton,
          (favoritePending || pressed) && styles.favoriteButtonPending,
        ]}
        onPress={() => onFavoriteChange(document, !document.favorite)}
        disabled={favoritePending}
        hitSlop={4}
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
        {document.favorite ? (
          <StarFilledIcon size={18} color={colors.favorite.color} />
        ) : (
          <StarIcon size={18} color={colors.text.muted} />
        )}
      </Pressable>
    </Animated.View>
  );
}
