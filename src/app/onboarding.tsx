import {
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useRef, useState } from "react";
import Storage from "expo-sqlite/kv-store";

import { SLIDES } from "@/data/constant";
import { onboardingStyle } from "@/styles";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = () => {
    try {
      Storage.setItemSync("hasSeenOnboarding", "true");
    } catch (e) {
      console.error(e);
    }
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
    <View style={onboardingStyle.container}>
      <TouchableOpacity
        style={onboardingStyle.skip}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
      >
        <Text style={onboardingStyle.skipLabel}>Skip</Text>
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
          <View style={[onboardingStyle.slide, { width }]}>
            <Text style={onboardingStyle.title}>{item.title}</Text>
            <Text style={onboardingStyle.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={onboardingStyle.footer}>
        <View style={onboardingStyle.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.key}
              style={[
                onboardingStyle.dot,
                i === page && onboardingStyle.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={onboardingStyle.next}
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel={
            page === SLIDES.length - 1 ? "Get started" : "Next slide"
          }
        >
          <Text style={onboardingStyle.nextLabel}>
            {page === SLIDES.length - 1 ? "Get started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
