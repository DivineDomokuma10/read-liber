import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

/**
 * First-launch carousel — spec:6.
 * 3 slides, skippable, lightweight, never a barrier.
 */
const SLIDES = [
  {
    key: "simple",
    title: "Just open and read.",
    body: "Pick a document and start reading. Nothing in between.",
  },
  {
    key: "distraction-free",
    title: "No ads. No interruptions.",
    body: "The document is the interface. Controls stay out of the way.",
  },
  {
    key: "remember",
    title: "Continue where you stopped.",
    body: "Your reading position is remembered for every document.",
  },
];

export default function Onboarding() {
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = () => {
    // TODO (Phase 3): set `hasSeenOnboarding = true` in mmkv here.
    router.replace("/library");
  };

  const goNext = () => {
    if (page === SLIDES.length - 1) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: page + 1, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* TODO (you): is "Skip" loud enough here? Spec says onboarding
          "should not become a barrier". Consider placement + hit area. */}
      <TouchableOpacity
        style={styles.skip}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
      >
        <Text style={styles.skipLabel}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={(e) => {
          const next = Math.round(e.nativeEvent.contentOffset.x / width);
          setPage(next);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.key}
              style={[styles.dot, i === page && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.next}
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel={
            page === SLIDES.length - 1 ? "Get started" : "Next slide"
          }
        >
          <Text style={styles.nextLabel}>
            {page === SLIDES.length - 1 ? "Get started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skip: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 32,
  },
  skipLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  dotActive: {
    backgroundColor: "#111",
  },
  next: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
