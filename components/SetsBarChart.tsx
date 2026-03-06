"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { WeeklyData } from "@/lib/types";

const COLORS: Record<string, string> = {
  BackSets: "#3b82f6",
  ChestSets: "#ef4444",
  ShouldersSets: "#a855f7",
  ArmsSets: "#f97316",
  LegsSets: "#22c55e",
  AbsSets: "#eab308",
  CardioSets: "#06b6d4",
};

const KEYS = ["BackSets", "ChestSets", "ShouldersSets", "ArmsSets", "LegsSets", "AbsSets", "CardioSets"] as const;

const LABELS: Record<string, string> = {
  BackSets: "Back",
  ChestSets: "Chest",
  ShouldersSets: "Shoulders",
  ArmsSets: "Arms",
  LegsSets: "Legs",
  AbsSets: "Abs",
  CardioSets: "Cardio",
};

interface Props {
  data: WeeklyData[];
}

export function SetsBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12 }}
          formatter={(value: number | undefined, name: string | undefined) => [
            value != null ? String(Math.round(value)) : "0",
            name ? (LABELS[name] ?? name) : "",
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => LABELS[value] ?? value}
        />
        {KEYS.map((key) => (
          <Bar key={key} dataKey={key} stackId="a" fill={COLORS[key]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
