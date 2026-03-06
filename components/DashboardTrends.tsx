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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Performance Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["weekly", "monthly", "quarterly"] as const).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={granularity === mode ? "default" : "outline"}
                onClick={() => setGranularity(mode)}
              >
                {titleCase(mode)}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS[granularity].map((range) => (
              <Button
                key={`${granularity}-${range}`}
                size="sm"
                variant={selectedRange === range ? "default" : "outline"}
                onClick={() => setRange(range)}
              >
                {granularity === "weekly" ? `${range}w` : granularity === "monthly" ? `${range}m` : `${range}q`}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={visibleCategories.length === CATEGORIES.length ? "default" : "outline"}
              onClick={() => setVisibleCategories([...CATEGORIES])}
            >
              All
            </Button>
            {CATEGORIES.map((category) => {
              const enabled = visibleCategories.includes(category);
              return (
                <Button
                  key={category}
                  size="sm"
                  variant={enabled ? "default" : "outline"}
                  onClick={() => toggleCategory(category)}
                  className="gap-1.5"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  {category}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
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

        <Card>
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
