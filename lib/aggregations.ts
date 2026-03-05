import { WorkoutEntry, Category, CATEGORIES, WeeklyData, MonthlyData, MuscleBalance } from "./types";
import { startOfWeek, format, parseISO, isWithinInterval, subDays } from "date-fns";

// ISO week key: "2024-W01"
function getWeekKey(dateStr: string): string {
  const date = parseISO(dateStr);
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-'W'ww");
}

function getWeekLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "MMM d");
}

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // "2024-01"
}

function getMonthLabel(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), "MMM yyyy");
}

export function getWeeklyData(entries: WorkoutEntry[], numWeeks = 12): WeeklyData[] {
  const weekMap = new Map<string, WeeklyData>();

  for (const entry of entries) {
    const key = getWeekKey(entry.date);
    if (!weekMap.has(key)) {
      weekMap.set(key, {
        week: key,
        weekLabel: getWeekLabel(entry.date),
        Back: 0, Chest: 0, Shoulders: 0, Arms: 0, Legs: 0, Abs: 0, Cardio: 0,
        total: 0,
      });
    }
    const week = weekMap.get(key)!;
    week[entry.category] += entry.score;
    week.total += entry.score;
  }

  return Array.from(weekMap.values())
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-numWeeks);
}

export function getMonthlyData(entries: WorkoutEntry[], numMonths = 12): MonthlyData[] {
  const monthMap = new Map<string, MonthlyData>();

  for (const entry of entries) {
    const key = getMonthKey(entry.date);
    if (!monthMap.has(key)) {
      monthMap.set(key, { month: key, monthLabel: getMonthLabel(key), total: 0 });
    }
    monthMap.get(key)!.total += entry.score;
  }

  return Array.from(monthMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-numMonths);
}

export function getMuscleBalance(entries: WorkoutEntry[], days = 30): MuscleBalance[] {
  const cutoff = subDays(new Date(), days);

  const totals: Record<Category, number> = {
    Back: 0, Chest: 0, Shoulders: 0, Arms: 0, Legs: 0, Abs: 0, Cardio: 0,
  };

  for (const entry of entries) {
    const date = parseISO(entry.date);
    if (date >= cutoff) {
      totals[entry.category] += entry.score;
    }
  }

  return CATEGORIES.map((cat) => ({ category: cat, score: Math.round(totals[cat]) }));
}

export function getExerciseHistory(entries: WorkoutEntry[], exerciseName: string) {
  return entries
    .filter((e) => e.exerciseName.toLowerCase() === exerciseName.toLowerCase())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: e.date,
      dateLabel: format(parseISO(e.date), "MMM d"),
      score: e.score,
      weight: e.weightMult,
      reps: e.effectiveReps,
      sets: e.setsIntensity,
    }));
}

export function getPersonalRecords(entries: WorkoutEntry[], exerciseName: string) {
  const history = getExerciseHistory(entries, exerciseName);
  if (history.length === 0) return null;

  return {
    maxScore: Math.max(...history.map((h) => h.score)),
    maxWeight: Math.max(...history.map((h) => h.weight)),
    maxReps: Math.max(...history.map((h) => h.reps)),
    totalSessions: history.length,
  };
}

// Heatmap: map of date string → total score
export function getHeatmapData(entries: WorkoutEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of entries) {
    map.set(entry.date, (map.get(entry.date) ?? 0) + entry.score);
  }
  return map;
}

export function getRecentEntries(entries: WorkoutEntry[], days = 7): WorkoutEntry[] {
  const cutoff = subDays(new Date(), days);
  return entries
    .filter((e) => parseISO(e.date) >= cutoff)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllExerciseNames(entries: WorkoutEntry[]): string[] {
  const names = new Set(entries.map((e) => e.exerciseName));
  return Array.from(names).sort();
}
