import { Redirect } from "expo-router";
import Storage from "expo-sqlite/kv-store";

/**
 * App entry. Skips onboarding when it was already seen.
 * Flag persists in expo-sqlite/kv-store (no extra dependency).
 */
export default function Index() {
  let hasSeenOnboarding = false;
  try {
    hasSeenOnboarding =
      Storage.getItemSync("hasSeenOnboarding") === "true";
  } catch {
    hasSeenOnboarding = false;
  }
  return <Redirect href={hasSeenOnboarding ? "/library" : "/onboarding"} />;
}
