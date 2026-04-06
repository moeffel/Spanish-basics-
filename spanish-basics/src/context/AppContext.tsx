import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { FlashcardProgress, UserProgress } from "../types";
import { useStorage } from "../hooks/useStorage";
import { calculateLevel } from "../utils/xp";
import { processAnswer } from "../utils/spaced-repetition";

// --- Default values ---

const DEFAULT_USER_PROGRESS: UserProgress = {
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: "",
  completedLessons: [],
  level: 1,
};

const DEFAULT_CARD_PROGRESS: FlashcardProgress[] = [];
const DEFAULT_COMPLETED_EXERCISES: string[] = [];

// --- Context types ---

interface AppState {
  userProgress: UserProgress;
  cardProgress: FlashcardProgress[];
  completedExercises: string[];
  isLoading: boolean;
}

interface AppActions {
  addXP: (amount: number) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  updateCardProgress: (
    vocabularyId: string,
    correct: boolean
  ) => Promise<void>;
  updateStreak: () => Promise<void>;
  resetProgress: () => Promise<void>;
}

type AppContextValue = AppState & AppActions;

const AppContext = createContext<AppContextValue | null>(null);

// --- Helper functions ---

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

// --- Provider ---

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userProgress, setUserProgress, userLoading] = useStorage<UserProgress>(
    "user_progress",
    DEFAULT_USER_PROGRESS
  );

  const [cardProgress, setCardProgress, cardsLoading] = useStorage<
    FlashcardProgress[]
  >("card_progress", DEFAULT_CARD_PROGRESS);

  const [completedExercises, setCompletedExercises, exercisesLoading] =
    useStorage<string[]>("completed_exercises", DEFAULT_COMPLETED_EXERCISES);

  const isLoading = userLoading || cardsLoading || exercisesLoading;

  // Check streak on mount (once data is loaded)
  useEffect(() => {
    if (isLoading) return;
    if (userProgress.lastPracticeDate === "") return;

    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    const lastDate = userProgress.lastPracticeDate;

    // If the last practice was before yesterday, the streak is broken
    if (lastDate !== today && lastDate !== yesterday) {
      if (userProgress.currentStreak > 0) {
        setUserProgress({
          ...userProgress,
          currentStreak: 0,
        });
      }
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const addXP = useCallback(
    async (amount: number) => {
      const newTotalXP = userProgress.totalXP + amount;
      const newLevel = calculateLevel(newTotalXP);
      await setUserProgress({
        ...userProgress,
        totalXP: newTotalXP,
        level: newLevel,
      });
    },
    [userProgress, setUserProgress]
  );

  const completeLesson = useCallback(
    async (lessonId: string) => {
      if (userProgress.completedLessons.includes(lessonId)) return;

      const newCompletedLessons = [...userProgress.completedLessons, lessonId];
      const newTotalXP = userProgress.totalXP + 50; // XP_PER_LESSON_COMPLETE
      const newLevel = calculateLevel(newTotalXP);

      await setUserProgress({
        ...userProgress,
        completedLessons: newCompletedLessons,
        totalXP: newTotalXP,
        level: newLevel,
      });
    },
    [userProgress, setUserProgress]
  );

  const updateCardProgress = useCallback(
    async (vocabularyId: string, correct: boolean) => {
      const existingIndex = cardProgress.findIndex(
        (c) => c.vocabularyId === vocabularyId
      );

      let updatedCards: FlashcardProgress[];

      if (existingIndex >= 0) {
        const existing = cardProgress[existingIndex];
        const updated = processAnswer(existing, correct);
        updatedCards = [...cardProgress];
        updatedCards[existingIndex] = updated;
      } else {
        // Card not tracked yet: create it at box 1 and process the answer
        const fresh: FlashcardProgress = {
          vocabularyId,
          box: 1,
          nextReview: Date.now(),
          correctCount: 0,
          incorrectCount: 0,
        };
        const updated = processAnswer(fresh, correct);
        updatedCards = [...cardProgress, updated];
      }

      await setCardProgress(updatedCards);
    },
    [cardProgress, setCardProgress]
  );

  const updateStreak = useCallback(async () => {
    const today = getTodayDateString();

    if (userProgress.lastPracticeDate === today) {
      // Already practiced today, nothing to update
      return;
    }

    const yesterday = getYesterdayDateString();
    const lastDate = userProgress.lastPracticeDate;

    let newStreak: number;
    if (lastDate === yesterday || lastDate === "") {
      // Continuing streak (or first ever practice)
      newStreak = userProgress.currentStreak + 1;
    } else {
      // Streak was broken, start fresh
      newStreak = 1;
    }

    const newLongest = Math.max(userProgress.longestStreak, newStreak);

    await setUserProgress({
      ...userProgress,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastPracticeDate: today,
    });
  }, [userProgress, setUserProgress]);

  const resetProgress = useCallback(async () => {
    await setUserProgress(DEFAULT_USER_PROGRESS);
    await setCardProgress(DEFAULT_CARD_PROGRESS);
    await setCompletedExercises(DEFAULT_COMPLETED_EXERCISES);
  }, [setUserProgress, setCardProgress, setCompletedExercises]);

  const value = useMemo<AppContextValue>(
    () => ({
      userProgress,
      cardProgress,
      completedExercises,
      isLoading,
      addXP,
      completeLesson,
      updateCardProgress,
      updateStreak,
      resetProgress,
    }),
    [
      userProgress,
      cardProgress,
      completedExercises,
      isLoading,
      addXP,
      completeLesson,
      updateCardProgress,
      updateStreak,
      resetProgress,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to access the global app context.
 * Must be used within an AppProvider.
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

/** Alias for useAppContext */
export const useApp = useAppContext;
