import { FlashcardProgress } from "../types";
import { LEITNER_INTERVALS } from "./constants";

const MAX_BOX = 5;
const MIN_BOX = 1;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns the next review timestamp based on the Leitner box number.
 * Box 1 = review immediately (0 days), Box 2 = 1 day, Box 3 = 3 days, etc.
 */
export function getNextReviewDate(box: number): number {
  const clampedBox = Math.max(MIN_BOX, Math.min(box, MAX_BOX));
  const intervalDays = LEITNER_INTERVALS[clampedBox] ?? LEITNER_INTERVALS[MAX_BOX];
  return Date.now() + intervalDays * MS_PER_DAY;
}

/**
 * Processes an answer for a flashcard and returns updated progress.
 * Correct: move up one box (max 5). Incorrect: move back to box 1.
 */
export function processAnswer(
  progress: FlashcardProgress,
  correct: boolean
): FlashcardProgress {
  if (correct) {
    const newBox = Math.min(progress.box + 1, MAX_BOX);
    return {
      ...progress,
      box: newBox,
      nextReview: getNextReviewDate(newBox),
      correctCount: progress.correctCount + 1,
    };
  }

  return {
    ...progress,
    box: MIN_BOX,
    nextReview: getNextReviewDate(MIN_BOX),
    incorrectCount: progress.incorrectCount + 1,
  };
}

/**
 * Returns all cards that are due for review (nextReview <= now).
 * Cards are sorted so the most overdue cards come first.
 */
export function getDueCards(cards: FlashcardProgress[]): FlashcardProgress[] {
  const now = Date.now();
  return cards
    .filter((card) => card.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview);
}

/**
 * Creates initial progress for a new vocabulary card, starting in box 1
 * and immediately due for review.
 */
export function initializeProgress(vocabularyId: string): FlashcardProgress {
  return {
    vocabularyId,
    box: MIN_BOX,
    nextReview: Date.now(),
    correctCount: 0,
    incorrectCount: 0,
  };
}
