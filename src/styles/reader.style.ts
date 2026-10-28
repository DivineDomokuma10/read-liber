import { StyleSheet } from "react-native";

export const readerStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backLabel: {
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  stateMessage: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.6,
  },
  primaryButton: {
    marginTop: 24,
    minHeight: 44,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#111",
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButton: {
    marginTop: 12,
    minHeight: 44,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  documentType: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    opacity: 0.4,
  },
  rendererWrap: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 14,
    color: "#1a1a1a",
  },
});
