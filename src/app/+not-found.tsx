import { useURL } from "expo-linking";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";

import { isSharedIntentUrl } from "@/utils";
import { makeNotFoundStyle } from "@/styles";
import { useStyles } from "@/theme/useTheme";

/**
 * Catch-all for URLs no route matches — this Expo Router version renders
 * [+]not-found for unhandled links. Two cases arrive here:
 *
 * 1. An intent-shared document (`content://` / `file://` from WhatsApp's
 *    "Open with"). The incoming-intent handler is ingesting it and will
 *    navigate to the reader when done — show a placeholder instead of the
 *    default "Unmatched Route" error.
 * 2. Any genuinely unknown `read-liber://` deep link — redirect home.
 */
export default function NotFoundRoute() {
  const url = useURL();
  const styles = useStyles(makeNotFoundStyle);

  if (url === null || isSharedIntentUrl(url)) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>{"\u{1F4C4}"}</Text>
        <Text style={styles.title}>Opening document…</Text>
        <Text style={styles.subtitle}>
          Finishing the handoff from the other app.
        </Text>
      </View>
    );
  }

  return <Redirect href="/" />;
}
