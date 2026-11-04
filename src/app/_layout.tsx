import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useIncomingDocument } from "@/hooks";
import { initializeDatabase } from "@/db";

export default function RootLayout() {
  useIncomingDocument();

  useEffect(() => {
    void initializeDatabase().catch((error) => {
      // DAO callers retry through the same initialization barrier and surface
      // operation-specific UI; this eagerly records startup failures.
      console.error("Database initialization failed:", error);
    });
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
