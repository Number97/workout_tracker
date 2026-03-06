import {
  WorkoutEntry,
  Category,
  CATEGORIES,
  WeeklyData,
  MonthlyData,
  QuarterlyData,
  YearlyData,
  MuscleBalance,
  CategorySets,
  VolumeTotals,
} from "./types";
import { startOfWeek, format, parseISO, subDays, parse, isValid } from "date-fns";

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

function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

function getQuarterKey(date: Date): string {
  return `${format(date, "yyyy")}-Q${getQuarter(date)}`;
}

function getQuarterLabel(date: Date): string {
  return `Q${getQuarter(date)} ${format(date, "yyyy")}`;
}

function createEmptyTotals(): VolumeTotals {
  return {
    Back: 0,
    Chest: 0,
    Shoulders: 0,
    Arms: 0,
    Legs: 0,
    Abs: 0,
    Cardio: 0,
    BackSets: 0,
    ChestSets: 0,
    ShouldersSets: 0,
    ArmsSets: 0,
    LegsSets: 0,
    AbsSets: 0,
    CardioSets: 0,
    total: 0,
    totalSets: 0,
  };
}

const CATEGORY_SET_KEYS: Record<Category, keyof CategorySets> = {
  Back: "BackSets",
  Chest: "ChestSets",
  Shoulders: "ShouldersSets",
  Arms: "ArmsSets",
  Legs: "LegsSets",
  Abs: "AbsSets",
  Cardio: "CardioSets",
};

function addEntryToTotals(target: VolumeTotals, entry: WorkoutEntry): void {
  target[entry.category] += entry.score;
  target.total += entry.score;
  target[CATEGORY_SET_KEYS[entry.category]] += 1;
  target.totalSets += 1;
}

export function parseEntryDate(dateStr: string): Date | null {
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
        ...createEmptyTotals(),
      });
    }
    const week = weekMap.get(key)!;
    addEntryToTotals(week, entry);
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
      monthMap.set(key, {
        month: key,
        monthLabel: getMonthLabel(key),
        ...createEmptyTotals(),
      });
    }
    addEntryToTotals(monthMap.get(key)!, entry);
  }

  return Array.from(monthMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-numMonths);
}

export function getQuarterlyData(entries: WorkoutEntry[], numQuarters = 8): QuarterlyData[] {
  const quarterMap = new Map<string, QuarterlyData>();

  for (const entry of entries) {
    const date = parseEntryDate(entry.date);
    if (!date) continue;

    const key = getQuarterKey(date);
    if (!quarterMap.has(key)) {
      quarterMap.set(key, {
        quarter: key,
        quarterLabel: getQuarterLabel(date),
        ...createEmptyTotals(),
      });
    }
    addEntryToTotals(quarterMap.get(key)!, entry);
  }

  return Array.from(quarterMap.values())
    .sort((a, b) => a.quarter.localeCompare(b.quarter))
    .slice(-numQuarters);
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

export function getYearlyData(entries: WorkoutEntry[]): YearlyData[] {
  const yearMap = new Map<string, YearlyData>();

  for (const entry of entries) {
    const date = parseEntryDate(entry.date);
    if (!date) continue;

    const key = format(date, "yyyy");
    if (!yearMap.has(key)) {
      yearMap.set(key, { year: key, yearLabel: key, ...createEmptyTotals() });
    }
    addEntryToTotals(yearMap.get(key)!, entry);
  }

  return Array.from(yearMap.values()).sort((a, b) => a.year.localeCompare(b.year));
}

export function getAllExerciseNames(entries: WorkoutEntry[]): string[] {
  const names = new Set(entries.map((e) => e.exerciseName));
  return Array.from(names).sort();
}
