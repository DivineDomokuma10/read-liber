import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  Literata_400Regular,
  Literata_500Medium,
  Literata_600SemiBold,
  Literata_400Regular_Italic,
  Literata_500Medium_Italic,
  Literata_600SemiBold_Italic,
} from "@expo-google-fonts/literata";

import { useIncomingDocument } from "@/hooks";
import { initializeDatabase } from "@/db";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden (fast refresh); nothing to do.
});

export default function RootLayout() {
  useIncomingDocument();

  // Loaded names mirror the `fonts` tokens in src/theme/tokens.ts.
  const [fontsLoaded, fontsError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Literata_400Regular,
    Literata_500Medium,
    Literata_600SemiBold,
    Literata_400Regular_Italic,
    Literata_500Medium_Italic,
    Literata_600SemiBold_Italic,
  });

  useEffect(() => {
    void initializeDatabase().catch((error) => {
      // DAO callers retry through the same initialization barrier and surface
      // operation-specific UI; this eagerly records startup failures.
      console.error("Database initialization failed:", error);
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      void SplashScreen.hideAsync().catch(() => {
        // Splash may already be hidden (fast refresh); nothing to do.
      });
    }
  }, [fontsLoaded, fontsError]);

  // Loading failure falls back to system fonts rather than blocking the app.
  if (!fontsLoaded && !fontsError) {
    return null;
  }

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
