import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
  interpolateColor,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";

interface StreakCounterProps {
  streak: number;
  isActive: boolean;
}

export default function StreakCounter({ streak, isActive }: StreakCounterProps) {
  const flameScale = useSharedValue(1);
  const flameRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const numberScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      // Pulsing flame scale
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Slight rotation wobble
      flameRotation.value = withRepeat(
        withSequence(
          withTiming(6, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(-6, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Glow pulse
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700 }),
          withTiming(0.4, { duration: 700 })
        ),
        -1,
        true
      );

      // Bounce the number in
      numberScale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 180 })
      );
    } else {
      cancelAnimation(flameScale);
      cancelAnimation(flameRotation);
      cancelAnimation(glowOpacity);
      flameScale.value = withTiming(1, { duration: 200 });
      flameRotation.value = withTiming(0, { duration: 200 });
      glowOpacity.value = withTiming(0, { duration: 200 });
      numberScale.value = withTiming(1, { duration: 200 });
    }
  }, [isActive, flameScale, flameRotation, glowOpacity, numberScale]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { rotate: `${flameRotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  return (
    <View style={[styles.container, isActive && styles.containerActive]}>
      {/* Glow behind the fire icon */}
      {isActive && (
        <Animated.View style={[styles.glow, glowStyle]} />
      )}

      {/* Fire icon with animation */}
      <View style={styles.fireSection}>
        <Animated.View style={flameStyle}>
          <MaterialCommunityIcons
            name="fire"
            size={28}
            color={isActive ? COLORS.streakOrange : COLORS.textLight}
          />
        </Animated.View>
      </View>

      {/* Streak count */}
      <Animated.View style={[styles.countSection, numberStyle]}>
        <Text style={[styles.streakNumber, isActive && styles.streakNumberActive]}>
          {streak}
        </Text>
        <Text style={[styles.streakLabel, isActive && styles.streakLabelActive]}>
          {streak === 1 ? "Tag" : "Tage"}
        </Text>
      </Animated.View>

      {/* Milestone indicator */}
      {isActive && streak > 0 && streak % 7 === 0 && (
        <View style={styles.milestoneBadge}>
          <MaterialCommunityIcons
            name="trophy"
            size={12}
            color={COLORS.xpGold}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
    position: "relative",
    overflow: "visible",
  },
  containerActive: {
    backgroundColor: COLORS.streakOrange + "12",
    borderWidth: 1.5,
    borderColor: COLORS.streakOrange + "30",
  },
  glow: {
    position: "absolute",
    left: 6,
    top: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.streakOrange + "25",
  },
  fireSection: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  countSection: {
    alignItems: "center",
    minWidth: 28,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textLight,
    lineHeight: 20,
  },
  streakNumberActive: {
    color: COLORS.streakOrange,
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  streakLabelActive: {
    color: COLORS.streakOrange,
  },
  milestoneBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.xpGold + "25",
    borderWidth: 1.5,
    borderColor: COLORS.xpGold,
    alignItems: "center",
    justifyContent: "center",
  },
});
