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
  Back: "#4D7CFF",
  Chest: "#FF4FA3",
  Shoulders: "#9D4DFF",
  Arms: "#FF7A1A",
  Legs: "#27E39C",
  Abs: "#C9F31D",
  Cardio: "#15D8FF",
};

// Very soft translucent fills
const CATEGORY_FILLS: Record<Category, string> = {
  Back: "rgba(77, 124, 255, 0.36)",
  Chest: "rgba(255, 79, 163, 0.36)",
  Shoulders: "rgba(157, 77, 255, 0.36)",
  Arms: "rgba(255, 122, 26, 0.36)",
  Legs: "rgba(39, 227, 156, 0.36)",
  Abs: "rgba(201, 243, 29, 0.36)",
  Cardio: "rgba(21, 216, 255, 0.36)",
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

function yAxisHeadroomMax(dataMax: number): number {
  if (!Number.isFinite(dataMax) || dataMax <= 0) return 10;
  return Math.ceil(dataMax * 1.12);
}

function renderValueLabel(props: unknown) {
  const p = props as {
    index?: number;
    x?: number;
    y?: number;
    value?: number;
  };
  if (p.index === 0 || !p.value || p.x == null || p.y == null) return null;

  return (
    <text
      x={p.x}
      y={p.y}
      dy={-6}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
      fill="#e2e8f0"
    >
      {formatLabel(p.value)}
    </text>
  );
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
          stroke="rgba(148,163,184,0.14)"
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
          domain={[0, yAxisHeadroomMax]}
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
            stroke={CATEGORY_COLORS[category]}
            strokeWidth={0.45}
            strokeOpacity={0.25}
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
              content={renderValueLabel}
            />
          </Line>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
