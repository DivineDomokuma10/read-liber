import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Storage from "expo-sqlite/kv-store";

import { FormatBadge } from "@/components/FormatBadge";
import { IconButton } from "@/components/IconButton";
import {
  ChevronLeftIcon,
  EllipsisIcon,
  StarFilledIcon,
  StarIcon,
} from "@/components/icons";
import { makeReaderStyle } from "@/styles";
import { resolveDocumentUri } from "@/utils";
import { useReducedMotion } from "@/hooks";
import { motion } from "@/theme";
import { useStyles, useTheme } from "@/theme/useTheme";
import { resolveStrategy } from "./renderers/registry";
import { usePositionPersistence } from "./hooks/usePositionPersistence";
import { useReaderDocument } from "./hooks/useReaderDocument";

/** Controls hide again after this much idle time. */
const CONTROLS_TIMEOUT_MS = 3500;

/** A−/A+ moves between these typography steps; step 1 is the default. */
const SCALE_STEPS = [0.85, 1, 1.15, 1.3];
const SCALE_KEY = "readerTextScale";

function readScaleIndex(): number {
  try {
    const raw = Storage.getItemSync(SCALE_KEY);
    const parsed = raw === null ? Number.NaN : parseInt(raw, 10);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed < SCALE_STEPS.length) {
      return parsed;
    }
  } catch {
    // No preference stored (or storage down) — default step.
  }
  return 1;
}

function goToLibrary() {
  router.dismissTo("/library");
}

type Props = {
  documentId?: string;
};

