import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Lesson } from "../types";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";

interface LessonCardProps {
  lesson: Lesson;
  progress: number;
  locked: boolean;
  onPress: () => void;
}

export function LessonCard({
  lesson,
  progress,
  locked,
  onPress,
}: LessonCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!locked) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(clampedProgress * 100);
  const isCompleted = clampedProgress >= 1;

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={animatedStyle}>
      <TouchableOpacity
        style={[styles.card, locked && styles.cardLocked]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={locked}
        activeOpacity={0.9}
      >
        {/* Icon section */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: locked
                ? COLORS.border
                : lesson.color + "20",
            },
          ]}
        >
          {locked ? (
            <MaterialCommunityIcons
              name="lock"
              size={28}
              color={COLORS.textLight}
            />
          ) : isCompleted ? (
            <MaterialCommunityIcons
              name="check-circle"
              size={28}
              color={COLORS.success}
            />
          ) : (
            <MaterialCommunityIcons
              name={lesson.icon as any}
              size={28}
              color={lesson.color}
            />
          )}
        </View>

        {/* Text section */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, locked && styles.titleLocked]}
              numberOfLines={1}
            >
              {lesson.title}
            </Text>
            {isCompleted && !locked && (
              <View style={styles.completedBadge}>
                <MaterialCommunityIcons
                  name="star"
                  size={12}
                  color={COLORS.xpGold}
                />
              </View>
            )}
          </View>
          <Text
            style={[styles.subtitle, locked && styles.subtitleLocked]}
            numberOfLines={1}
          >
            {lesson.titleGerman}
          </Text>

          {/* Progress bar (only when unlocked) */}
          {!locked && (
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%` as any,
                      backgroundColor: isCompleted
                        ? COLORS.success
                        : lesson.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{percentage}%</Text>
            </View>
          )}

          {locked && (
            <Text style={styles.lockedText}>
              Schließe vorherige Lektion ab
            </Text>
          )}
        </View>

        {/* Arrow / Lock indicator */}
        <View style={styles.arrowContainer}>
          {locked ? (
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={COLORS.textLight}
            />
          ) : (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.textSecondary}
            />
          )}
        </View>

        {/* Lesson number badge */}
        <View
          style={[
            styles.numberBadge,
            {
              backgroundColor: locked ? COLORS.border : lesson.color,
            },
          ]}
        >
          <Text style={styles.numberText}>{lesson.number}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  cardLocked: {
    backgroundColor: COLORS.background,
    opacity: 0.75,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  title: {
    ...FONTS.bodyBold,
    color: COLORS.text,
    flex: 1,
  },
  titleLocked: {
    color: COLORS.textLight,
  },
  subtitle: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subtitleLocked: {
    color: COLORS.textLight,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.xpGold + "25",
    alignItems: "center",
    justifyContent: "center",
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    ...FONTS.caption,
    fontWeight: "700",
    color: COLORS.textSecondary,
    minWidth: 32,
    textAlign: "right",
  },
  lockedText: {
    ...FONTS.caption,
    color: COLORS.textLight,
    fontStyle: "italic",
    marginTop: SPACING.xs,
  },
  arrowContainer: {
    paddingLeft: SPACING.xs,
  },
  numberBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.surface,
  },
});
