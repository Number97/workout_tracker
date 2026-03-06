"use client";

import { useState } from "react";
import { parseTabSeparatedText, ParsedLine } from "@/lib/parser";
import { CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PasteLogForm() {
  const [parsed, setParsed] = useState<ParsedLine[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [rawText, setRawText] = useState("");

  function reset() {
    setParsed(null);
    setSavedCount(null);
    setError("");
    setRawText("");
  }

  function handlePaste() {
    if (!rawText.trim()) return;
    setParsed(parseTabSeparatedText(rawText));
    setSavedCount(null);
    setError("");
  }

  function handleCellEdit(index: number, field: keyof ParsedLine, value: string) {
    if (!parsed) return;
    const updated = [...parsed];
    const entry = { ...updated[index] };
    if (field === "effectiveReps" || field === "setsIntensity" || field === "weightMult") {
      (entry as unknown as Record<string, number>)[field] = parseFloat(value) || 0;
    } else {
      (entry as unknown as Record<string, string>)[field] = value;
    }
    entry.score = entry.effectiveReps * entry.setsIntensity * entry.weightMult;
    updated[index] = entry;
    setParsed(updated);
  }

  async function handleSave() {
    if (!parsed || parsed.length === 0) return;
    const hasErrors = parsed.some((p) => p.error);
    if (hasErrors && !confirm("Some lines have warnings. Save anyway?")) return;

    setSaving(true);
    setError("");

    try {
      const entries = parsed.map((p) => ({
        date: p.date,
        category: p.category,
        exerciseName: p.exerciseName,
        repsText: p.repsText,
        setsText: p.setsText,
        weightText: p.weightText,
        effectiveReps: p.effectiveReps,
        setsIntensity: p.setsIntensity,
        weightMult: p.weightMult,
      }));

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedCount(data.count);
        setParsed(null);
        setRawText("");
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  const totalScore = parsed?.reduce((sum, p) => sum + p.score, 0) ?? 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/70 bg-card/70 p-4 backdrop-blur-sm">
        <p className="mb-3 text-sm text-muted-foreground">
          Paste the tab-separated workout lines below, then preview and save.
        </p>
        <textarea
          className="h-40 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder={"2025-03-05\tChest\tBench Press\t10\t4\t80 kg\t10\t4\t80"}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />
        <div className="mt-3 flex gap-2">
          <Button onClick={handlePaste} disabled={!rawText.trim()}>
            Preview
          </Button>
          {(parsed || rawText) && (
            <Button variant="outline" onClick={reset}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {savedCount !== null && (
        <div className="rounded-md border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Saved {savedCount} {savedCount === 1 ? "entry" : "entries"} to Google Sheets.
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {parsed && parsed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{parsed.length}</span>{" "}
              {parsed.length === 1 ? "line" : "lines"} · Total score:{" "}
              <span className="font-mono font-medium text-foreground">{totalScore.toFixed(0)}</span>
            </span>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : `Save ${parsed.length} entries`}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Exercise</TableHead>
                  <TableHead className="text-xs">Reps</TableHead>
                  <TableHead className="text-xs">Sets</TableHead>
                  <TableHead className="text-xs">Weight</TableHead>
                  <TableHead className="text-xs">Col7</TableHead>
                  <TableHead className="text-xs">Col8</TableHead>
                  <TableHead className="text-xs">Col9</TableHead>
                  <TableHead className="text-right text-xs">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.map((line, i) => (
                  <TableRow key={i} className={line.error ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <EditableCell value={line.date} onChange={(v) => handleCellEdit(i, "date", v)} />
                    </TableCell>
                    <TableCell>
                      <select
                        className="rounded border border-input bg-background px-1 py-0.5 text-xs"
                        value={line.category}
                        onChange={(e) => handleCellEdit(i, "category", e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={line.exerciseName}
                        onChange={(v) => handleCellEdit(i, "exerciseName", v)}
                        wide
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell value={line.repsText} onChange={(v) => handleCellEdit(i, "repsText", v)} />
                    </TableCell>
                    <TableCell>
                      <EditableCell value={line.setsText} onChange={(v) => handleCellEdit(i, "setsText", v)} />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={line.weightText}
                        onChange={(v) => handleCellEdit(i, "weightText", v)}
                        wide
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={String(line.effectiveReps)}
                        onChange={(v) => handleCellEdit(i, "effectiveReps", v)}
                        numeric
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={String(line.setsIntensity)}
                        onChange={(v) => handleCellEdit(i, "setsIntensity", v)}
                        numeric
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={String(line.weightMult)}
                        onChange={(v) => handleCellEdit(i, "weightMult", v)}
                        numeric
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {line.score.toFixed(0)}
                      {line.error && <div className="mt-0.5 text-xs text-destructive">{line.error}</div>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

function EditableCell({
  value,
  onChange,
  numeric = false,
  wide = false,
}: {
  value: string;
  onChange: (v: string) => void;
  numeric?: boolean;
  wide?: boolean;
}) {
  return (
    <input
      type={numeric ? "number" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded border border-transparent bg-transparent px-1 py-0.5 text-xs hover:border-input focus:border-input focus:outline-none ${
        wide ? "min-w-32" : "min-w-16"
      } ${numeric ? "w-16 font-mono" : ""}`}
    />
  );
}
