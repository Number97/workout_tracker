export const CATEGORIES = ["Back", "Chest", "Shoulders", "Arms", "Legs", "Abs", "Cardio"] as const;
export type Category = typeof CATEGORIES[number];

export interface CategoryScores {
  Back: number;
  Chest: number;
  Shoulders: number;
  Arms: number;
  Legs: number;
  Abs: number;
  Cardio: number;
}

export interface CategorySets {
  BackSets: number;
  ChestSets: number;
  ShouldersSets: number;
  ArmsSets: number;
  LegsSets: number;
  AbsSets: number;
  CardioSets: number;
}

export interface VolumeTotals extends CategoryScores, CategorySets {
  total: number;
  totalSets: number;
}

export interface WorkoutEntry {
  // Row index in the sheet (1-based, includes header row offset)
  rowIndex: number;
  date: string;           // YYYY-MM-DD
  category: Category;
  exerciseName: string;
  repsText: string;       // col4
  setsText: string;       // col5
  weightText: string;     // col6
  effectiveReps: number;  // col7
  setsIntensity: number;  // col8
  weightMult: number;     // col9
  score: number;          // col7 * col8 * col9
}

export interface WeeklyData extends VolumeTotals {
  week: string;       // "2024-W01"
  weekLabel: string;  // "Jan 1"
}

export interface MonthlyData extends VolumeTotals {
  month: string;      // "2024-01"
  monthLabel: string; // "Jan 2024"
}

export interface QuarterlyData extends VolumeTotals {
  quarter: string;      // "2024-Q1"
  quarterLabel: string; // "Q1 2024"
}

export interface MuscleBalance {
  category: Category;
  score: number;
}
