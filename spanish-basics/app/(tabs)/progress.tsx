import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../../src/context/AppContext";
import { LESSONS } from "../../src/data/lessons";
import { calculateLevel, xpForNextLevel, getLevelTitle } from "../../src/utils/xp";
import { ProgressBar } from "../../src/components/ProgressBar";
import { COLORS, SPACING, BORDER_RADIUS, FONTS, XP_PER_LEVEL } from "../../src/utils/constants";

export default function ProgressScreen() {
  const { userProgress, cardProgress } = useApp();

  const level = calculateLevel(userProgress.totalXP);
  const levelInfo = xpForNextLevel(userProgress.totalXP);
  const title = getLevelTitle(level);

  const totalVocab = LESSONS.reduce((sum, l) => sum + l.vocabulary.length, 0);
  const learnedVocab = cardProgress.filter((c) => c.box >= 3).length;
  const masteredVocab = cardProgress.filter((c) => c.box >= 5).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Dein Fortschritt</Text>

      {/* Level Overview */}
      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNum}>{level}</Text>
          </View>
          <View style={styles.levelDetails}>
            <Text style={styles.levelTitle}>{title}</Text>
            <Text style={styles.levelXP}>{userProgress.totalXP} XP gesamt</Text>
          </View>
        </View>
        <View style={styles.levelProgressSection}>
          <ProgressBar progress={levelInfo.progress} color={COLORS.xpGold} height={10} />
          <Text style={styles.levelProgressText}>
            {levelInfo.current} / {levelInfo.needed} XP bis Level {level + 1}
          </Text>
        </View>
      </View>

      {/* Streak Section */}
      <View style={styles.streakCard}>
        <MaterialCommunityIcons name="fire" size={40} color={COLORS.streakOrange} />
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{userProgress.currentStreak} Tage</Text>
          <Text style={styles.streakLabel}>Aktuelle Serie</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{userProgress.longestStreak} Tage</Text>
          <Text style={styles.streakLabel}>Rekord</Text>
        </View>
      </View>

      {/* Lessons Progress */}
      <Text style={styles.sectionTitle}>Lektionen</Text>
      <View style={styles.card}>
        <View style={styles.bigStatRow}>
          <View style={styles.bigStat}>
            <Text style={styles.bigStatNumber}>{userProgress.completedLessons.length}</Text>
            <Text style={styles.bigStatLabel}>Abgeschlossen</Text>
          </View>
          <View style={styles.bigStat}>
            <Text style={styles.bigStatNumber}>{LESSONS.length}</Text>
            <Text style={styles.bigStatLabel}>Gesamt</Text>
          </View>
        </View>
        <ProgressBar
          progress={userProgress.completedLessons.length / LESSONS.length}
          color={COLORS.success}
          height={8}
        />
        {LESSONS.map((lesson) => {
          const completed = userProgress.completedLessons.includes(lesson.id);
          return (
            <View key={lesson.id} style={styles.lessonRow}>
              <MaterialCommunityIcons
                name={completed ? "check-circle" : "circle-outline"}
                size={20}
                color={completed ? COLORS.success : COLORS.textLight}
              />
              <Text style={[styles.lessonName, completed && styles.completedText]}>
                {lesson.number}. {lesson.title}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Vocabulary Stats */}
      <Text style={styles.sectionTitle}>Vokabeln</Text>
      <View style={styles.card}>
        <View style={styles.vocabStats}>
          <View style={styles.vocabStat}>
            <MaterialCommunityIcons name="cards" size={24} color={COLORS.info} />
            <Text style={styles.vocabNumber}>{cardProgress.length}</Text>
            <Text style={styles.vocabLabel}>Geübt</Text>
          </View>
          <View style={styles.vocabStat}>
            <MaterialCommunityIcons name="school" size={24} color={COLORS.success} />
            <Text style={styles.vocabNumber}>{learnedVocab}</Text>
            <Text style={styles.vocabLabel}>Gelernt</Text>
          </View>
          <View style={styles.vocabStat}>
            <MaterialCommunityIcons name="star" size={24} color={COLORS.xpGold} />
            <Text style={styles.vocabNumber}>{masteredVocab}</Text>
            <Text style={styles.vocabLabel}>Gemeistert</Text>
          </View>
          <View style={styles.vocabStat}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color={COLORS.textLight} />
            <Text style={styles.vocabNumber}>{totalVocab}</Text>
            <Text style={styles.vocabLabel}>Gesamt</Text>
          </View>
        </View>
        <ProgressBar progress={learnedVocab / Math.max(totalVocab, 1)} color={COLORS.info} height={8} />
        <Text style={styles.vocabProgressText}>
          {learnedVocab} von {totalVocab} Vokabeln gelernt
        </Text>
      </View>

      {/* Leitner Box Distribution */}
      <Text style={styles.sectionTitle}>Karteikarten-Boxen</Text>
      <View style={styles.card}>
        {[1, 2, 3, 4, 5].map((box) => {
          const count = cardProgress.filter((c) => c.box === box).length;
          const total = Math.max(cardProgress.length, 1);
          const labels = ["Neu", "Lernen", "Wiederholen", "Gefestigt", "Gemeistert"];
          const boxColors = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981", "#FFD700"];
          return (
            <View key={box} style={styles.boxRow}>
              <View style={[styles.boxBadge, { backgroundColor: boxColors[box - 1] }]}>
                <Text style={styles.boxBadgeText}>{box}</Text>
              </View>
              <View style={styles.boxInfo}>
                <Text style={styles.boxLabel}>{labels[box - 1]}</Text>
                <View style={styles.boxBarBg}>
                  <View
                    style={[
                      styles.boxBarFill,
                      { width: `${(count / total) * 100}%`, backgroundColor: boxColors[box - 1] },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.boxCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  pageTitle: { ...FONTS.title, color: COLORS.text, marginBottom: SPACING.lg },
  sectionTitle: { ...FONTS.subtitle, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.md },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  levelRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  levelNum: { color: "#FFF", fontSize: 24, fontWeight: "800" },
  levelDetails: { marginLeft: SPACING.md },
  levelTitle: { ...FONTS.subtitle, color: COLORS.text },
  levelXP: { ...FONTS.body, color: COLORS.textSecondary },
  levelProgressSection: { marginTop: SPACING.sm },
  levelProgressText: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 6, textAlign: "right" },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: "#FFEDD5",
  },
  streakInfo: { flex: 1, alignItems: "center" },
  streakNumber: { ...FONTS.subtitle, color: COLORS.text },
  streakLabel: { ...FONTS.caption, color: COLORS.textSecondary },
  streakDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  bigStatRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: SPACING.md },
  bigStat: { alignItems: "center" },
  bigStatNumber: { fontSize: 32, fontWeight: "800", color: COLORS.text },
  bigStatLabel: { ...FONTS.caption, color: COLORS.textSecondary },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  lessonName: { ...FONTS.body, color: COLORS.text },
  completedText: { color: COLORS.success },
  vocabStats: { flexDirection: "row", justifyContent: "space-around", marginBottom: SPACING.md },
  vocabStat: { alignItems: "center" },
  vocabNumber: { ...FONTS.subtitle, color: COLORS.text, marginTop: 4 },
  vocabLabel: { ...FONTS.caption, color: COLORS.textSecondary },
  vocabProgressText: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 6, textAlign: "center" },
  boxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  boxBadge: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  boxBadgeText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  boxInfo: { flex: 1 },
  boxLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginBottom: 2 },
  boxBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  boxBarFill: { height: 6, borderRadius: 3, minWidth: 2 },
  boxCount: { ...FONTS.bodyBold, color: COLORS.text, width: 30, textAlign: "right" },
});
