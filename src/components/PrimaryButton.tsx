import { useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useReducedMotion } from "@/hooks";
import {
  fonts,
  motion,
  primaryActionShadowColor,
  radius,
  typography,
} from "@/theme";
import { useTheme } from "@/theme/useTheme";

type Props = Omit<PressableProps, "children" | "style"> & {
  label: string;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Flat primary action from DS §9, with DS §13 press feedback. */
export function PrimaryButton({
  label,
  icon,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...pressableProps
}: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [pressed] = useState(() => new Animated.Value(0));

  const animateTo = (value: number) => {
    if (reduceMotion) {
      pressed.setValue(0);
      return;
    }

    Animated.timing(pressed, {
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

  const animatedStyle = {
    opacity: disabled ? 0.5 : 1,
    transform: [
      {
        translateY: pressed.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
      {
        scale: pressed.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.98],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.shadow, animatedStyle, style]}>
      <Pressable
        {...pressableProps}
        accessibilityRole={pressableProps.accessibilityRole ?? "button"}
        accessibilityState={{
          ...pressableProps.accessibilityState,
          disabled: disabled ?? undefined,
        }}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, { backgroundColor: colors.brand.primary }]}
      >
        {icon}
        <Text style={[styles.label, { color: colors.brand.onPrimary }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radius.button,
    shadowColor: primaryActionShadowColor,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  button: {
    minHeight: 52,
    paddingLeft: 16,
    paddingRight: 19,
    borderRadius: radius.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  label: {
    fontFamily: fonts.ui.bold,
    fontSize: typography.button.size,
    lineHeight: typography.button.size,
  },
});
