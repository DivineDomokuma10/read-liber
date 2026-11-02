import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useIncomingDocument } from "@/hooks";
import { createDocSchema } from "@/db/";

export default function RootLayout() {
  useIncomingDocument();

  useEffect(() => {
    createDocSchema().catch(console.error);
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="library" />
        <Stack.Screen name="reader" />
      </Stack>
    </>
  );
}
