import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LESSONS } from "../../src/data/lessons";
import { useApp } from "../../src/context/AppContext";
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from "../../src/utils/constants";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userProgress } = useApp();

  const lesson = LESSONS.find((l) => l.id === id);
  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text>Lektion nicht gefunden</Text>
      </View>
    );
  }

  const isCompleted = userProgress.completedLessons.includes(lesson.id);

  return (
    <>
      <Stack.Screen
        options={{
          title: lesson.title,
          headerTintColor: lesson.color,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: lesson.color + "15" }]}>
          <MaterialCommunityIcons name={lesson.icon as any} size={64} color={lesson.color} />
          <Text style={styles.heroTitle}>{lesson.title}</Text>
          <Text style={styles.heroSubtitle}>{lesson.titleGerman}</Text>
          <Text style={styles.heroDesc}>{lesson.description}</Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.success} />
              <Text style={styles.completedText}>Abgeschlossen</Text>
            </View>
          )}
        </View>

        {/* Sections */}
        <Text style={styles.sectionTitle}>Was möchtest du üben?</Text>

        {/* Vocabulary */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => router.push(`/vocabulary/${lesson.id}`)}
        >
          <View style={[styles.sectionIcon, { backgroundColor: "#E6F7FF" }]}>
            <MaterialCommunityIcons name="cards" size={28} color={COLORS.info} />
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionCardTitle}>Vokabeln lernen</Text>
            <Text style={styles.sectionCardDesc}>
              {lesson.vocabulary.length} Wörter mit Karteikarten
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Grammar */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => router.push(`/grammar/${lesson.id}`)}
        >
          <View style={[styles.sectionIcon, { backgroundColor: "#E6FFE6" }]}>
            <MaterialCommunityIcons name="pencil" size={28} color={COLORS.success} />
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionCardTitle}>Grammatik üben</Text>
            <Text style={styles.sectionCardDesc}>
              {lesson.grammarExercises.length} Übungen
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Pronunciation */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => router.push(`/pronunciation/${lesson.id}`)}
        >
          <View style={[styles.sectionIcon, { backgroundColor: "#FFE6F0" }]}>
            <MaterialCommunityIcons name="volume-high" size={28} color="#EC4899" />
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionCardTitle}>Aussprache üben</Text>
            <Text style={styles.sectionCardDesc}>
              Höre und wiederhole alle Wörter
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Vocabulary Preview */}
        <Text style={styles.sectionTitle}>Vokabel-Vorschau</Text>
        <View style={styles.previewCard}>
          {lesson.vocabulary.slice(0, 4).map((vocab) => (
            <View key={vocab.id} style={styles.previewRow}>
              <Text style={styles.previewSpanish}>{vocab.spanish}</Text>
              <Text style={styles.previewGerman}>{vocab.german}</Text>
            </View>
          ))}
          {lesson.vocabulary.length > 4 && (
            <Text style={styles.previewMore}>
              +{lesson.vocabulary.length - 4} weitere Wörter
            </Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  hero: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  heroTitle: { ...FONTS.title, color: COLORS.text, marginTop: SPACING.md },
  heroSubtitle: { ...FONTS.body, color: COLORS.textSecondary, marginTop: 4 },
  heroDesc: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: "center" },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  completedText: { ...FONTS.caption, color: COLORS.success, fontWeight: "600" },
  sectionTitle: { ...FONTS.subtitle, color: COLORS.text, marginBottom: SPACING.md, marginTop: SPACING.sm },
  sectionCard: {
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
  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionInfo: { flex: 1, marginLeft: SPACING.md },
  sectionCardTitle: { ...FONTS.bodyBold, color: COLORS.text },
  sectionCardDesc: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewSpanish: { ...FONTS.bodyBold, color: COLORS.primary },
  previewGerman: { ...FONTS.body, color: COLORS.textSecondary },
  previewMore: { ...FONTS.caption, color: COLORS.info, textAlign: "center", marginTop: SPACING.sm },
});
