"use client";

import { useState, useMemo } from "react";
import { WorkoutEntry, CATEGORIES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const PAGE_SIZE = 50;

interface Props {
  initialEntries: WorkoutEntry[];
}

export function HistoryTable({ initialEntries }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        if (category !== "all" && e.category !== category) return false;
        if (search && !e.exerciseName.toLowerCase().includes(search.toLowerCase())) return false;
        if (dateFrom && e.date < dateFrom) return false;
        if (dateTo && e.date > dateTo) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, search, category, dateFrom, dateTo]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function resetPage() {
    setPage(0);
  }

  async function handleDelete(rowIndex: number) {
    if (!confirm("Delete this entry?")) return;
    setDeleting(rowIndex);
    try {
      const res = await fetch(`/api/entries/${rowIndex}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.rowIndex !== rowIndex));
      } else {
        alert("Failed to delete entry");
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Search exercise..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="max-w-xs"
        />
        <Select value={category} onValueChange={(v) => { setCategory(v); resetPage(); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
          className="w-36"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
          className="w-36"
        />
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} entries
        </span>
      </div>

      {/* Table */}
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
              <TableHead className="text-right">Score</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((entry) => (
                <TableRow key={entry.rowIndex}>
                  <TableCell className="font-mono text-sm">{entry.date}</TableCell>
                  <TableCell>
                    <Badge className={CATEGORY_COLORS[entry.category] ?? ""} variant="outline">
                      {entry.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.exerciseName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.repsText}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.setsText}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.weightText}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium">
                    {entry.score.toFixed(0)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deleting === entry.rowIndex}
                      onClick={() => handleDelete(entry.rowIndex)}
                    >
                      {deleting === entry.rowIndex ? "..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
