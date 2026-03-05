"use client";

import { useState } from "react";
import { parseTabSeparatedText, ParsedLine } from "@/lib/parser";
import { CATEGORIES, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORY_COLORS: Record<string, string> = {
  Back: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  Chest: "bg-red-500/20 text-red-700 dark:text-red-300",
  Shoulders: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  Arms: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  Legs: "bg-green-500/20 text-green-700 dark:text-green-300",
  Abs: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  Cardio: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
};

export function PasteLogForm() {
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedLine[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  function handleParse() {
    const lines = parseTabSeparatedText(rawText);
    setParsed(lines);
    setSavedCount(null);
    setError("");
  }

  function handleCellEdit(
    index: number,
    field: keyof ParsedLine,
    value: string
  ) {
    if (!parsed) return;
    const updated = [...parsed];
    const entry = { ...updated[index] };

    if (field === "effectiveReps" || field === "setsIntensity" || field === "weightMult") {
      (entry as any)[field] = parseFloat(value) || 0;
    } else {
      (entry as any)[field] = value;
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
        setRawText("");
        setParsed(null);
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
    <div className="space-y-4">
      {/* Paste area */}
      <div className="space-y-2">
        <textarea
          className="w-full h-48 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={"Paste ChatGPT output here...\n2025-03-05\tChest\tBench Press\t12\t3\t80 kg\t12\t3\t80"}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={handleParse} disabled={!rawText.trim()}>
            Preview
          </Button>
          {parsed && (
            <Button
              variant="outline"
              onClick={() => { setParsed(null); setRawText(""); setSavedCount(null); }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Success message */}
      {savedCount !== null && (
        <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-700 dark:text-green-300">
          Saved {savedCount} {savedCount === 1 ? "entry" : "entries"} to Google Sheets.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Preview table */}
      {parsed && parsed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {parsed.length} {parsed.length === 1 ? "line" : "lines"} parsed
              {" · "}
              <span className="font-mono">Total score: {totalScore.toFixed(0)}</span>
            </span>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : `Save ${parsed.length} entries`}
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Exercise</TableHead>
                  <TableHead>Reps</TableHead>
                  <TableHead>Sets</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Col7</TableHead>
                  <TableHead>Col8</TableHead>
                  <TableHead>Col9</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.map((line, i) => (
                  <TableRow key={i} className={line.error ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <EditableCell
                        value={line.date}
                        onChange={(v) => handleCellEdit(i, "date", v)}
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="text-xs rounded border border-input bg-background px-1 py-0.5"
                        value={line.category}
                        onChange={(e) => handleCellEdit(i, "category", e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
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
                      <EditableCell
                        value={line.repsText}
                        onChange={(v) => handleCellEdit(i, "repsText", v)}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={line.setsText}
                        onChange={(v) => handleCellEdit(i, "setsText", v)}
                      />
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
                      {line.error && (
                        <div className="text-xs text-destructive mt-0.5">{line.error}</div>
                      )}
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
      className={`text-xs rounded border border-transparent hover:border-input focus:border-input bg-transparent px-1 py-0.5 focus:outline-none ${
        wide ? "min-w-32" : "min-w-16"
      } ${numeric ? "font-mono w-16" : ""}`}
    />
  );
}
