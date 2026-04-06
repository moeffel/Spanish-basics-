import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LESSONS } from "../../src/data/lessons";
import { PronunciationPlayer } from "../../src/components/PronunciationPlayer";
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from "../../src/utils/constants";
import type { VocabularyItem } from "../../src/types";

export default function PronunciationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedItem, setSelectedItem] = useState<VocabularyItem | null>(null);

  const lesson = LESSONS.find((l) => l.id === id);

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text>Lektion nicht gefunden</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `${lesson.title} - Aussprache` }} />
      <View style={styles.container}>
        {/* Selected Word Player */}
        {selectedItem ? (
          <View style={styles.playerSection}>
            <PronunciationPlayer
              word={selectedItem.spanish}
              pronunciation={selectedItem.pronunciation}
            />
            <Text style={styles.germanTranslation}>{selectedItem.german}</Text>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>Beispielsatz:</Text>
              <Text style={styles.exampleSpanish}>{selectedItem.example}</Text>
              <Text style={styles.exampleGerman}>{selectedItem.exampleTranslation}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderSection}>
            <MaterialCommunityIcons name="volume-high" size={48} color={COLORS.textLight} />
            <Text style={styles.placeholderText}>
              Wähle ein Wort aus der Liste, um die Aussprache zu hören
            </Text>
          </View>
        )}

        {/* Word List */}
        <Text style={styles.listTitle}>Wörter ({lesson.vocabulary.length})</Text>
        <FlatList
          data={lesson.vocabulary}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.wordCard,
                selectedItem?.id === item.id && styles.wordCardActive,
              ]}
              onPress={() => setSelectedItem(item)}
            >
              <View style={styles.wordInfo}>
                <Text style={styles.wordSpanish}>{item.spanish}</Text>
                <Text style={styles.wordPronunciation}>[{item.pronunciation}]</Text>
              </View>
              <Text style={styles.wordGerman}>{item.german}</Text>
              <MaterialCommunityIcons
                name={selectedItem?.id === item.id ? "volume-high" : "play-circle-outline"}
                size={24}
                color={selectedItem?.id === item.id ? COLORS.primary : COLORS.textLight}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  playerSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  germanTranslation: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  exampleBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    width: "100%",
  },
  exampleLabel: { ...FONTS.caption, color: COLORS.textLight, marginBottom: 4 },
  exampleSpanish: { ...FONTS.bodyBold, color: COLORS.primary },
  exampleGerman: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 },
  placeholderSection: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    minHeight: 160,
  },
  placeholderText: {
    ...FONTS.body,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: SPACING.md,
  },
  listTitle: {
    ...FONTS.bodyBold,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  wordCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  wordCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "08",
  },
  wordInfo: { flex: 1 },
  wordSpanish: { ...FONTS.bodyBold, color: COLORS.text },
  wordPronunciation: { ...FONTS.caption, color: COLORS.textSecondary },
  wordGerman: { ...FONTS.body, color: COLORS.textSecondary, marginRight: SPACING.sm },
});
