import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";

interface XPBadgeProps {
  amount: number;
  visible: boolean;
}

export function XPBadge({ amount, visible }: XPBadgeProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const coinRotate = useSharedValue(0);
  const shimmerOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 180 });
      scale.value = withSequence(
        withTiming(1.2, { duration: 250, easing: Easing.out(Easing.back(2)) }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      coinRotate.value = withSequence(
        withTiming(15, { duration: 100 }),
        withTiming(-15, { duration: 100 }),
        withTiming(10, { duration: 80 }),
        withTiming(-10, { duration: 80 }),
        withTiming(0, { duration: 60 })
      );
      shimmerOpacity.value = withDelay(
        300,
        withSequence(
          withTiming(0.8, { duration: 200 }),
          withTiming(0, { duration: 400 })
        )
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(20, { duration: 200 });
    }
  }, [visible, opacity, translateY, scale, coinRotate, shimmerOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const coinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${coinRotate.value}deg` }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  if (!visible && amount === 0) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Glow background */}
      <View style={styles.glowOuter} />

      {/* Main badge */}
      <View style={styles.badge}>
        {/* Coin icon */}
        <Animated.View style={[styles.coinContainer, coinStyle]}>
          <View style={styles.coinOuter}>
            <View style={styles.coinInner}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={18}
                color={COLORS.surface}
              />
            </View>
          </View>
        </Animated.View>

        {/* XP text */}
        <View style={styles.textContainer}>
          <Text style={styles.amountText}>+{amount}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>

        {/* Shimmer overlay */}
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>

      {/* Sparkles */}
      <View style={[styles.sparkle, styles.sparkleTopRight]}>
        <MaterialCommunityIcons
          name="star-four-points"
          size={10}
          color={COLORS.xpGold}
        />
      </View>
      <View style={[styles.sparkle, styles.sparkleTopLeft]}>
        <MaterialCommunityIcons
          name="star-four-points"
          size={8}
          color={COLORS.secondary}
        />
      </View>
      <View style={[styles.sparkle, styles.sparkleBottom]}>
        <MaterialCommunityIcons
          name="star-four-points"
          size={6}
          color={COLORS.xpGold}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowOuter: {
    position: "absolute",
    width: 120,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.xpGold + "15",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.xpGold,
    shadowColor: COLORS.xpGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
    gap: SPACING.sm,
  },
  coinContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  coinOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.xpGold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.xpGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  coinInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.streakOrange,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.xpGold + "80",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.xpGold,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.streakOrange,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: BORDER_RADIUS.full,
  },
  sparkle: {
    position: "absolute",
  },
  sparkleTopRight: {
    top: -4,
    right: -2,
  },
  sparkleTopLeft: {
    top: -2,
    left: 2,
  },
  sparkleBottom: {
    bottom: -2,
    right: 12,
  },
});
