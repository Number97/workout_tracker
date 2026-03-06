"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Category } from "@/lib/types";

export const CATEGORY_COLORS: Record<Category, string> = {
  Back: "#818cf8",
  Chest: "#f472b6",
  Shoulders: "#c084fc",
  Arms: "#fb923c",
  Legs: "#34d399",
  Abs: "#fbbf24",
  Cardio: "#22d3ee",
};

// Muted fills — slightly darker than the border colors
const CATEGORY_FILLS: Record<Category, string> = {
  Back: "#4f46e5",
  Chest: "#db2777",
  Shoulders: "#9333ea",
  Arms: "#ea580c",
  Legs: "#059669",
  Abs: "#d97706",
  Cardio: "#0891b2",
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

function formatLabel(v: number): string {
  if (!v) return "";
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return Math.round(v).toString();
}

export function TrendAreaChart({ data, metric, visibleCategories }: Props) {
  const enrichedData = useMemo(() => {
    return data.map((point) => {
      const visibleTotal = visibleCategories.reduce((sum, cat) => {
        const key = getSeriesKey(cat, metric);
        return sum + ((point[key as keyof TrendPoint] as number) ?? 0);
      }, 0);
      return { ...point, _visibleTotal: visibleTotal };
    });
  }, [data, visibleCategories, metric]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={enrichedData} margin={{ top: 32, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          width={38}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
        />
        <Tooltip
          contentStyle={{
            fontSize: 13,
            backgroundColor: "#0f172a",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            padding: "10px 14px",
          }}
          itemStyle={{ color: "#e2e8f0" }}
          labelStyle={{ color: "#f8fafc", fontWeight: 600, marginBottom: 6 }}
          formatter={(value: number | undefined, name: string | undefined) => {
            if (!name) return [value != null ? String(value) : "0", ""];
            const label = name.endsWith("Sets") ? name.replace("Sets", "") : name;
            const formatted = value != null ? Math.round(value).toLocaleString() : "0";
            return [formatted, label];
          }}
        />
        {visibleCategories.map((category) => (
          <Area
            key={`${metric}-${category}`}
            type="linear"
            dataKey={getSeriesKey(category, metric)}
            stackId="stack"
            stroke={CATEGORY_COLORS[category]}
            strokeWidth={1.5}
            fill={CATEGORY_FILLS[category]}
            fillOpacity={0.9}
            activeDot={{ r: 4, strokeWidth: 0, fill: CATEGORY_COLORS[category] }}
          />
        ))}
        {/* Invisible line to render total value labels above the stack */}
        <Line
          type="linear"
          dataKey="_visibleTotal"
          stroke="transparent"
          dot={false}
          activeDot={false}
          legendType="none"
        >
          <LabelList
            dataKey="_visibleTotal"
            position="top"
            formatter={(v: unknown) => formatLabel(typeof v === "number" ? v : 0)}
            style={{ fontSize: 11, fill: "#e2e8f0", fontWeight: 600 }}
          />
        </Line>
      </AreaChart>
    </ResponsiveContainer>
  );
}
