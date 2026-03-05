import { getAllEntries } from "@/lib/sheets";
import {
  getWeeklyData,
  getMuscleBalance,
  getRecentEntries,
  getHeatmapData,
} from "@/lib/aggregations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBarChart } from "@/components/ScoreBarChart";
import { MuscleRadarChart } from "@/components/MuscleRadarChart";
import { WorkoutHeatmap } from "@/components/WorkoutHeatmap";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, string> = {
  Back: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  Chest: "bg-red-500/20 text-red-700 dark:text-red-300",
  Shoulders: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  Arms: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  Legs: "bg-green-500/20 text-green-700 dark:text-green-300",
  Abs: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  Cardio: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
};

export default async function DashboardPage() {
  const entries = await getAllEntries();

  const weekly8 = getWeeklyData(entries, 8);
  const muscleBalance = getMuscleBalance(entries, 30);
  const recent = getRecentEntries(entries, 7);
  const heatmap = getHeatmapData(entries);

  // Week-over-week comparison
  const thisWeek = weekly8[weekly8.length - 1]?.total ?? 0;
  const lastWeek = weekly8[weekly8.length - 2]?.total ?? 0;
  const weekDelta = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

  const heatmapObj = Object.fromEntries(heatmap.entries());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/log"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Log workout
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-mono">{thisWeek.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-1">This week's score</div>
            {weekDelta !== 0 && (
              <div className={`text-xs mt-1 ${weekDelta > 0 ? "text-green-600" : "text-red-500"}`}>
                {weekDelta > 0 ? "+" : ""}{weekDelta.toFixed(1)}% vs last week
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-mono">{recent.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Sets this week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-mono">{entries.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total sets logged</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Volume (8 weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBarChart data={weekly8} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Muscle Balance (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <MuscleRadarChart data={muscleBalance} />
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Training Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutHeatmap heatmapData={heatmapObj} />
        </CardContent>
      </Card>

      {/* Recent workouts */}
      {recent.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recent.slice(0, 20).map((entry) => (
                <div
                  key={entry.rowIndex}
                  className="flex items-center gap-3 py-1.5 border-b last:border-0 text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                    {entry.date}
                  </span>
                  <Badge
                    className={`${CATEGORY_COLORS[entry.category] ?? ""} text-xs shrink-0`}
                    variant="outline"
                  >
                    {entry.category}
                  </Badge>
                  <Link
                    href={`/exercise/${encodeURIComponent(entry.exerciseName)}`}
                    className="hover:underline truncate"
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
