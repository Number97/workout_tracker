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
  Back: "#3b82f6",
  Chest: "#ef4444",
  Shoulders: "#a855f7",
  Arms: "#f97316",
  Legs: "#22c55e",
  Abs: "#eab308",
  Cardio: "#06b6d4",
};

const CATEGORIES = ["Back", "Chest", "Shoulders", "Arms", "Legs", "Abs", "Cardio"];

interface Props {
  data: WeeklyData[];
}

export function ScoreBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ fontSize: 12 }}
          formatter={(value: number | undefined, name: string | undefined) => [value != null ? value.toFixed(0) : "0", name ?? ""]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {CATEGORIES.map((cat) => (
          <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[cat]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
