import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeInDown,
  SlideInRight,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GrammarExercise } from "../types";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface QuizCardProps {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean) => void;
}

type FeedbackState = "none" | "correct" | "incorrect";

export function QuizCard({ exercise, onAnswer }: QuizCardProps) {
  switch (exercise.type) {
    case "fill-blank":
      return <FillBlank exercise={exercise} onAnswer={onAnswer} />;
    case "multiple-choice":
      return <MultipleChoice exercise={exercise} onAnswer={onAnswer} />;
    case "reorder":
      return <Reorder exercise={exercise} onAnswer={onAnswer} />;
    default:
      return null;
  }
}

function FillBlank({
  exercise,
  onAnswer,
}: {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>("none");
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleSubmit = useCallback(() => {
    if (input.trim().length === 0) return;

    const isCorrect =
      input.trim().toLowerCase() === exercise.correctAnswer.toLowerCase();

    if (isCorrect) {
      setFeedback("correct");
      setTimeout(() => onAnswer(true), 1000);
    } else {
      setFeedback("incorrect");
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      setTimeout(() => onAnswer(false), 1500);
    }
  }, [input, exercise.correctAnswer, onAnswer, shakeX]);

  const questionParts = exercise.question.split("___");

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.cardContainer}
    >
      <View style={styles.typeTag}>
        <MaterialCommunityIcons
          name="form-textbox"
          size={16}
          color={COLORS.info}
        />
        <Text style={styles.typeTagText}>Lückentext</Text>
      </View>

      <Animated.View style={shakeStyle}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {questionParts[0]}
            <Text
              style={[
                styles.blankHighlight,
                feedback === "correct" && styles.blankCorrect,
                feedback === "incorrect" && styles.blankIncorrect,
              ]}
            >
              {input.length > 0 ? ` ${input} ` : " ___ "}
            </Text>
            {questionParts[1] || ""}
          </Text>
        </View>
      </Animated.View>

      {exercise.hint && feedback === "none" && (
        <View style={styles.hintContainer}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={16}
            color={COLORS.warning}
          />
          <Text style={styles.hintText}>{exercise.hint}</Text>
        </View>
      )}

      {feedback === "none" && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Antwort eingeben..."
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              input.trim().length === 0 && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={input.trim().length === 0}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={COLORS.surface}
            />
          </TouchableOpacity>
        </View>
      )}

      {feedback !== "none" && (
        <FeedbackBanner
          feedback={feedback}
          correctAnswer={exercise.correctAnswer}
        />
      )}
    </Animated.View>
  );
}

