import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../../src/context/AppContext";
import { LESSONS } from "../../src/data/lessons";
import { ProgressBar } from "../../src/components/ProgressBar";
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from "../../src/utils/constants";
import type { Lesson } from "../../src/types";

export default function LessonsScreen() {
  const router = useRouter();
  const { userProgress } = useApp();

  const isLessonUnlocked = (lesson: Lesson) => {
    if (lesson.number === 1) return true;
    const prevLesson = LESSONS.find((l) => l.number === lesson.number - 1);
    return prevLesson ? userProgress.completedLessons.includes(prevLesson.id) : false;
  };

  const getLessonProgress = (lesson: Lesson) => {
    if (userProgress.completedLessons.includes(lesson.id)) return 1;
    return 0;
  };

  const renderLesson = ({ item }: { item: Lesson }) => {
    const unlocked = isLessonUnlocked(item);
    const progress = getLessonProgress(item);
    const completed = progress === 1;

    return (
      <TouchableOpacity
        style={[styles.lessonCard, !unlocked && styles.lockedCard]}
        onPress={() => unlocked && router.push(`/lesson/${item.id}`)}
        activeOpacity={unlocked ? 0.7 : 1}
      >
        <View style={[styles.iconContainer, { backgroundColor: unlocked ? item.color + "20" : "#F3F4F6" }]}>
          {unlocked ? (
            <MaterialCommunityIcons
              name={item.icon as any}
              size={28}
              color={item.color}
            />
          ) : (
            <MaterialCommunityIcons name="lock" size={28} color={COLORS.textLight} />
          )}
        </View>
        <View style={styles.lessonInfo}>
          <View style={styles.lessonHeader}>
            <Text style={[styles.lessonNumber, { color: unlocked ? item.color : COLORS.textLight }]}>
              Lektion {item.number}
            </Text>
            {completed && (
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
            )}
          </View>
          <Text style={[styles.lessonTitle, !unlocked && styles.lockedText]}>
            {item.title}
          </Text>
          <Text style={[styles.lessonSubtitle, !unlocked && styles.lockedText]}>
            {item.titleGerman}
          </Text>
          {unlocked && (
            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} color={item.color} height={4} />
              <Text style={styles.vocabCount}>
                {item.vocabulary.length} Vokabeln · {item.grammarExercises.length} Übungen
              </Text>
            </View>
          )}
        </View>
        <MaterialCommunityIcons
          name={unlocked ? "chevron-right" : "lock"}
          size={24}
          color={unlocked ? COLORS.textLight : COLORS.border}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Lektionen</Text>
        <Text style={styles.headerSubtitle}>
          {userProgress.completedLessons.length} von {LESSONS.length} abgeschlossen
        </Text>
      </View>
      <FlatList
        data={LESSONS}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerSection: { padding: SPACING.lg, paddingBottom: SPACING.sm },
  headerTitle: { ...FONTS.title, color: COLORS.text },
  headerSubtitle: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 },
  list: { padding: SPACING.lg, paddingTop: SPACING.sm },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedCard: { opacity: 0.6 },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonInfo: { flex: 1, marginLeft: SPACING.md },
  lessonHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lessonNumber: { ...FONTS.caption, fontWeight: "600" },
  lessonTitle: { ...FONTS.bodyBold, color: COLORS.text, marginTop: 2 },
  lessonSubtitle: { ...FONTS.caption, color: COLORS.textSecondary },
  lockedText: { color: COLORS.textLight },
  progressContainer: { marginTop: SPACING.xs },
  vocabCount: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4, fontSize: 11 },
});
