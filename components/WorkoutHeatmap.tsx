"use client";

import { useMemo } from "react";
import { format, eachDayOfInterval, subDays, parseISO, startOfWeek } from "date-fns";

interface Props {
  heatmapData: Record<string, number>;
}

function getColor(score: number, max: number): string {
  if (score === 0) return "bg-muted";
  const intensity = score / max;
  if (intensity < 0.25) return "bg-blue-200 dark:bg-blue-900";
  if (intensity < 0.5) return "bg-blue-400 dark:bg-blue-700";
  if (intensity < 0.75) return "bg-blue-600 dark:bg-blue-500";
  return "bg-blue-800 dark:bg-blue-300";
}

export function WorkoutHeatmap({ heatmapData }: Props) {
  const days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 364);
    return eachDayOfInterval({ start, end });
  }, []);

  const maxScore = useMemo(() => {
    return Math.max(0, ...Object.values(heatmapData));
  }, [heatmapData]);

  // Group by week columns
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    let week: Date[] = [];

    for (const day of days) {
      const dayOfWeek = day.getDay(); // 0 = Sunday
      if (dayOfWeek === 1 && week.length > 0) {
        // Pad previous week if needed
        while (week.length < 7) week.unshift(new Date(0));
        result.push(week);
        week = [];
      }
      week.push(day);
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(new Date(0));
      result.push(week);
    }
    return result;
  }, [days]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const validDay = week.find((d) => d.getFullYear() > 2000);
      if (validDay) {
        const month = validDay.getMonth();
        if (month !== lastMonth) {
          labels.push({ label: format(validDay, "MMM"), col });
          lastMonth = month;
        }
      }
    });
    return labels;
  }, [weeks]);

  const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex mb-1 ml-8" style={{ gap: "2px" }}>
          {weeks.map((_, i) => {
            const label = monthLabels.find((m) => m.col === i);
            return (
              <div key={i} className="w-3 text-xs text-muted-foreground" style={{ minWidth: "12px" }}>
                {label ? label.label : ""}
              </div>
            );
          })}
        </div>

        <div className="flex" style={{ gap: "2px" }}>
          {/* Day labels */}
          <div className="flex flex-col mr-1" style={{ gap: "2px" }}>
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-3 text-xs text-muted-foreground text-right pr-1" style={{ minHeight: "12px", lineHeight: "12px" }}>
                {label}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col" style={{ gap: "2px" }}>
              {week.map((day, dayIdx) => {
                const isPlaceholder = day.getFullYear() < 2000;
                if (isPlaceholder) {
                  return <div key={dayIdx} className="w-3 h-3" style={{ minWidth: "12px", minHeight: "12px" }} />;
                }
                const dateStr = format(day, "yyyy-MM-dd");
                const score = heatmapData[dateStr] ?? 0;
                return (
                  <div
                    key={dayIdx}
                    title={`${dateStr}: ${score.toFixed(0)}`}
                    className={`w-3 h-3 rounded-sm ${getColor(score, maxScore)}`}
                    style={{ minWidth: "12px", minHeight: "12px" }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
