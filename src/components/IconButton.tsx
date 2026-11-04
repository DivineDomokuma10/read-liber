import { useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  type AccessibilityState,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useReducedMotion } from "@/hooks";
import { glassSurface, interaction, motion, radius } from "@/theme";
import { useTheme } from "@/theme/useTheme";

type Props = Omit<
  PressableProps,
  "accessibilityLabel" | "accessibilityState" | "children" | "style"
> & {
  accessibilityLabel: string;
  accessibilityState?: AccessibilityState;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Round 44×44 supporting control from DS §10. */
export function IconButton({
  accessibilityLabel,
  accessibilityState,
  children,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...pressableProps
}: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [pressedValue] = useState(() => new Animated.Value(0));

  const animateTo = (value: number) => {
    if (reduceMotion) {
      pressedValue.setValue(0);
      return;
    }

    Animated.timing(pressedValue, {
      toValue: value,
      duration: motion.fast,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    animateTo(1);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    animateTo(0);
    onPressOut?.(event);
  };

  return (
    <Animated.View
      style={[
        styles.frame,
        glassSurface(colors),
        {
          opacity: disabled ? 0.5 : 1,
          transform: [
            {
              scale: pressedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.94],
              }),
            },
          ],
        },
        style,
      ]}
    >
      <Pressable
        {...pressableProps}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={pressableProps.accessibilityRole ?? "button"}
        accessibilityState={{
          ...accessibilityState,
          disabled: disabled ?? undefined,
        }}
        disabled={disabled}
        hitSlop={pressableProps.hitSlop ?? 4}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.touchTarget,
          pressed && { backgroundColor: colors.glass.backgroundHover },
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: interaction.preferredTarget,
    height: interaction.preferredTarget,
    borderRadius: radius.pill,
  },
  touchTarget: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
});
