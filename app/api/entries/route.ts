import { NextRequest, NextResponse } from "next/server";
import { getAllEntries, appendEntries } from "@/lib/sheets";
import { WorkoutEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await getAllEntries();
    return NextResponse.json(entries);
  } catch (err) {
    console.error("GET /api/entries error:", err);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entries: Omit<WorkoutEntry, "rowIndex" | "score">[] = body.entries;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "entries must be a non-empty array" }, { status: 400 });
    }

    await appendEntries(entries);
    return NextResponse.json({ ok: true, count: entries.length });
  } catch (err) {
    console.error("POST /api/entries error:", err);
    return NextResponse.json({ error: "Failed to save entries" }, { status: 500 });
  }
}
