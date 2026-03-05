import { getAllEntries } from "@/lib/sheets";
import { HistoryTable } from "@/components/HistoryTable";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const entries = await getAllEntries();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">History</h1>
      <HistoryTable initialEntries={entries} />
    </div>
  );
}
