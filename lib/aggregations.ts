import { WorkoutEntry, Category, CATEGORIES, WeeklyData, MonthlyData, MuscleBalance } from "./types";
import { startOfWeek, format, parseISO, subDays, parse, isValid } from "date-fns";

// ISO week key: "2024-W01"
function getWeekKey(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-'W'ww");
}

function getWeekLabel(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "MMM d");
}

function getMonthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

function getMonthLabel(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), "MMM yyyy");
}

function parseEntryDate(dateStr: string): Date | null {
  const raw = dateStr.trim();
  if (!raw) return null;

  const iso = parseISO(raw);
  if (isValid(iso)) return iso;

  const withoutWeekday = raw.includes(",") ? raw.split(",").slice(1).join(",").trim() : raw;
  const candidates = [raw, withoutWeekday];
  const patterns = [
    "yyyy-MM-dd",
    "dd.MM.yyyy",
    "d.M.yyyy",
    "EEEE, dd.MM.yyyy",
    "EEEE, d.M.yyyy",
    "EEE, dd.MM.yyyy",
    "EEE, d.M.yyyy",
  ];

  for (const candidate of candidates) {
    for (const pattern of patterns) {
      const parsed = parse(candidate, pattern, new Date());
      if (isValid(parsed)) return parsed;
    }
  }

  const native = new Date(raw);
  return Number.isNaN(native.getTime()) ? null : native;
}

export function getWeeklyData(entries: WorkoutEntry[], numWeeks = 12): WeeklyData[] {
  const weekMap = new Map<string, WeeklyData>();

  for (const entry of entries) {
    const date = parseEntryDate(entry.date);
    if (!date) continue;

    const key = getWeekKey(date);
    if (!weekMap.has(key)) {
      weekMap.set(key, {
        week: key,
        weekLabel: getWeekLabel(date),
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
    const date = parseEntryDate(entry.date);
    if (!date) continue;

    const key = getMonthKey(date);
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
    const date = parseEntryDate(entry.date);
    if (!date) continue;

    if (date >= cutoff) {
      totals[entry.category] += entry.score;
    }
  }

  return CATEGORIES.map((cat) => ({ category: cat, score: Math.round(totals[cat]) }));
}

export function getExerciseHistory(entries: WorkoutEntry[], exerciseName: string) {
  const parsed = entries
    .filter((e) => e.exerciseName.toLowerCase() === exerciseName.toLowerCase())
    .map((e) => ({ entry: e, date: parseEntryDate(e.date) }))
    .filter((x): x is { entry: WorkoutEntry; date: Date } => x.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (parsed.length > 0) {
    return parsed.map(({ entry, date }) => ({
      date: entry.date,
      dateLabel: format(date, "MMM d"),
      score: entry.score,
      weight: entry.weightMult,
      reps: entry.effectiveReps,
      sets: entry.setsIntensity,
    }));
  }

  return entries
    .filter((e) => e.exerciseName.toLowerCase() === exerciseName.toLowerCase())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: e.date,
      dateLabel: e.date,
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
    const date = parseEntryDate(entry.date);
    if (!date) continue;

    const key = format(date, "yyyy-MM-dd");
    map.set(key, (map.get(key) ?? 0) + entry.score);
  }
  return map;
}

export function getRecentEntries(entries: WorkoutEntry[], days = 7): WorkoutEntry[] {
  const cutoff = subDays(new Date(), days);
  return entries
    .map((e) => ({ entry: e, date: parseEntryDate(e.date) }))
    .filter((x): x is { entry: WorkoutEntry; date: Date } => x.date !== null && x.date >= cutoff)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((x) => x.entry);
}

export function getAllExerciseNames(entries: WorkoutEntry[]): string[] {
  const names = new Set(entries.map((e) => e.exerciseName));
  return Array.from(names).sort();
}
