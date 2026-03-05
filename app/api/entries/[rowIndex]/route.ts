import { NextRequest, NextResponse } from "next/server";
import { updateEntry, deleteEntry } from "@/lib/sheets";
import { WorkoutEntry } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ rowIndex: string }> }
) {
  try {
    const { rowIndex: rowIndexStr } = await params;
    const rowIndex = parseInt(rowIndexStr);
    if (isNaN(rowIndex)) {
      return NextResponse.json({ error: "Invalid rowIndex" }, { status: 400 });
    }
    const entry: Omit<WorkoutEntry, "rowIndex" | "score"> = await req.json();
    await updateEntry(rowIndex, entry);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/entries error:", err);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ rowIndex: string }> }
) {
  try {
    const { rowIndex: rowIndexStr } = await params;
    const rowIndex = parseInt(rowIndexStr);
    if (isNaN(rowIndex)) {
      return NextResponse.json({ error: "Invalid rowIndex" }, { status: 400 });
    }
    await deleteEntry(rowIndex);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/entries error:", err);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
