import { PasteLogForm } from "@/components/PasteLogForm";

export default function LogPage() {
  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-2xl font-bold">Log Workout</h1>
      <p className="text-muted-foreground text-sm">
        Paste tab-separated workout lines, review the preview, then save to Google Sheets.
      </p>
      <PasteLogForm />
    </div>
  );
}
