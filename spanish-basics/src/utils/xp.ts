import { XP_PER_LEVEL } from "./constants";

/**
 * Calculates the player's level from total XP.
 * Level 1 starts at 0 XP. Each level requires XP_PER_LEVEL (200) XP.
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

/**
 * Returns progress info toward the next level.
 * - current: XP earned within the current level
 * - needed: total XP required to reach the next level
 * - progress: fraction from 0 to 1
 */
export function xpForNextLevel(currentXP: number): {
  current: number;
  needed: number;
  progress: number;
} {
  const current = currentXP % XP_PER_LEVEL;
  const needed = XP_PER_LEVEL;
  const progress = current / needed;
  return { current, needed, progress };
}

const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 20, title: "Maestro" },
  { minLevel: 15, title: "Sabio" },
  { minLevel: 12, title: "Embajador" },
  { minLevel: 10, title: "Conquistador" },
  { minLevel: 8, title: "Explorador" },
  { minLevel: 6, title: "Aventurero" },
  { minLevel: 4, title: "Viajero" },
  { minLevel: 3, title: "Estudiante" },
  { minLevel: 2, title: "Aprendiz" },
  { minLevel: 1, title: "Principiante" },
];

/**
 * Returns a fun Spanish title based on the player's level.
 */
export function getLevelTitle(level: number): string {
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.minLevel) {
      return entry.title;
    }
  }
  return "Principiante";
}
