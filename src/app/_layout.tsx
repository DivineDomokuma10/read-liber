import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { Literata_400Regular } from "@expo-google-fonts/literata/400Regular";
import { Literata_400Regular_Italic } from "@expo-google-fonts/literata/400Regular_Italic";
import { Literata_500Medium } from "@expo-google-fonts/literata/500Medium";
import { Literata_600SemiBold } from "@expo-google-fonts/literata/600SemiBold";

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
