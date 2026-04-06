import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  FadeIn,
} from "react-native-reanimated";
import * as Speech from "expo-speech";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";

interface PronunciationPlayerProps {
  word: string;
  pronunciation: string;
}

export function PronunciationPlayer({
  word,
  pronunciation,
}: PronunciationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const pulseScale = useSharedValue(1);

  const startPulse = useCallback(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      true
    );
  }, [pulseScale]);

  const stopPulse = useCallback(() => {
    cancelAnimation(pulseScale);
    pulseScale.value = withTiming(1, { duration: 200 });
  }, [pulseScale]);

  const speak = useCallback(
    (rate: number) => {
      Speech.stop();
      setIsPlaying(true);
      startPulse();

      Speech.speak(word, {
        language: "es-ES",
        rate,
        onDone: () => {
          setIsPlaying(false);
          stopPulse();
        },
        onError: () => {
          setIsPlaying(false);
          stopPulse();
        },
      });
    },
    [word, startPulse, stopPulse]
  );

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      stopPulse();
      return;
    }
    speak(isSlowMode ? 0.5 : 1.0);
  }, [isPlaying, isSlowMode, speak, stopPulse]);

  const handleSlowMode = useCallback(() => {
    const newSlowMode = !isSlowMode;
    setIsSlowMode(newSlowMode);
    if (isPlaying) {
      Speech.stop();
      speak(newSlowMode ? 0.5 : 1.0);
    }
  }, [isSlowMode, isPlaying, speak]);

  const handleRepeat = useCallback(() => {
    speak(isSlowMode ? 0.5 : 1.0);
  }, [isSlowMode, speak]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const syllables = pronunciation
    .replace(/[\[\]]/g, "")
    .split(/[-.]/)
    .filter((s) => s.trim().length > 0);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {/* Word display */}
      <Text style={styles.wordText}>{word}</Text>

      {/* Pronunciation guide */}
      <View style={styles.pronunciationRow}>
        <MaterialCommunityIcons
          name="microphone"
          size={18}
          color={COLORS.textSecondary}
        />
        <Text style={styles.pronunciationText}>[{pronunciation}]</Text>
      </View>

      {/* Syllable breakdown */}
      {syllables.length > 1 && (
        <View style={styles.syllableContainer}>
          <Text style={styles.syllableLabel}>Silben:</Text>
          <View style={styles.syllableRow}>
            {syllables.map((syllable, index) => (
              <View key={`syllable-${index}`} style={styles.syllableChip}>
                <Text style={styles.syllableText}>{syllable.trim()}</Text>
                {index < syllables.length - 1 && (
                  <Text style={styles.syllableSeparator}>-</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsRow}>
        {/* Slow mode */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.controlButtonSecondary,
            isSlowMode && styles.controlButtonActive,
          ]}
          onPress={handleSlowMode}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="speedometer-slow"
            size={22}
            color={isSlowMode ? COLORS.surface : COLORS.primary}
          />
          <Text
            style={[
              styles.controlButtonText,
              styles.controlButtonTextSecondary,
              isSlowMode && styles.controlButtonTextActive,
            ]}
          >
            Langsam
          </Text>
        </TouchableOpacity>

        {/* Play button */}
        <Animated.View style={pulseStyle}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handlePlay}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isPlaying ? "stop" : "play"}
              size={36}
              color={COLORS.surface}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Repeat button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.controlButtonSecondary]}
          onPress={handleRepeat}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="repeat"
            size={22}
            color={COLORS.primary}
          />
          <Text
            style={[
              styles.controlButtonText,
              styles.controlButtonTextSecondary,
            ]}
          >
            Nochmal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Speed indicator */}
      <View style={styles.speedIndicator}>
        <MaterialCommunityIcons
          name="speedometer"
          size={14}
          color={COLORS.textLight}
        />
        <Text style={styles.speedText}>
          Geschwindigkeit: {isSlowMode ? "0.5x" : "1.0x"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginHorizontal: SPACING.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  wordText: {
    fontSize: 42,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  pronunciationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  pronunciationText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  syllableContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  syllableLabel: {
    ...FONTS.caption,
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  syllableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  syllableChip: {
    flexDirection: "row",
    alignItems: "center",
  },
  syllableText: {
    ...FONTS.spanish,
    color: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary + "10",
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
  },
  syllableSeparator: {
    ...FONTS.subtitle,
    color: COLORS.textLight,
    marginHorizontal: SPACING.xs,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonActive: {
    backgroundColor: COLORS.error,
    shadowColor: COLORS.error,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  controlButtonSecondary: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary + "30",
    backgroundColor: COLORS.primary + "08",
  },
  controlButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  controlButtonText: {
    fontSize: 10,
    fontWeight: "600",
  },
  controlButtonTextSecondary: {
    color: COLORS.primary,
  },
  controlButtonTextActive: {
    color: COLORS.surface,
  },
  speedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  speedText: {
    ...FONTS.caption,
    color: COLORS.textLight,
  },
});
