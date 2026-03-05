import { getAllEntries } from "@/lib/sheets";
import { getExerciseHistory, getPersonalRecords } from "@/lib/aggregations";
import { ExerciseLineChart } from "@/components/ExerciseLineChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ name: string }>;
}

export default async function ExercisePage({ params }: Props) {
  const { name } = await params;
  const exerciseName = decodeURIComponent(name);

  const entries = await getAllEntries();
  const history = getExerciseHistory(entries, exerciseName);

  if (history.length === 0) notFound();

  const prs = getPersonalRecords(entries, exerciseName);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">{exerciseName}</h1>

      {prs && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Sessions" value={String(prs.totalSessions)} />
          <StatCard label="Best score" value={prs.maxScore.toFixed(0)} />
          <StatCard label="Max weight" value={`${prs.maxWeight} kg`} />
          <StatCard label="Max reps" value={String(prs.maxReps)} />
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Score & Weight Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseLineChart data={history} />
        </CardContent>
      </Card>

      {/* History table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Sets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Reps</th>
                  <th className="pb-2 font-medium text-right">Sets</th>
                  <th className="pb-2 font-medium text-right">Weight</th>
                  <th className="pb-2 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {history.slice().reverse().map((h, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 font-mono text-xs">{h.date}</td>
                    <td className="py-1.5 text-right">{h.reps}</td>
                    <td className="py-1.5 text-right">{h.sets}</td>
                    <td className="py-1.5 text-right">{h.weight}</td>
                    <td className="py-1.5 text-right font-mono font-medium">{h.score.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-2xl font-bold font-mono">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
