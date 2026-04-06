import { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LESSONS } from "../../src/data/lessons";
import { useApp } from "../../src/context/AppContext";
import { QuizCard } from "../../src/components/QuizCard";
import { XPBadge } from "../../src/components/XPBadge";
import { COLORS, SPACING, BORDER_RADIUS, FONTS, XP_PER_CORRECT } from "../../src/utils/constants";

export default function GrammarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addXP, updateStreak } = useApp();

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

  const exercises = lesson.grammarExercises;
  const currentExercise = exercises[currentIndex];

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      setTotal((t) => t + 1);
      if (isCorrect) {
        setCorrect((c) => c + 1);
        addXP(XP_PER_CORRECT);
        setShowXP(true);
        setTimeout(() => setShowXP(false), 800);
      }
      updateStreak();

      setTimeout(() => {
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          setDone(true);
        }
      }, 1200);
    },
    [currentIndex, exercises.length]
  );

  if (done) {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <>
        <Stack.Screen options={{ title: lesson.title }} />
        <View style={styles.resultContainer}>
          <MaterialCommunityIcons
            name={pct >= 70 ? "check-decagram" : "emoticon-neutral"}
            size={72}
            color={pct >= 70 ? COLORS.success : COLORS.warning}
          />
          <Text style={styles.resultTitle}>
            {pct >= 90 ? "Excelente!" : pct >= 70 ? "Bien hecho!" : "Sigue intentando!"}
          </Text>
          <Text style={styles.resultScore}>
            {correct} / {total} richtig ({pct}%)
          </Text>
          <Text style={styles.resultXP}>+{correct * XP_PER_CORRECT} XP</Text>

          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => {
                setCurrentIndex(0);
                setCorrect(0);
                setTotal(0);
                setDone(false);
              }}
            >
              <MaterialCommunityIcons name="reload" size={18} color={COLORS.primary} />
              <Text style={styles.btnSecondaryText}>Nochmal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
              <Text style={styles.btnText}>Zurück</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `${lesson.title} - Grammatik` }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.counter}>
            Übung {currentIndex + 1} / {exercises.length}
          </Text>
          <View style={styles.scoreRow}>
            <MaterialCommunityIcons name="check" size={16} color={COLORS.success} />
            <Text style={[styles.scoreText, { color: COLORS.success }]}>{correct}</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / exercises.length) * 100}%` },
            ]}
          />
        </View>

        <ScrollView style={styles.exerciseArea} contentContainerStyle={styles.exerciseContent}>
          {currentExercise && (
            <QuizCard
              key={currentExercise.id}
              exercise={currentExercise}
              onAnswer={handleAnswer}
            />
          )}
        </ScrollView>

        <XPBadge amount={XP_PER_CORRECT} visible={showXP} />
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
  scoreText: { ...FONTS.bodyBold },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
    borderRadius: 2,
  },
  progressFill: { height: 4, backgroundColor: COLORS.success, borderRadius: 2 },
  exerciseArea: { flex: 1 },
  exerciseContent: { padding: SPACING.lg },
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
  resultButtons: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xl },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnText: { color: "#FFF", ...FONTS.bodyBold },
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  btnSecondaryText: { color: COLORS.primary, ...FONTS.bodyBold },
});
