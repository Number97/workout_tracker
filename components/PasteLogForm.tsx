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

type Mode = "ai" | "paste";

export function PasteLogForm() {
  const [mode, setMode] = useState<Mode>("ai");

  // Shared state
  const [parsed, setParsed] = useState<ParsedLine[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  // AI mode state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Paste mode state
  const [rawText, setRawText] = useState("");

  function reset() {
    setParsed(null);
    setSavedCount(null);
    setError("");
    setRawText("");
    setAiPrompt("");
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setError("");
    setParsed(null);
    setSavedCount(null);

    try {
      const res = await fetch("/api/parse-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate");
        return;
      }
      if (!data.tsvText?.trim()) {
        setError("ChatGPT didn't return any workout lines. Try rephrasing your description.");
        return;
      }
      setParsed(parseTabSeparatedText(data.tsvText));
    } catch {
      setError("Network error calling AI");
    } finally {
      setAiLoading(false);
    }
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
        reset();
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
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => { setMode("ai"); reset(); }}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "ai"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          AI Chat
        </button>
        <button
          onClick={() => { setMode("paste"); reset(); }}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "paste"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Paste
        </button>
      </div>

      {/* AI mode */}
      {mode === "ai" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Describe your workout in plain language. The app sends it to ChatGPT using your exact prompt configuration and parses the result automatically.
          </p>
          <textarea
            className="w-full h-40 rounded-md border border-input bg-background px-3 py-2 text-sm resize-y placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="e.g. Did 4 sets of 10 bench press at 80kg, then 3x12 incline dumbbell at 25kg each hand, finished with cable flyes 3x15 at 20kg..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAiGenerate();
            }}
          />
          <div className="flex gap-2">
            <Button onClick={handleAiGenerate} disabled={!aiPrompt.trim() || aiLoading}>
              {aiLoading ? "Generating…" : "Generate  ⌘↵"}
            </Button>
            {parsed && <Button variant="outline" onClick={reset}>Clear</Button>}
          </div>
        </div>
      )}

      {/* Paste mode */}
      {mode === "paste" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste the tab-separated lines from ChatGPT below.
          </p>
          <textarea
            className="w-full h-40 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder={"2025-03-05\tChest\tBench Press\t10\t4\t80 kg\t10\t4\t80"}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handlePaste} disabled={!rawText.trim()}>Preview</Button>
            {parsed && <Button variant="outline" onClick={reset}>Clear</Button>}
          </div>
        </div>
      )}

      {/* Success */}
      {savedCount !== null && (
        <div className="rounded-md bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
          Saved {savedCount} {savedCount === 1 ? "entry" : "entries"} to Google Sheets.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Preview table */}
      {parsed && parsed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{parsed.length}</span>{" "}
              {parsed.length === 1 ? "line" : "lines"} · Total score:{" "}
              <span className="font-mono font-medium text-foreground">{totalScore.toFixed(0)}</span>
            </span>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : `Save ${parsed.length} entries`}
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
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
                  <TableHead className="text-xs text-right">Score</TableHead>
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
                        className="text-xs rounded border border-input bg-background px-1 py-0.5"
                        value={line.category}
                        onChange={(e) => handleCellEdit(i, "category", e.target.value)}
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </TableCell>
                    <TableCell>
                      <EditableCell value={line.exerciseName} onChange={(v) => handleCellEdit(i, "exerciseName", v)} wide />
                    </TableCell>
                    <TableCell>
                      <EditableCell value={line.repsText} onChange={(v) => handleCellEdit(i, "repsText", v)} />
                    </TableCell>
                    <TableCell>
                      <EditableCell value={line.setsText} onChange={(v) => handleCellEdit(i, "setsText", v)} />
                    </TableCell>
                    <TableCell>
                      <EditableCell value={line.weightText} onChange={(v) => handleCellEdit(i, "weightText", v)} wide />
                    </TableCell>
                    <TableCell>
                      <EditableCell value={String(line.effectiveReps)} onChange={(v) => handleCellEdit(i, "effectiveReps", v)} numeric />
                    </TableCell>
                    <TableCell>
                      <EditableCell value={String(line.setsIntensity)} onChange={(v) => handleCellEdit(i, "setsIntensity", v)} numeric />
                    </TableCell>
                    <TableCell>
                      <EditableCell value={String(line.weightMult)} onChange={(v) => handleCellEdit(i, "weightMult", v)} numeric />
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
