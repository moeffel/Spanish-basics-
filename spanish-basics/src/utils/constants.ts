export const COLORS = {
  primary: "#C8102E", // Spanish red
  secondary: "#FABD00", // Spanish yellow
  accent: "#FF6B35",
  background: "#FFF8F0",
  surface: "#FFFFFF",
  surfaceAlt: "#FFF3E0",
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  border: "#E5E7EB",
  shadow: "#00000015",
  cardBg: "#FFFFFF",
  xpGold: "#FFD700",
  streakOrange: "#FF8C00",
};

export const FONTS = {
  title: { fontSize: 28, fontWeight: "700" as const },
  subtitle: { fontSize: 20, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  bodyBold: { fontSize: 16, fontWeight: "600" as const },
  caption: { fontSize: 13, fontWeight: "400" as const },
  spanish: { fontSize: 24, fontWeight: "700" as const },
  germanSmall: { fontSize: 14, fontWeight: "400" as const, color: "#6B7280" },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const XP_PER_CORRECT = 10;
export const XP_PER_LESSON_COMPLETE = 50;
export const XP_PER_LEVEL = 200;

export const LEITNER_INTERVALS = [0, 1, 3, 7, 14, 30]; // days per box
