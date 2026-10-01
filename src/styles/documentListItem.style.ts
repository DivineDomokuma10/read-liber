import { StyleSheet } from "react-native";

export const documentListItemStyle = StyleSheet.create({
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
