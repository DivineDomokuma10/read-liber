import { StyleSheet } from "react-native";

export const onboardingStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skip: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 32,
  },
  skipLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  dotActive: {
    backgroundColor: "#111",
  },
  next: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
