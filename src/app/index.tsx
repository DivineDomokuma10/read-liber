import { Redirect } from "expo-router";

/**
 * App entry. Decides onboarding vs library.
 *
 * TODO (Phase 3): persist `hasSeenOnboarding` (mmkv) and redirect to
 * `/library` when true. For Phase 1, always show onboarding.
 */
export default function Index() {
  return <Redirect href="/onboarding" />;
}
