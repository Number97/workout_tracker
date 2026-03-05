"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MuscleBalance } from "@/lib/types";

interface Props {
  data: MuscleBalance[];
}

export function MuscleRadarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid className="stroke-border" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ fontSize: 12 }}
          formatter={(value: number | undefined) => [value != null ? value.toFixed(0) : "0", "Score"]}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.25}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
