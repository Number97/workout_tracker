import { getAllEntries } from "@/lib/sheets";
import { getWeeklyData, getMonthlyData, getMuscleBalance } from "@/lib/aggregations";
import { ChartsView } from "@/components/ChartsView";

export const dynamic = "force-dynamic";

export default async function ChartsPage() {
  const entries = await getAllEntries();

  const weekly12 = getWeeklyData(entries, 12);
  const weekly26 = getWeeklyData(entries, 26);
  const monthly12 = getMonthlyData(entries, 12);
  const muscleBalance30 = getMuscleBalance(entries, 30);
  const muscleBalance90 = getMuscleBalance(entries, 90);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Charts</h1>
      <ChartsView
        weekly12={weekly12}
        weekly26={weekly26}
        monthly12={monthly12}
        muscleBalance30={muscleBalance30}
        muscleBalance90={muscleBalance90}
      />
    </div>
  );
}
