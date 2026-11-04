import { StyleSheet } from "react-native";

export const documentListItemStyle = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  openArea: {
    flex: 1,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 16,
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
  rowMissing: {
    opacity: 0.5,
  },
  iconMissing: {
    opacity: 0.5,
  },
  nameMissing: {
    opacity: 0.55,
  },
  favoriteButton: {
    width: 56,
    height: 56,
    marginRight: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButtonPending: {
    opacity: 0.45,
  },
  favoriteLabel: {
    color: "#555",
    fontSize: 26,
    lineHeight: 30,
  },
  favoriteLabelSelected: {
    color: "#8A4B00",
  },
});
