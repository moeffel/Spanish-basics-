import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../../src/context/AppContext";
import { calculateLevel, xpForNextLevel, getLevelTitle } from "../../src/utils/xp";
import { ProgressBar } from "../../src/components/ProgressBar";
import StreakCounter from "../../src/components/StreakCounter";
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from "../../src/utils/constants";

export default function HomeScreen() {
  const router = useRouter();
  const { userProgress } = useApp();

  const level = calculateLevel(userProgress.totalXP);
  const levelProgress = xpForNextLevel(userProgress.totalXP);
  const title = getLevelTitle(level);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola! 👋</Text>
          <Text style={styles.subtitle}>Bereit Spanisch zu lernen?</Text>
        </View>
        <StreakCounter streak={userProgress.currentStreak} isActive={userProgress.currentStreak > 0} />
      </View>

      {/* Level Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{title}</Text>
            <Text style={styles.xpText}>{userProgress.totalXP} XP</Text>
          </View>
        </View>
        <ProgressBar progress={levelProgress.progress} color={COLORS.xpGold} height={8} />
        <Text style={styles.xpToNext}>
          {levelProgress.needed - levelProgress.current} XP bis Level {level + 1}
        </Text>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Schnellstart</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#FFF0E6" }]}
          onPress={() => router.push("/lessons")}
        >
          <MaterialCommunityIcons name="book-open-variant" size={32} color={COLORS.accent} />
          <Text style={styles.actionTitle}>Lektionen</Text>
          <Text style={styles.actionDesc}>Neue Themen lernen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#E6F7FF" }]}
          onPress={() => router.push("/practice")}
        >
          <MaterialCommunityIcons name="cards" size={32} color={COLORS.info} />
          <Text style={styles.actionTitle}>Vokabeln üben</Text>
          <Text style={styles.actionDesc}>Karteikarten</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#E6FFE6" }]}
          onPress={() => router.push("/lessons")}
        >
          <MaterialCommunityIcons name="pencil" size={32} color={COLORS.success} />
          <Text style={styles.actionTitle}>Grammatik</Text>
          <Text style={styles.actionDesc}>Übungen machen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#FFE6F0" }]}
          onPress={() => router.push("/progress")}
        >
          <MaterialCommunityIcons name="chart-line" size={32} color="#EC4899" />
          <Text style={styles.actionTitle}>Fortschritt</Text>
          <Text style={styles.actionDesc}>Statistiken</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <Text style={styles.sectionTitle}>Deine Statistik</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="fire" size={24} color={COLORS.streakOrange} />
          <Text style={styles.statNumber}>{userProgress.currentStreak}</Text>
          <Text style={styles.statLabel}>Tage Streak</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{userProgress.completedLessons.length}</Text>
          <Text style={styles.statLabel}>Lektionen</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="star" size={24} color={COLORS.xpGold} />
          <Text style={styles.statNumber}>{userProgress.totalXP}</Text>
          <Text style={styles.statLabel}>XP gesamt</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="trophy" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{userProgress.longestStreak}</Text>
          <Text style={styles.statLabel}>Rekord</Text>
        </View>
      </View>

      {/* Daily Tip */}
      <View style={styles.tipCard}>
        <MaterialCommunityIcons name="lightbulb-outline" size={24} color={COLORS.secondary} />
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Tipp des Tages</Text>
          <Text style={styles.tipText}>
            Übe jeden Tag nur 5 Minuten — regelmäßiges Lernen ist effektiver als lange Sitzungen!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  greeting: { ...FONTS.title, color: COLORS.text },
  subtitle: { ...FONTS.body, color: COLORS.textSecondary, marginTop: 2 },
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  levelHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  levelNumber: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  levelInfo: { marginLeft: SPACING.md },
  levelTitle: { ...FONTS.subtitle, color: COLORS.text },
  xpText: { ...FONTS.caption, color: COLORS.textSecondary },
  xpToNext: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: "right" },
  sectionTitle: { ...FONTS.subtitle, color: COLORS.text, marginBottom: SPACING.md },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  actionCard: {
    width: "48%",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: "flex-start",
  },
  actionTitle: { ...FONTS.bodyBold, color: COLORS.text, marginTop: SPACING.sm },
  actionDesc: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    justifyContent: "space-around",
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: { alignItems: "center" },
  statNumber: { ...FONTS.bodyBold, color: COLORS.text, marginTop: 4 },
  statLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  tipContent: { flex: 1, marginLeft: SPACING.md },
  tipTitle: { ...FONTS.bodyBold, color: COLORS.text },
  tipText: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
});
