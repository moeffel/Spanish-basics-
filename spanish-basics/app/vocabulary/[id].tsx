import { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LESSONS } from "../../src/data/lessons";
import { useApp } from "../../src/context/AppContext";
import { FlashCard } from "../../src/components/FlashCard";
import { XPBadge } from "../../src/components/XPBadge";
import { COLORS, SPACING, BORDER_RADIUS, FONTS, XP_PER_CORRECT, XP_PER_LESSON_COMPLETE } from "../../src/utils/constants";

export default function VocabularyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addXP, updateCardProgress, updateStreak, completeLesson } = useApp();

  const lesson = LESSONS.find((l) => l.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [done, setDone] = useState(false);

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text>Lektion nicht gefunden</Text>
      </View>
    );
  }

  const vocab = lesson.vocabulary;
  const currentItem = vocab[currentIndex];

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      setTotal((t) => t + 1);
      if (isCorrect) {
        setCorrect((c) => c + 1);
        addXP(XP_PER_CORRECT);
        setShowXP(true);
        setTimeout(() => setShowXP(false), 800);
      }
      updateCardProgress(currentItem.id, isCorrect);
      updateStreak();

      setTimeout(() => {
        if (currentIndex < vocab.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          completeLesson(lesson.id);
          addXP(XP_PER_LESSON_COMPLETE);
          setDone(true);
        }
      }, 400);
    },
    [currentIndex, vocab.length, currentItem?.id, lesson.id]
  );

  if (done) {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <>
        <Stack.Screen options={{ title: lesson.title }} />
        <View style={styles.resultContainer}>
          <MaterialCommunityIcons
            name={pct >= 70 ? "trophy" : "star"}
            size={72}
            color={pct >= 70 ? COLORS.xpGold : COLORS.info}
          />
          <Text style={styles.resultTitle}>
            {pct >= 90 ? "Perfecto!" : pct >= 70 ? "Muy bien!" : "Sigue practicando!"}
          </Text>
          <Text style={styles.resultScore}>
            {correct} / {total} richtig ({pct}%)
          </Text>
          <Text style={styles.resultXP}>
            +{correct * XP_PER_CORRECT + XP_PER_LESSON_COMPLETE} XP
          </Text>

          <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
            <Text style={styles.btnText}>Zurück zur Lektion</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `${lesson.title} - Vokabeln` }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.counter}>
            {currentIndex + 1} / {vocab.length}
          </Text>
          <View style={styles.scoreRow}>
            <MaterialCommunityIcons name="check" size={16} color={COLORS.success} />
            <Text style={[styles.scoreText, { color: COLORS.success }]}>{correct}</Text>
            <MaterialCommunityIcons name="close" size={16} color={COLORS.error} />
            <Text style={[styles.scoreText, { color: COLORS.error }]}>{total - correct}</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${((currentIndex + 1) / vocab.length) * 100}%` }]}
          />
        </View>

        <View style={styles.cardArea}>
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

        <Text style={styles.hint}>Tippe zum Umdrehen · Wische zum Bewerten</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  counter: { ...FONTS.bodyBold, color: COLORS.primary },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  scoreText: { ...FONTS.bodyBold, marginRight: 8 },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
    borderRadius: 2,
  },
  progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACING.lg },
  hint: { ...FONTS.caption, color: COLORS.textLight, textAlign: "center", padding: SPACING.lg },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  resultTitle: { ...FONTS.title, color: COLORS.text, marginTop: SPACING.lg },
  resultScore: { ...FONTS.body, color: COLORS.textSecondary, marginTop: SPACING.sm },
  resultXP: { ...FONTS.subtitle, color: COLORS.xpGold, marginTop: SPACING.md },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xl,
  },
  btnText: { color: "#FFF", ...FONTS.bodyBold },
});
