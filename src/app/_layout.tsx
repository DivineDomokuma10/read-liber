import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

/**
 * Root layout — every file in `src/app/` is a screen.
 * Phase 1 route map: / (redirect) → /onboarding → /library
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="library" />
      </Stack>
    </>
  );
}
