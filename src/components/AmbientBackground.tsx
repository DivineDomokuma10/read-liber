import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { useTheme } from "@/theme/useTheme";

type Props = {
  /** Content rendered above the decorative, non-interactive background. */
  children?: React.ReactNode;
};

/**
 * DS §4 ambient screen background.
 *
 * SVG approximates the CSS radial-gradient layers from the design system:
 * the glow centers, colors, opacity, and linear stops are preserved while
 * the radial falloff is adapted to a native full-screen vector surface.
 */
export function AmbientBackground({ children }: Props) {
  const { colors } = useTheme();
  const ambient = colors.ambient;

  return (
    <View style={styles.container}>
      <Svg
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <LinearGradient id="ambient-base" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={ambient.linearStart} />
            <Stop offset="52%" stopColor={ambient.linearMiddle} />
            <Stop offset="100%" stopColor={ambient.linearEnd} />
          </LinearGradient>
          <RadialGradient id="ambient-top" cx="92%" cy="5%" r="35%">
            <Stop
              offset="0%"
              stopColor={ambient.topGlow}
              stopOpacity={ambient.topGlowOpacity}
            />
            <Stop offset="100%" stopColor={ambient.topGlow} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="ambient-side" cx="-8%" cy="66%" r="38%">
            <Stop
              offset="0%"
              stopColor={ambient.sideGlow}
              stopOpacity={ambient.sideGlowOpacity}
            />
            <Stop offset="100%" stopColor={ambient.sideGlow} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#ambient-base)" />
        <Rect width="100%" height="100%" fill="url(#ambient-top)" />
        <Rect width="100%" height="100%" fill="url(#ambient-side)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
