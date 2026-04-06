import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { VocabularyItem } from "../types";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface FlashCardProps {
  item: VocabularyItem;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export function FlashCard({
  item,
  onCorrect,
  onIncorrect,
}: FlashCardProps) {
  const isFlipped = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotation = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const handleFlip = useCallback(() => {
    isFlipped.value = withTiming(isFlipped.value === 0 ? 1 : 0, {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isFlipped]);

  const handleSwipeComplete = useCallback(
    (direction: "left" | "right") => {
      if (direction === "right") {
        onCorrect();
      } else {
        onIncorrect();
      }
    },
    [onCorrect, onIncorrect]
  );

  const resetCard = useCallback(() => {
    translateX.value = withSpring(0, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
    cardRotation.value = withSpring(0, { damping: 15 });
  }, [translateX, translateY, cardRotation]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
      cardRotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-15, 0, 15]
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? "right" : "left";
        const targetX = direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
        translateX.value = withTiming(targetX, { duration: 300 });
        cardOpacity.value = withTiming(0, { duration: 300 });
        runOnJS(handleSwipeComplete)(direction);
      } else {
        runOnJS(resetCard)();
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleFlip)();
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${cardRotation.value}deg` },
    ],
    opacity: cardOpacity.value,
  }));

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(isFlipped.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden" as const,
      opacity: interpolate(isFlipped.value, [0, 0.5, 0.5, 1], [1, 1, 0, 0]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(isFlipped.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden" as const,
      opacity: interpolate(isFlipped.value, [0, 0.5, 0.5, 1], [0, 0, 1, 1]),
    };
  });

  const correctOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      "clamp"
    ),
  }));

  const incorrectOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      "clamp"
    ),
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        {/* Correct overlay */}
        <Animated.View style={[styles.overlay, styles.correctOverlay, correctOverlayStyle]}>
          <MaterialCommunityIcons name="check-circle" size={48} color={COLORS.success} />
          <Text style={styles.overlayTextCorrect}>Correcto!</Text>
        </Animated.View>

        {/* Incorrect overlay */}
        <Animated.View style={[styles.overlay, styles.incorrectOverlay, incorrectOverlayStyle]}>
          <MaterialCommunityIcons name="close-circle" size={48} color={COLORS.error} />
          <Text style={styles.overlayTextIncorrect}>Incorrecto</Text>
        </Animated.View>

        {/* Front side */}
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.spanishWord}>{item.spanish}</Text>
            <View style={styles.pronunciationRow}>
              <MaterialCommunityIcons
                name="volume-high"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.pronunciation}>[{item.pronunciation}]</Text>
            </View>
          </View>
          <View style={styles.flipHint}>
            <MaterialCommunityIcons name="rotate-3d-variant" size={18} color={COLORS.textLight} />
            <Text style={styles.flipHintText}>Tippen zum Umdrehen</Text>
          </View>
        </Animated.View>

        {/* Back side */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <View style={styles.cardContent}>
            <Text style={styles.germanTranslation}>{item.german}</Text>
            <View style={styles.divider} />
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleLabel}>Beispiel:</Text>
              <Text style={styles.exampleSpanish}>{item.example}</Text>
              <Text style={styles.exampleGerman}>{item.exampleTranslation}</Text>
            </View>
          </View>
          <View style={styles.swipeHints}>
            <View style={styles.swipeHintItem}>
              <MaterialCommunityIcons name="arrow-left" size={16} color={COLORS.error} />
              <Text style={[styles.swipeHintText, { color: COLORS.error }]}>Nochmal</Text>
            </View>
            <View style={styles.swipeHintItem}>
              <Text style={[styles.swipeHintText, { color: COLORS.success }]}>Gewusst</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={COLORS.success} />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH - SPACING.lg * 2,
    height: 400,
    alignSelf: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardFront: {
    backgroundColor: COLORS.surface,
  },
  cardBack: {
    backgroundColor: COLORS.surfaceAlt,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    ...FONTS.caption,
    color: COLORS.primary,
    fontWeight: "600",
  },
  spanishWord: {
    fontSize: 42,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  pronunciationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  pronunciation: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  germanTranslation: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.lg,
  },
  exampleContainer: {
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },
  exampleLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  exampleSpanish: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  exampleGerman: {
    ...FONTS.germanSmall,
    textAlign: "center",
  },
  flipHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  flipHintText: {
    ...FONTS.caption,
    color: COLORS.textLight,
  },
  swipeHints: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.sm,
  },
  swipeHintItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  swipeHintText: {
    ...FONTS.caption,
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    top: SPACING.lg,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
  },
  correctOverlay: {
    right: SPACING.lg,
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "15",
  },
  incorrectOverlay: {
    left: SPACING.lg,
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "15",
  },
  overlayTextCorrect: {
    ...FONTS.bodyBold,
    color: COLORS.success,
  },
  overlayTextIncorrect: {
    ...FONTS.bodyBold,
    color: COLORS.error,
  },
});
