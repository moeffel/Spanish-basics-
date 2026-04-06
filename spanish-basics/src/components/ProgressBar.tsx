import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = COLORS.primary,
  height = 12,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(clampedProgress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%` as any,
  }));

  const percentage = Math.round(clampedProgress * 100);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              height,
              borderRadius: height / 2,
            },
            fillStyle,
          ]}
        >
          <View
            style={[
              styles.shimmer,
              { borderRadius: height / 2 },
            ]}
          />
        </Animated.View>
      </View>
      <Text style={styles.percentageText}>{percentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  track: {
    flex: 1,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  percentageText: {
    ...FONTS.caption,
    fontWeight: "700",
    color: COLORS.textSecondary,
    minWidth: 36,
    textAlign: "right",
  },
});
