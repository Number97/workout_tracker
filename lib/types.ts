export const CATEGORIES = ["Back", "Chest", "Shoulders", "Arms", "Legs", "Abs", "Cardio"] as const;
export type Category = typeof CATEGORIES[number];

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

export interface WeeklyData {
  week: string; // "2024-W01"
  weekLabel: string; // "Jan 1"
  Back: number;
  Chest: number;
  Shoulders: number;
  Arms: number;
  Legs: number;
  Abs: number;
  Cardio: number;
  total: number;
}

export interface MonthlyData {
  month: string; // "2024-01"
  monthLabel: string; // "Jan 2024"
  total: number;
}

export interface MuscleBalance {
  category: Category;
  score: number;
}
