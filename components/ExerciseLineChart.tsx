"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  dateLabel: string;
  score: number;
  weight: number;
  reps: number;
  sets: number;
}

interface Props {
  data: DataPoint[];
}

export function ExerciseLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="score"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Score"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="weight"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 3 }}
          strokeDasharray="5 5"
          name="Weight (kg)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
