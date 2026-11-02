import { StyleSheet } from "react-native";

/**
 * Placeholder shown while an intent-shared document ("Open with" → Read
 * Liber) is being received and ingested — the incoming-intent handler owns
 * navigation and leaves this screen once the document is ready.
 * Mirrors the EmptyLibrary look so a handoff never feels like an error.
 */
export const notFoundStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
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
    textAlign: "center",
  },
});
