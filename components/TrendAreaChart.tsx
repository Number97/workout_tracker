"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Category } from "@/lib/types";

export const CATEGORY_COLORS: Record<Category, string> = {
  Back: "#3b82f6",
  Chest: "#ef4444",
  Shoulders: "#a855f7",
  Arms: "#f97316",
  Legs: "#22c55e",
  Abs: "#eab308",
  Cardio: "#06b6d4",
};

export interface TrendPoint {
  label: string;
  Back: number;
  Chest: number;
  Shoulders: number;
  Arms: number;
  Legs: number;
  Abs: number;
  Cardio: number;
  BackSets: number;
  ChestSets: number;
  ShouldersSets: number;
  ArmsSets: number;
  LegsSets: number;
  AbsSets: number;
  CardioSets: number;
  total: number;
  totalSets: number;
}

interface Props {
  data: TrendPoint[];
  metric: "score" | "sets";
  visibleCategories: Category[];
}

function getSeriesKey(category: Category, metric: "score" | "sets"): string {
  return metric === "score" ? category : `${category}Sets`;
}

export function TrendAreaChart({ data, metric, visibleCategories }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={metric === "score"} />
        <Tooltip
          contentStyle={{ fontSize: 12 }}
          formatter={(value: number | undefined, name: string | undefined) => {
            if (!name) return [value != null ? String(value) : "0", ""];
            const label = name.endsWith("Sets") ? name.replace("Sets", "") : name;
            const formatted = metric === "score"
              ? (value != null ? value.toFixed(0) : "0")
              : (value != null ? String(Math.round(value)) : "0");
            return [formatted, label];
          }}
        />
        {visibleCategories.map((category) => (
          <Area
            key={`${metric}-${category}`}
            type="monotone"
            dataKey={getSeriesKey(category, metric)}
            stackId="stack"
            stroke={CATEGORY_COLORS[category]}
            fill={CATEGORY_COLORS[category]}
            strokeWidth={1}
            fillOpacity={metric === "score" ? 0.2 : 0.15}
            activeDot={{ r: 3 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
