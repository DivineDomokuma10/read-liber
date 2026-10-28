import { useLocalSearchParams } from "expo-router";

import { ReaderScreen } from "@/reader/ReaderScreen";

export default function ReaderRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return <ReaderScreen documentId={id} />;
}
