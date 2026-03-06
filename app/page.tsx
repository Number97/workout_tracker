import { getAllEntries } from "@/lib/sheets";
import {
  getWeeklyData,
  getMonthlyData,
  getRecentEntries,
  getHeatmapData,
  getYearlyData,
} from "@/lib/aggregations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutHeatmap } from "@/components/WorkoutHeatmap";
import { RefreshButton } from "@/components/RefreshButton";
import { DashboardTrends } from "@/components/DashboardTrends";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, string> = {
  Back: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Chest: "bg-red-500/15 text-red-400 border-red-500/20",
  Shoulders: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Arms: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Legs: "bg-green-500/15 text-green-400 border-green-500/20",
  Abs: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Cardio: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

export default async function DashboardPage() {
  const entries = await getAllEntries();

  const weeklyAll = getWeeklyData(entries);
  const monthlyAll = getMonthlyData(entries);
  const yearlyAll = getYearlyData(entries);
  const recent = getRecentEntries(entries, 7);
  const heatmap = getHeatmapData(entries);

  const thisWeek = weeklyAll[weeklyAll.length - 1];
  const lastWeek = weeklyAll[weeklyAll.length - 2];
  const thisWeekScore = thisWeek?.total ?? 0;
  const lastWeekScore = lastWeek?.total ?? 0;
  const thisWeekSets = thisWeek?.totalSets ?? 0;
  const lastWeekSets = lastWeek?.totalSets ?? 0;
  const scoreDelta = lastWeekScore > 0 ? ((thisWeekScore - lastWeekScore) / lastWeekScore) * 100 : 0;
  const setsDelta = lastWeekSets > 0 ? ((thisWeekSets - lastWeekSets) / lastWeekSets) * 100 : 0;

  const totalScore = entries.reduce((sum, e) => sum + e.score, 0);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthData = monthlyAll.find((m) => m.month === currentMonthKey);
  const lastMonthData = monthlyAll.find((m) => m.month === previousMonthKey);
  const thisMonthScore = thisMonthData?.total ?? 0;
  const thisMonthSets = thisMonthData?.totalSets ?? 0;
  const lastMonthScore = lastMonthData?.total ?? 0;
  const lastMonthSets = lastMonthData?.totalSets ?? 0;
  const monthScoreDelta = lastMonthScore > 0 ? ((thisMonthScore - lastMonthScore) / lastMonthScore) * 100 : 0;
  const monthSetsDelta = lastMonthSets > 0 ? ((thisMonthSets - lastMonthSets) / lastMonthSets) * 100 : 0;

  const heatmapObj = Object.fromEntries(heatmap.entries());

  return (
    <div className="space-y-5">
      <div className="flex justify-end -mb-2">
        <RefreshButton
          label="↻"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground/70 hover:text-foreground"
        />
      </div>

      {/* Compact stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-3 px-1">
        <StatItem value={Math.round(totalScore).toLocaleString()} label="Total score" />
        <StatItem
          value={Math.round(thisMonthScore).toLocaleString()}
          label="Month score"
          delta={monthScoreDelta}
          deltaLabel="vs last month"
        />
        <StatItem
          value={Math.round(thisWeekScore).toLocaleString()}
          label="Week score"
          delta={scoreDelta}
          deltaLabel="vs last week"
        />
        <StatItem value={String(entries.length)} label="Total sets" />
        <StatItem
          value={String(thisMonthSets)}
          label="Month sets"
          delta={monthSetsDelta}
          deltaLabel="vs last month"
        />
        <StatItem
          value={String(thisWeekSets)}
          label="Week sets"
          delta={setsDelta}
          deltaLabel="vs last week"
        />
      </div>

      {/* Charts */}
      <DashboardTrends
        weeklyAll={weeklyAll}
        monthlyAll={monthlyAll}
        yearlyAll={yearlyAll}
      />

      {/* Heatmap */}
      <Card>
        <CardHeader className="pb-1 pt-4 px-5">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Training Consistency
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <WorkoutHeatmap heatmapData={heatmapObj} />
        </CardContent>
      </Card>

      {/* Recent workouts */}
      {recent.length > 0 && (
        <Card>
          <CardHeader className="pb-1 pt-4 px-5">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Last 7 days
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div>
              {recent.slice(0, 20).map((entry) => (
                <div
                  key={entry.rowIndex}
                  className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0 text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                    {entry.date}
                  </span>
                  <Badge
                    className={`${CATEGORY_COLORS[entry.category] ?? ""} text-xs shrink-0 border`}
                    variant="outline"
                  >
                    {entry.category}
                  </Badge>
                  <Link
                    href={`/exercise/${encodeURIComponent(entry.exerciseName)}`}
                    className="hover:text-primary transition-colors truncate"
                  >
                    {entry.exerciseName}
                  </Link>
                  <span className="ml-auto font-mono text-xs text-muted-foreground shrink-0">
                    {entry.score.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatItem({
  value,
  label,
  delta,
  deltaLabel,
}: {
  value: string;
  label: string;
  delta?: number;
  deltaLabel?: string;
}) {
  return (
    <div>
      <div className="text-base font-bold font-mono tabular-nums leading-none">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
      {delta !== undefined && delta !== 0 && (
        <div className={`text-[10px] mt-0.5 font-medium ${delta > 0 ? "text-green-400" : "text-red-400"}`}>
          {delta > 0 ? "+" : ""}{delta.toFixed(0)}% {deltaLabel ?? ""}
        </div>
      )}
    </div>
  );
}
