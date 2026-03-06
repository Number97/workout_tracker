"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, Category, WeeklyData, MonthlyData, QuarterlyData, YearlyData } from "@/lib/types";
import { CATEGORY_COLORS, TrendAreaChart, TrendPoint } from "@/components/TrendAreaChart";
import { cn } from "@/lib/utils";

interface Props {
  weekly26: WeeklyData[];
  monthly12: MonthlyData[];
  quarterly8: QuarterlyData[];
  yearlyAll: YearlyData[];
}

function toTrendPoint(label: string, data: WeeklyData | MonthlyData | QuarterlyData | YearlyData): TrendPoint {
  return {
    label,
    Back: data.Back,
    Chest: data.Chest,
    Shoulders: data.Shoulders,
    Arms: data.Arms,
    Legs: data.Legs,
    Abs: data.Abs,
    Cardio: data.Cardio,
    BackSets: data.BackSets,
    ChestSets: data.ChestSets,
    ShouldersSets: data.ShouldersSets,
    ArmsSets: data.ArmsSets,
    LegsSets: data.LegsSets,
    AbsSets: data.AbsSets,
    CardioSets: data.CardioSets,
    total: data.total,
    totalSets: data.totalSets,
  };
}

function ChartBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}

const WEEKLY_RANGES = [4, 8, 12, 26];
const MONTHLY_RANGES = [3, 6, 12];

function RangeChips({
  ranges,
  selected,
  suffix,
  onChange,
}: {
  ranges: number[];
  selected: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {ranges.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
            selected === r
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {r}{suffix}
        </button>
      ))}
    </div>
  );
}

export function DashboardTrends({ weekly26, monthly12, yearlyAll }: Props) {
  const [weeklyRange, setWeeklyRange] = useState(8);
  const [monthlyRange, setMonthlyRange] = useState(12);
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([...CATEGORIES]);

  const weeklyData = useMemo(
    () => weekly26.slice(-weeklyRange).map((r) => toTrendPoint(r.weekLabel, r)),
    [weekly26, weeklyRange]
  );
  const monthlyData = useMemo(
    () => monthly12.slice(-monthlyRange).map((r) => toTrendPoint(r.monthLabel, r)),
    [monthly12, monthlyRange]
  );
  const yearlyData = useMemo(
    () => yearlyAll.map((r) => toTrendPoint(r.yearLabel, r)),
    [yearlyAll]
  );

  const orderedVisible = CATEGORIES.filter((cat) => visibleCategories.includes(cat));

  function toggleCategory(cat: Category) {
    setVisibleCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== cat);
      }
      return [...prev, cat];
    });
  }

  function showOnly(cat: Category) {
    setVisibleCategories([cat]);
  }

  function showAll() {
    setVisibleCategories([...CATEGORIES]);
  }

  return (
    <div className="space-y-4">
      {/* Duration controls */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Weekly</span>
          <RangeChips
            ranges={WEEKLY_RANGES}
            selected={weeklyRange}
            suffix="w"
            onChange={setWeeklyRange}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Monthly</span>
          <RangeChips
            ranges={MONTHLY_RANGES}
            selected={monthlyRange}
            suffix="m"
            onChange={setMonthlyRange}
          />
        </div>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartBlock title="Weekly Score">
          <TrendAreaChart data={weeklyData} metric="score" visibleCategories={orderedVisible} />
        </ChartBlock>
        <ChartBlock title="Monthly Score">
          <TrendAreaChart data={monthlyData} metric="score" visibleCategories={orderedVisible} />
        </ChartBlock>
      </div>

      {/* Sets row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartBlock title="Weekly Sets">
          <TrendAreaChart data={weeklyData} metric="sets" visibleCategories={orderedVisible} />
        </ChartBlock>
        <ChartBlock title="Monthly Sets">
          <TrendAreaChart data={monthlyData} metric="sets" visibleCategories={orderedVisible} />
        </ChartBlock>
      </div>

      {/* Yearly row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartBlock title="Yearly Score">
          <TrendAreaChart data={yearlyData} metric="score" visibleCategories={orderedVisible} />
        </ChartBlock>
        <ChartBlock title="Yearly Sets">
          <TrendAreaChart data={yearlyData} metric="sets" visibleCategories={orderedVisible} />
        </ChartBlock>
      </div>

      {/* Category legend — below all charts */}
      <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
        <button
          type="button"
          onClick={showAll}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            visibleCategories.length === CATEGORIES.length
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const enabled = visibleCategories.includes(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              onDoubleClick={() => showOnly(cat)}
              title="Click to toggle · Double-click to isolate"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                enabled
                  ? "border-border/80 bg-card text-foreground"
                  : "border-border/30 bg-transparent text-muted-foreground/50"
              )}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: enabled ? CATEGORY_COLORS[cat] : "rgba(148,163,184,0.3)" }}
              />
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
