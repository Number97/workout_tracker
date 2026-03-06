import { getAllEntries } from "@/lib/sheets";
import {
  getWeeklyData,
  getMonthlyData,
  getQuarterlyData,
  getRecentEntries,
  getHeatmapData,
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

  const weekly26 = getWeeklyData(entries, 26);
  const monthly12 = getMonthlyData(entries, 12);
  const quarterly8 = getQuarterlyData(entries, 8);
  const recent = getRecentEntries(entries, 7);
  const heatmap = getHeatmapData(entries);

  const thisWeek = weekly26[weekly26.length - 1];
  const lastWeek = weekly26[weekly26.length - 2];
  const thisWeekScore = thisWeek?.total ?? 0;
  const lastWeekScore = lastWeek?.total ?? 0;
  const thisWeekSets = thisWeek?.totalSets ?? 0;
  const lastWeekSets = lastWeek?.totalSets ?? 0;
  const scoreDelta = lastWeekScore > 0 ? ((thisWeekScore - lastWeekScore) / lastWeekScore) * 100 : 0;
  const setsDelta = lastWeekSets > 0 ? ((thisWeekSets - lastWeekSets) / lastWeekSets) * 100 : 0;

  const heatmapObj = Object.fromEntries(heatmap.entries());

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Link
            href="/log"
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            + Log workout
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={thisWeekScore.toFixed(0)} label="Score this week" delta={scoreDelta} />
        <StatCard value={String(thisWeekSets)} label="Sets this week" delta={setsDelta} />
        <StatCard value={String(recent.length)} label="Sets last 7 days" />
        <StatCard value={String(entries.length)} label="Total sets logged" />
      </div>

      {/* Score + Sets trend charts */}
      <DashboardTrends
        weekly26={weekly26}
        monthly12={monthly12}
        quarterly8={quarterly8}
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

function StatCard({
  value,
  label,
  delta,
}: {
  value: string;
  label: string;
  delta?: number;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="text-2xl font-bold font-mono tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        {delta !== undefined && delta !== 0 && (
          <div className={`text-xs mt-1 font-medium ${delta > 0 ? "text-green-400" : "text-red-400"}`}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}% vs last week
          </div>
        )}
      </CardContent>
    </Card>
  );
}
