import { getAllEntries } from "@/lib/sheets";
import { HistoryTable } from "@/components/HistoryTable";
import { RefreshButton } from "@/components/RefreshButton";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const entries = await getAllEntries();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">History</h1>
        <RefreshButton />
      </div>
      <HistoryTable initialEntries={entries} />
    </div>
  );
}