function MultipleChoice({
  exercise,
  onAnswer,
}: {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("none");

  const options = exercise.options || [];

  const handleSelect = useCallback(
    (index: number) => {
      if (feedback !== "none") return;
      setSelectedIndex(index);

      const isCorrect = options[index] === exercise.correctAnswer;
      if (isCorrect) {
        setFeedback("correct");
        setTimeout(() => onAnswer(true), 1000);
      } else {
        setFeedback("incorrect");
        setTimeout(() => onAnswer(false), 1500);
      }
    },
    [feedback, options, exercise.correctAnswer, onAnswer]
  );

  const getOptionStyle = useCallback(
    (index: number) => {
      if (feedback === "none" || selectedIndex === null) {
        return styles.optionDefault;
      }
      if (options[index] === exercise.correctAnswer) {
        return styles.optionCorrect;
      }
      if (index === selectedIndex && feedback === "incorrect") {
        return styles.optionIncorrect;
      }
      return styles.optionDefault;
    },
    [feedback, selectedIndex, options, exercise.correctAnswer]
  );

  const getOptionTextStyle = useCallback(
    (index: number) => {
      if (feedback === "none" || selectedIndex === null) {
        return styles.optionTextDefault;
      }
      if (options[index] === exercise.correctAnswer) {
        return styles.optionTextCorrect;
      }
      if (index === selectedIndex && feedback === "incorrect") {
        return styles.optionTextIncorrect;
      }
      return styles.optionTextDefault;
    },
    [feedback, selectedIndex, options, exercise.correctAnswer]
  );

  const getOptionIcon = useCallback(
    (index: number): string | null => {
      if (feedback === "none" || selectedIndex === null) return null;
      if (options[index] === exercise.correctAnswer) return "check-circle";
      if (index === selectedIndex && feedback === "incorrect")
        return "close-circle";
      return null;
    },
    [feedback, selectedIndex, options, exercise.correctAnswer]
  );

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.cardContainer}
    >
      <View style={styles.typeTag}>
        <MaterialCommunityIcons
          name="format-list-bulleted"
          size={16}
          color={COLORS.info}
        />
        <Text style={styles.typeTagText}>Multiple Choice</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{exercise.question}</Text>
      </View>

      {exercise.hint && feedback === "none" && (
        <View style={styles.hintContainer}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={16}
            color={COLORS.warning}
          />
          <Text style={styles.hintText}>{exercise.hint}</Text>
        </View>
      )}

      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const icon = getOptionIcon(index);
          return (
            <Animated.View
              key={`${exercise.id}-option-${index}`}
              entering={FadeInDown.delay(index * 80).duration(250)}
            >
              <TouchableOpacity
                style={[styles.optionButton, getOptionStyle(index)]}
                onPress={() => handleSelect(index)}
                disabled={feedback !== "none"}
                activeOpacity={0.7}
              >
                <View style={styles.optionLetterBadge}>
                  <Text style={styles.optionLetter}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  style={[styles.optionText, getOptionTextStyle(index)]}
                  numberOfLines={2}
                >
                  {option}
                </Text>
                {icon && (
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={22}
                    color={
                      icon === "check-circle" ? COLORS.success : COLORS.error
                    }
                    style={styles.optionIcon}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {feedback !== "none" && (
        <FeedbackBanner
          feedback={feedback}
          correctAnswer={exercise.correctAnswer}
        />
      )}
    </Animated.View>
  );
}

function Reorder({
  exercise,
  onAnswer,
}: {
  exercise: GrammarExercise;
  onAnswer: (correct: boolean) => void;
}) {
  const words = useMemo(
    () => exercise.words || exercise.correctAnswer.split(" "),
    [exercise.words, exercise.correctAnswer]
  );

  const [availableWords, setAvailableWords] = useState<string[]>(() => {
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>("none");

  const handleSelectWord = useCallback(
    (word: string, index: number) => {
      if (feedback !== "none") return;
      const newAvailable = [...availableWords];
      newAvailable.splice(index, 1);
      setAvailableWords(newAvailable);
      setSelectedWords((prev) => [...prev, word]);
    },
    [availableWords, feedback]
  );

  const handleRemoveWord = useCallback(
    (word: string, index: number) => {
      if (feedback !== "none") return;
      const newSelected = [...selectedWords];
      newSelected.splice(index, 1);
      setSelectedWords(newSelected);
      setAvailableWords((prev) => [...prev, word]);
    },
    [selectedWords, feedback]
  );

  const handleCheck = useCallback(() => {
    const answer = selectedWords.join(" ");
    const isCorrect = answer === exercise.correctAnswer;

    if (isCorrect) {
      setFeedback("correct");
      setTimeout(() => onAnswer(true), 1000);
    } else {
      setFeedback("incorrect");
      setTimeout(() => onAnswer(false), 1500);
    }
  }, [selectedWords, exercise.correctAnswer, onAnswer]);

  const allWordsSelected = availableWords.length === 0;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.cardContainer}
    >
      <View style={styles.typeTag}>
        <MaterialCommunityIcons
          name="swap-horizontal"
          size={16}
          color={COLORS.info}
        />
        <Text style={styles.typeTagText}>Wörter ordnen</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{exercise.question}</Text>
      </View>

      {exercise.hint && feedback === "none" && (
        <View style={styles.hintContainer}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={16}
            color={COLORS.warning}
          />
          <Text style={styles.hintText}>{exercise.hint}</Text>
        </View>
      )}

      {/* Answer area */}
      <View
        style={[
          styles.answerArea,
          feedback === "correct" && styles.answerAreaCorrect,
          feedback === "incorrect" && styles.answerAreaIncorrect,
        ]}
      >
        {selectedWords.length === 0 ? (
          <Text style={styles.answerPlaceholder}>
            Tippe auf die Wörter, um den Satz zu bilden
          </Text>
        ) : (
          <View style={styles.chipsRow}>
            {selectedWords.map((word, index) => (
              <Animated.View
                key={`selected-${index}-${word}`}
                entering={SlideInRight.duration(200)}
              >
                <TouchableOpacity
                  style={[
                    styles.chip,
                    styles.chipSelected,
                    feedback === "correct" && styles.chipCorrect,
                    feedback === "incorrect" && styles.chipIncorrect,
                  ]}
                  onPress={() => handleRemoveWord(word, index)}
                  disabled={feedback !== "none"}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      styles.chipTextSelected,
                      feedback === "correct" && styles.chipTextCorrect,
                      feedback === "incorrect" && styles.chipTextIncorrect,
                    ]}
                  >
                    {word}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </View>

      {/* Available words */}
      {feedback === "none" && (
        <View style={styles.chipsRow}>
          {availableWords.map((word, index) => (
            <Animated.View
              key={`available-${index}-${word}`}
              entering={FadeInDown.delay(index * 50).duration(200)}
            >
              <TouchableOpacity
                style={[styles.chip, styles.chipAvailable]}
                onPress={() => handleSelectWord(word, index)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, styles.chipTextAvailable]}>
                  {word}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Check button */}
      {feedback === "none" && allWordsSelected && (
        <Animated.View entering={FadeIn.duration(200)}>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleCheck}
            activeOpacity={0.7}
          >
            <Text style={styles.checkButtonText}>Überprüfen</Text>
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={COLORS.surface}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {feedback !== "none" && (
        <FeedbackBanner
          feedback={feedback}
          correctAnswer={exercise.correctAnswer}
        />
      )}
    </Animated.View>
  );
}

function FeedbackBanner({
  feedback,
  correctAnswer,
}: {
  feedback: FeedbackState;
  correctAnswer: string;
}) {
  if (feedback === "none") return null;

  const isCorrect = feedback === "correct";

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[
        styles.feedbackBanner,
        isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
      ]}
    >
      <View style={styles.feedbackHeader}>
        <MaterialCommunityIcons
          name={isCorrect ? "check-circle" : "close-circle"}
          size={24}
          color={isCorrect ? COLORS.success : COLORS.error}
        />
        <Text
          style={[
            styles.feedbackTitle,
            { color: isCorrect ? COLORS.success : COLORS.error },
          ]}
        >
          {isCorrect ? "Richtig!" : "Leider falsch"}
        </Text>
      </View>
      {!isCorrect && (
        <Text style={styles.feedbackAnswer}>
          Richtige Antwort:{" "}
          <Text style={styles.feedbackAnswerBold}>{correctAnswer}</Text>
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    alignSelf: "flex-start",
    backgroundColor: COLORS.info + "15",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  typeTagText: {
    ...FONTS.caption,
    color: COLORS.info,
    fontWeight: "600",
  },
  questionContainer: {
    marginBottom: SPACING.md,
  },
  questionText: {
    ...FONTS.subtitle,
    color: COLORS.text,
    lineHeight: 28,
  },
  blankHighlight: {
    backgroundColor: COLORS.secondary + "40",
    fontWeight: "700",
    color: COLORS.primary,
  },
  blankCorrect: {
    backgroundColor: COLORS.success + "30",
    color: COLORS.success,
  },
  blankIncorrect: {
    backgroundColor: COLORS.error + "30",
    color: COLORS.error,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.warning + "15",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  hintText: {
    ...FONTS.caption,
    color: COLORS.warning,
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
  },
  optionDefault: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "12",
  },
  optionIncorrect: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "12",
  },
  optionLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + "18",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  optionLetter: {
    ...FONTS.caption,
    fontWeight: "700",
    color: COLORS.primary,
  },
  optionText: {
    ...FONTS.body,
    flex: 1,
  },
  optionTextDefault: {
    color: COLORS.text,
  },
  optionTextCorrect: {
    color: COLORS.success,
    fontWeight: "600",
  },
  optionTextIncorrect: {
    color: COLORS.error,
    fontWeight: "600",
  },
  optionIcon: {
    marginLeft: SPACING.sm,
  },
  answerArea: {
    minHeight: 56,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    justifyContent: "center",
  },
  answerAreaCorrect: {
    borderColor: COLORS.success,
    borderStyle: "solid",
    backgroundColor: COLORS.success + "10",
  },
  answerAreaIncorrect: {
    borderColor: COLORS.error,
    borderStyle: "solid",
    backgroundColor: COLORS.error + "10",
  },
  answerPlaceholder: {
    ...FONTS.caption,
    color: COLORS.textLight,
    textAlign: "center",
    paddingVertical: SPACING.sm,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5,
  },
  chipAvailable: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary + "15",
    borderColor: COLORS.primary,
  },
  chipCorrect: {
    backgroundColor: COLORS.success + "15",
    borderColor: COLORS.success,
  },
  chipIncorrect: {
    backgroundColor: COLORS.error + "15",
    borderColor: COLORS.error,
  },
  chipText: {
    ...FONTS.body,
    fontWeight: "600",
  },
  chipTextAvailable: {
    color: COLORS.text,
  },
  chipTextSelected: {
    color: COLORS.primary,
  },
  chipTextCorrect: {
    color: COLORS.success,
  },
  chipTextIncorrect: {
    color: COLORS.error,
  },
  checkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  checkButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.surface,
  },
  feedbackBanner: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  feedbackCorrect: {
    backgroundColor: COLORS.success + "15",
  },
  feedbackIncorrect: {
    backgroundColor: COLORS.error + "15",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  feedbackTitle: {
    ...FONTS.bodyBold,
  },
  feedbackAnswer: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginLeft: 36,
  },
  feedbackAnswerBold: {
    fontWeight: "700",
    color: COLORS.text,
  },
});
