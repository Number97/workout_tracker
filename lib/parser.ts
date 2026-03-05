import { WorkoutEntry, Category, CATEGORIES } from "./types";

export interface ParsedLine {
  date: string;
  category: Category;
  exerciseName: string;
  repsText: string;
  setsText: string;
  weightText: string;
  effectiveReps: number;
  setsIntensity: number;
  weightMult: number;
  score: number;
  // raw values for display in preview
  raw: string[];
  error?: string;
}

export function parseTabSeparatedText(text: string): ParsedLine[] {
  const lines = text
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  return lines.map((line) => {
    const cols = line.split("\t");
    const raw = cols;

    if (cols.length < 9) {
      return {
        date: cols[0] ?? "",
        category: "Back" as Category,
        exerciseName: cols[2] ?? "",
        repsText: cols[3] ?? "",
        setsText: cols[4] ?? "",
        weightText: cols[5] ?? "",
        effectiveReps: 0,
        setsIntensity: 0,
        weightMult: 0,
        score: 0,
        raw,
        error: `Expected 9 columns, got ${cols.length}`,
      };
    }

    const [date, category, exerciseName, repsText, setsText, weightText, col7, col8, col9] = cols;
    const effectiveReps = parseFloat(col7) || 0;
    const setsIntensity = parseFloat(col8) || 0;
    const weightMult = parseFloat(col9) || 0;

    const normalizedCategory = CATEGORIES.includes(category?.trim() as Category)
      ? (category.trim() as Category)
      : undefined;

    return {
      date: date?.trim() ?? "",
      category: (normalizedCategory ?? "Back") as Category,
      exerciseName: exerciseName?.trim() ?? "",
      repsText: repsText?.trim() ?? "",
      setsText: setsText?.trim() ?? "",
      weightText: weightText?.trim() ?? "",
      effectiveReps,
      setsIntensity,
      weightMult,
      score: effectiveReps * setsIntensity * weightMult,
      raw,
      error: !normalizedCategory ? `Unknown category: "${category}"` : undefined,
    };
  });
}
