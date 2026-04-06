export interface VocabularyItem {
  id: string;
  spanish: string;
  german: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
  category: string;
  lessonId: string;
}

export interface GrammarExercise {
  id: string;
  type: "fill-blank" | "multiple-choice" | "reorder";
  question: string;
  correctAnswer: string;
  options?: string[];
  words?: string[];
  hint?: string;
  lessonId: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  titleGerman: string;
  description: string;
  icon: string;
  color: string;
  vocabulary: VocabularyItem[];
  grammarExercises: GrammarExercise[];
}

export interface FlashcardProgress {
  vocabularyId: string;
  box: number; // Leitner box 1-5
  nextReview: number; // timestamp
  correctCount: number;
  incorrectCount: number;
}

export interface UserProgress {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  completedLessons: string[];
  level: number;
}

export type TabRoute = "index" | "lessons" | "practice" | "progress";
