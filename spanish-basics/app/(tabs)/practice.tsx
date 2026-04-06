import { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../../src/context/AppContext";
import { LESSONS } from "../../src/data/lessons";
import { getDueCards } from "../../src/utils/spaced-repetition";
import { FlashCard } from "../../src/components/FlashCard";
import { XPBadge } from "../../src/components/XPBadge";
import { COLORS, SPACING, BORDER_RADIUS, FONTS, XP_PER_CORRECT } from "../../src/utils/constants";
import type { VocabularyItem } from "../../src/types";

export default function PracticeScreen() {
  const { userProgress, cardProgress, addXP, updateCardProgress, updateStreak } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Get all vocabulary from completed lessons (+ lesson 1 always available)
  const availableVocab: VocabularyItem[] = LESSONS.filter(
    (l) => l.number === 1 || userProgress.completedLessons.includes(l.id)
  ).flatMap((l) => l.vocabulary);

  // Get due cards, or if none due show all available
  const dueCardIds = getDueCards(cardProgress).map((c) => c.vocabularyId);
  const practiceItems =
    dueCardIds.length > 0
      ? availableVocab.filter((v) => dueCardIds.includes(v.id))
      : availableVocab;

  const currentItem = practiceItems[currentIndex];

  const handleAnswer = useCallback(
    (correct: boolean) => {
      setSessionTotal((t) => t + 1);
      if (correct) {
        setSessionCorrect((c) => c + 1);
        addXP(XP_PER_CORRECT);
        setShowXP(true);
        setTimeout(() => setShowXP(false), 1000);
      }
      updateCardProgress(currentItem.id, correct);
      updateStreak();

      setTimeout(() => {
        if (currentIndex < practiceItems.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          setSessionComplete(true);
        }
      }, 500);
    },
    [currentIndex, practiceItems.length, currentItem?.id]
  );

  const resetSession = () => {
    setCurrentIndex(0);
    setSessionCorrect(0);
    setSessionTotal(0);
    setSessionComplete(false);
  };

  if (availableVocab.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cards-outline" size={64} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>Noch keine Vokabeln</Text>
        <Text style={styles.emptyText}>
          Schließe zuerst eine Lektion ab, um Vokabeln zu üben!
        </Text>
      </View>
    );
  }

  if (sessionComplete) {
    const percentage = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultContent}>
        <MaterialCommunityIcons
          name={percentage >= 70 ? "trophy" : "emoticon-happy"}
          size={80}
          color={percentage >= 70 ? COLORS.xpGold : COLORS.info}
        />
        <Text style={styles.resultTitle}>
          {percentage >= 90 ? "Excelente!" : percentage >= 70 ? "Muy bien!" : "Buen intento!"}
        </Text>
        <Text style={styles.resultSubtitle}>Übung abgeschlossen</Text>

        <View style={styles.resultStats}>
          <View style={styles.resultStat}>
            <Text style={styles.resultStatNumber}>{sessionCorrect}</Text>
            <Text style={styles.resultStatLabel}>Richtig</Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultStat}>
            <Text style={styles.resultStatNumber}>{sessionTotal - sessionCorrect}</Text>
            <Text style={styles.resultStatLabel}>Falsch</Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultStat}>
            <Text style={styles.resultStatNumber}>{percentage}%</Text>
            <Text style={styles.resultStatLabel}>Quote</Text>
          </View>
        </View>

        <Text style={styles.resultXP}>+{sessionCorrect * XP_PER_CORRECT} XP verdient!</Text>

        <TouchableOpacity style={styles.retryButton} onPress={resetSession}>
          <MaterialCommunityIcons name="reload" size={20} color="#FFF" />
          <Text style={styles.retryButtonText}>Nochmal üben</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vokabeln üben</Text>
        <Text style={styles.counter}>
          {currentIndex + 1} / {practiceItems.length}
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / practiceItems.length) * 100}%` },
          ]}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="check" size={16} color={COLORS.success} />
          <Text style={[styles.statText, { color: COLORS.success }]}>{sessionCorrect}</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="close" size={16} color={COLORS.error} />
          <Text style={[styles.statText, { color: COLORS.error }]}>
            {sessionTotal - sessionCorrect}
          </Text>
        </View>
      </View>

      {/* FlashCard */}
      <View style={styles.cardContainer}>
        {currentItem && (
          <FlashCard
            key={currentItem.id}
            item={currentItem}
            onCorrect={() => handleAnswer(true)}
            onIncorrect={() => handleAnswer(false)}
          />
        )}
      </View>

      <XPBadge amount={XP_PER_CORRECT} visible={showXP} />

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Tippe zum Umdrehen · Wische rechts wenn richtig · Links wenn falsch
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerTitle: { ...FONTS.subtitle, color: COLORS.text },
  counter: { ...FONTS.bodyBold, color: COLORS.primary },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.lg,
    padding: SPACING.sm,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { ...FONTS.bodyBold },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  instructions: { padding: SPACING.lg, alignItems: "center" },
  instructionText: { ...FONTS.caption, color: COLORS.textLight, textAlign: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  emptyTitle: { ...FONTS.subtitle, color: COLORS.text, marginTop: SPACING.md },
  emptyText: { ...FONTS.body, color: COLORS.textSecondary, textAlign: "center", marginTop: SPACING.sm },
  resultContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  resultTitle: { ...FONTS.title, color: COLORS.text, marginTop: SPACING.lg },
  resultSubtitle: { ...FONTS.body, color: COLORS.textSecondary, marginTop: SPACING.xs },
  resultStats: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    width: "100%",
    justifyContent: "space-around",
  },
  resultStat: { alignItems: "center" },
  resultStatNumber: { ...FONTS.title, color: COLORS.text },
  resultStatLabel: { ...FONTS.caption, color: COLORS.textSecondary },
  resultDivider: { width: 1, backgroundColor: COLORS.border },
  resultXP: { ...FONTS.subtitle, color: COLORS.xpGold, marginTop: SPACING.lg },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  retryButtonText: { color: "#FFF", ...FONTS.bodyBold },
});
