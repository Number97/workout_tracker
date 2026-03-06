"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Category } from "@/lib/types";

export const CATEGORY_COLORS: Record<Category, string> = {
  Back: "#8ea0ff",
  Chest: "#ff9ecb",
  Shoulders: "#c9a7ff",
  Arms: "#ffbe88",
  Legs: "#79ddb5",
  Abs: "#f7d478",
  Cardio: "#83e6f2",
};

// Very soft translucent fills
const CATEGORY_FILLS: Record<Category, string> = {
  Back: "rgba(142, 160, 255, 0.28)",
  Chest: "rgba(255, 158, 203, 0.28)",
  Shoulders: "rgba(201, 167, 255, 0.28)",
  Arms: "rgba(255, 190, 136, 0.28)",
  Legs: "rgba(121, 221, 181, 0.28)",
  Abs: "rgba(247, 212, 120, 0.28)",
  Cardio: "rgba(131, 230, 242, 0.28)",
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
  showValueLabels?: boolean;
}

function getSeriesKey(category: Category, metric: "score" | "sets"): string {
  return metric === "score" ? category : `${category}Sets`;
}

function formatLabel(v: number): string {
  if (!v) return "";
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return Math.round(v).toString();
}

function legendColor(value: string): string {
  const key = value.replace("Sets", "") as Category;
  return CATEGORY_COLORS[key] ?? "#94a3b8";
}

function formatAxisTick(v: number): string {
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(Math.round(v));
}

export function TrendAreaChart({
  data,
  metric,
  visibleCategories,
  showValueLabels = true,
}: Props) {
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
      <AreaChart data={enrichedData} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid
          stroke="rgba(148,163,184,0.10)"
          strokeDasharray="2 3"
          vertical
          horizontal
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconSize={0}
          wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
          formatter={(value: string) => (
            <span style={{ color: legendColor(value) }}>
              {value.replace("Sets", "")}
            </span>
          )}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={{ stroke: "rgba(148,163,184,0.28)" }}
          tickLine={{ stroke: "rgba(148,163,184,0.28)" }}
          interval="preserveStartEnd"
          tickMargin={6}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          allowDecimals={false}
          axisLine={{ stroke: "rgba(148,163,184,0.28)" }}
          tickLine={{ stroke: "rgba(148,163,184,0.28)" }}
          width={38}
          tickCount={5}
          tickFormatter={formatAxisTick}
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
            stroke="none"
            strokeWidth={0}
            fill={CATEGORY_FILLS[category]}
            fillOpacity={0.95}
            activeDot={false}
          />
        ))}
        {showValueLabels && (
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
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