export function ReaderScreen({ documentId }: Props) {
  const { state, reload, setFavorite } = useReaderDocument(documentId);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeReaderStyle);
  const reduceMotion = useReducedMotion();

  /** Clean-read mode: content fills the screen; controls live on tap. */
  const [controlsVisible, setControlsVisible] = useState(true);
  /** Global typography scale for text strategies, eased through A−/A+. */
  const [scaleIndex, setScaleIndex] = useState(readScaleIndex);
  const [favoritePending, setFavoritePending] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [controlsProgress] = useState(() => new Animated.Value(1));
  const [contentEntry] = useState(() => new Animated.Value(0));
  const [livePosition, setLivePosition] = useState<{
    documentId: string;
    page: number;
    percent: number;
  } | null>(null);

  /**
   * Persistence policy lives here, not in renderers: the strategy reports
   * progress, this hook decides when it becomes a DB write. documentId is
   * empty-safe — callbacks are inert until a doc is ready.
   */
  const { onPositionChange } = usePositionPersistence(documentId ?? "");

  useEffect(() => {
    if (!controlsVisible) {
      return undefined;
    }
    const timer = setTimeout(() => setControlsVisible(false), CONTROLS_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [controlsVisible]);

  useEffect(() => {
    const target = controlsVisible ? 1 : 0;
    if (reduceMotion) {
      controlsProgress.setValue(target);
      return;
    }

    const animation = Animated.timing(controlsProgress, {
      toValue: target,
      duration: controlsVisible ? motion.standard : motion.slow,
      easing: Easing.ease,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [controlsProgress, controlsVisible, reduceMotion]);

  useEffect(() => {
    if (state.status !== "ready") {
      contentEntry.setValue(0);
      return;
    }
    if (reduceMotion) {
      contentEntry.setValue(1);
      return;
    }

    const animation = Animated.timing(contentEntry, {
      toValue: 1,
      duration: motion.entry,
      easing: Easing.ease,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [contentEntry, reduceMotion, state.status]);

  /** Tap on content: flip clean mode, and restart the idle hide timer. */
  const handleContentTap = useCallback(() => {
    setControlsVisible((visible) => !visible);
  }, []);

  /** Any user scroll gesture resolves to clean mode immediately. */
  const handleScrollStart = useCallback(() => {
    setControlsVisible(false);
  }, []);

  const adjustScale = useCallback(
    (delta: number) => {
      const next = Math.min(Math.max(scaleIndex + delta, 0), SCALE_STEPS.length - 1);
      if (next === scaleIndex) {
        return;
      }
      setScaleIndex(next);
      try {
        Storage.setItemSync(SCALE_KEY, String(next));
      } catch {
        // Preference write failed; scope stays for this session.
      }
    },
    [scaleIndex],
  );

  const handleFavoriteToggle = useCallback(async () => {
    if (state.status !== "ready" || favoritePending) {
      return;
    }

    setFavoritePending(true);
    setFavoriteError(null);
    try {
      const updated = await setFavorite(state.document.favorite !== 1);
      if (!updated) {
        setFavoriteError("Favorite couldn’t be updated. Please try again.");
      }
    } catch (error) {
      console.error("Reader favorite update failed:", error);
      setFavoriteError("Favorite couldn’t be updated. Please try again.");
    } finally {
      setFavoritePending(false);
    }
  }, [favoritePending, setFavorite, state]);

  const handlePositionChange = useCallback(
    (page: number, percent: number) => {
      onPositionChange(page, percent);
      if (documentId) {
        setLivePosition({ documentId, page, percent });
      }
    },
    [documentId, onPositionChange],
  );

  const strategy =
    state.status === "ready" ? resolveStrategy(state.document.type) : null;
  const displayPosition =
    state.status === "ready" && livePosition?.documentId === state.document.id
      ? livePosition
      : state.status === "ready"
        ? { page: state.document.page, percent: state.document.percent }
        : { page: 1, percent: 0 };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <Animated.View
        pointerEvents={controlsVisible ? "box-none" : "none"}
        style={[
          styles.header,
          {
            opacity: controlsProgress,
            transform: [
              {
                translateY: controlsProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
            ],
          },
        ]}
      >
          <IconButton
            onPress={goToLibrary}
            accessibilityLabel="Back to library"
          >
            <ChevronLeftIcon color={colors.text.primary} />
          </IconButton>

          <View
            accessible
            accessibilityRole="header"
            accessibilityLabel={
              state.status === "ready"
                ? `${state.document.name}, ${state.document.type}`
                : "Reader"
            }
            style={styles.headerTitleChip}
          >
            <Text style={styles.headerTitle} numberOfLines={1}>
              {state.status === "ready" ? state.document.name : "Reader"}
            </Text>
            {state.status === "ready" ? (
              <View style={styles.headerMeta}>
                <FormatBadge type={state.document.type} variant="tag" />
              </View>
            ) : null}
          </View>

          {state.status === "ready" ? (
            <IconButton
              onPress={() => void handleFavoriteToggle()}
              disabled={favoritePending}
              accessibilityLabel={
                state.document.favorite === 1
                  ? `Remove ${state.document.name} from favorites`
                  : `Add ${state.document.name} to favorites`
              }
              accessibilityRole="togglebutton"
              accessibilityState={{
                checked: state.document.favorite === 1,
                disabled: favoritePending,
              }}
            >
              {state.document.favorite === 1 ? (
                <StarFilledIcon color={colors.favorite.color} />
              ) : (
                <StarIcon color={colors.text.primary} />
              )}
            </IconButton>
          ) : null}
      </Animated.View>

      {controlsVisible && favoriteError ? (
        <Text style={styles.headerNotice} accessibilityLiveRegion="polite">
          {favoriteError}
        </Text>
      ) : null}

      {state.status === "loading" ? (
        <View style={styles.body}>
          <ActivityIndicator accessibilityLabel="Loading document" />
        </View>
      ) : null}

      {state.status === "ready" && strategy ? (
        <>
          <Animated.View
            style={[
              styles.rendererWrap,
              {
                opacity: contentEntry,
                transform: [
                  {
                    translateY: contentEntry.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <strategy.Component
              uri={resolveDocumentUri(state.document)}
              restore={{
                page: state.document.page,
                percent: state.document.percent,
              }}
              onPositionChange={handlePositionChange}
              onScrollStart={handleScrollStart}
              onTap={handleContentTap}
              fontSizeScale={SCALE_STEPS[scaleIndex]}
            />
          </Animated.View>

          <Animated.View
            pointerEvents={controlsVisible ? "box-none" : "none"}
            style={[
              styles.controlsBar,
              { bottom: Math.max(insets.bottom, 16) },
              {
                opacity: controlsProgress,
                transform: [
                  {
                    translateY: controlsProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.statusPill}>
              <Text style={styles.positionLabel}>
                {state.document.type === "pdf"
                  ? `Page ${displayPosition.page}`
                  : `${Math.round(displayPosition.percent)}%`}
              </Text>
            </View>

              {state.document.type !== "pdf" ? (
                <View style={styles.settingsPill}>
                  <Pressable
                    onPress={() => adjustScale(-1)}
                    disabled={scaleIndex === 0}
                    style={styles.controlsButton}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Smaller text"
                  >
                    <Text
                      style={[
                        styles.controlsButtonLabel,
                        styles.controlsSizeLabel,
                        scaleIndex === 0 && styles.controlsSizeDisabled,
                      ]}
                    >
                      {"A\u2212"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => adjustScale(1)}
                    disabled={scaleIndex === SCALE_STEPS.length - 1}
                    style={styles.controlsButton}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Larger text"
                  >
                    <Text
                      style={[
                        styles.controlsButtonLabel,
                        styles.controlsSizeLabel,
                        scaleIndex === SCALE_STEPS.length - 1 &&
                          styles.controlsSizeDisabled,
                      ]}
                    >
                      {"A+"}
                    </Text>
                  </Pressable>
                  <View
                    accessible={false}
                    style={styles.controlsEllipsis}
                  >
                    <EllipsisIcon size={18} color={colors.text.secondary} />
                  </View>
                </View>
              ) : null}
          </Animated.View>
        </>
      ) : null}

      {state.status === "not-found" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>Document not found</Text>
          <Text style={styles.stateMessage}>
            It may have been removed. Open it again from your library.
          </Text>
          <Pressable
            onPress={goToLibrary}
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Back to library"
          >
            <Text style={styles.primaryButtonLabel}>Back to library</Text>
          </Pressable>
        </View>
      ) : null}

      {state.status === "unavailable" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>File unavailable</Text>
          <Text style={styles.stateMessage}>
            The document can’t be read on this device right now. Open it again
            from your files if you still have it.
          </Text>
          <Pressable
            onPress={goToLibrary}
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Back to library"
          >
            <Text style={styles.primaryButtonLabel}>Back to library</Text>
          </Pressable>
        </View>
      ) : null}

      {state.status === "error" ? (
        <View style={styles.body}>
          <Text style={styles.stateTitle}>Couldn’t open document</Text>
          <Text style={styles.stateMessage}>{state.message}</Text>
          <Pressable
            onPress={() => void reload()}
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry loading document"
          >
            <Text style={styles.primaryButtonLabel}>Retry</Text>
          </Pressable>
          <Pressable
            onPress={goToLibrary}
            style={styles.secondaryButton}
            accessibilityRole="button"
            accessibilityLabel="Back to library"
          >
            <Text style={styles.secondaryButtonLabel}>Back to library</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
