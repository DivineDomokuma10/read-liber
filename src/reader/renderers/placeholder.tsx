import { Text, View } from "react-native";

import type { RendererProps } from "./types";
import { readerStyle as styles } from "@/styles";

/**
 * Null-object strategy for formats whose real renderer hasn't landed yet.
 * Implements the same contract, so the reader screen needs zero format
 * knowledge and every chunk later drops its real component into the
 * registry without touching this file or the screen again.
 */
export function PlaceholderRenderer(_props: RendererProps) {
  return (
    <View style={styles.body}>
      <Text style={styles.stateTitle}>Reader view coming soon</Text>
      <Text style={styles.stateMessage}>
        This format can’t be rendered yet. It opens with its real reader in an
        upcoming step.
      </Text>
    </View>
  );
}
