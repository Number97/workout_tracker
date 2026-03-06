"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  Category,
  WeeklyData,
  MonthlyData,
  QuarterlyData,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATEGORY_COLORS, TrendAreaChart, TrendPoint } from "@/components/TrendAreaChart";
import { cn } from "@/lib/utils";

type Granularity = "weekly" | "monthly" | "quarterly";

const RANGE_OPTIONS: Record<Granularity, number[]> = {
  weekly: [8, 12, 26],
  monthly: [3, 6, 12],
  quarterly: [4, 8],
};

interface Props {
  weekly26: WeeklyData[];
  monthly12: MonthlyData[];
  quarterly8: QuarterlyData[];
}

function toTrendPoint(
  label: string,
  data: WeeklyData | MonthlyData | QuarterlyData
): TrendPoint {
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

function titleCase(value: Granularity): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function DashboardTrends({ weekly26, monthly12, quarterly8 }: Props) {
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const [rangeByGranularity, setRangeByGranularity] = useState<Record<Granularity, number>>({
    weekly: 8,
    monthly: 6,
    quarterly: 4,
  });
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([...CATEGORIES]);

  const datasets = useMemo(() => ({
    weekly: weekly26.map((row) => toTrendPoint(row.weekLabel, row)),
    monthly: monthly12.map((row) => toTrendPoint(row.monthLabel, row)),
    quarterly: quarterly8.map((row) => toTrendPoint(row.quarterLabel, row)),
  }), [weekly26, monthly12, quarterly8]);

  const selectedRange = rangeByGranularity[granularity];
  const selectedData = datasets[granularity].slice(-selectedRange);
  const orderedVisibleCategories = CATEGORIES.filter((cat) => visibleCategories.includes(cat));

  function toggleCategory(category: Category) {
    setVisibleCategories((prev) => {
      if (prev.includes(category)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  }

  function setRange(range: number) {
    setRangeByGranularity((prev) => ({ ...prev, [granularity]: range }));
  }

  function showOnlyCategory(category: Category) {
    setVisibleCategories([category]);
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/70 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Performance Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 bg-muted/30 p-2">
            {(["weekly", "monthly", "quarterly"] as const).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={granularity === mode ? "default" : "outline"}
                onClick={() => setGranularity(mode)}
                className="rounded-full"
              >
                {titleCase(mode)}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 bg-muted/30 p-2">
            {RANGE_OPTIONS[granularity].map((range) => (
              <Button
                key={`${granularity}-${range}`}
                size="sm"
                variant={selectedRange === range ? "default" : "outline"}
                onClick={() => setRange(range)}
                className="rounded-full"
              >
                {granularity === "weekly" ? `${range}w` : granularity === "monthly" ? `${range}m` : `${range}q`}
              </Button>
            ))}
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-2.5">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={visibleCategories.length === CATEGORIES.length ? "default" : "outline"}
                onClick={() => setVisibleCategories([...CATEGORIES])}
                className="rounded-full"
              >
                All
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled
              className="h-auto px-0 text-[11px] text-muted-foreground hover:bg-transparent"
            >
              Click to show/hide. Press Only to isolate one muscle group.
            </Button>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const enabled = visibleCategories.includes(category);
                return (
                  <div
                    key={category}
                    className={cn(
                      "inline-flex items-center rounded-full border p-0.5",
                      enabled ? "border-border bg-background" : "border-border/60 bg-muted/40 opacity-85"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        enabled ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[category] }}
                      />
                      {category}
                    </button>
                    <button
                      type="button"
                      onClick={() => showOnlyCategory(category)}
                      className={cn(
                        "mr-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                        enabled && visibleCategories.length === 1
                          ? "border-primary/30 bg-primary/15 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Only
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="border-border/70 bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-1 pt-4 px-5">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {titleCase(granularity)} Score
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <TrendAreaChart
              data={selectedData}
              metric="score"
              visibleCategories={orderedVisibleCategories}
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-1 pt-4 px-5">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {titleCase(granularity)} Sets
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <TrendAreaChart
              data={selectedData}
              metric="sets"
              visibleCategories={orderedVisibleCategories}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
