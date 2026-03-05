import { google } from "googleapis";
import { WorkoutEntry, Category, CATEGORIES } from "./types";

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetId() {
  const id = process.env.SHEET_ID;
  if (!id) throw new Error("SHEET_ID is not set");
  return id;
}

// The data range — adjust the sheet tab name if yours differs
const DATA_RANGE = process.env.SHEET_RANGE ?? "Sheet1!A:I";
const HEADER_ROWS = Number(process.env.SHEET_HEADER_ROWS ?? "1");

function rowToEntry(row: string[], rowIndex: number): WorkoutEntry | null {
  if (row.length < 9) return null;
  const [date, category, exerciseName, repsText, setsText, weightText, col7, col8, col9] = row;
  if (!date || !category || !exerciseName) return null;

  const effectiveReps = parseFloat(col7) || 0;
  const setsIntensity = parseFloat(col8) || 0;
  const weightMult = parseFloat(col9) || 0;

  return {
    rowIndex,
    date: date.trim(),
    category: (CATEGORIES.includes(category.trim() as Category) ? category.trim() : "Back") as Category,
    exerciseName: exerciseName.trim(),
    repsText: repsText?.trim() ?? "",
    setsText: setsText?.trim() ?? "",
    weightText: weightText?.trim() ?? "",
    effectiveReps,
    setsIntensity,
    weightMult,
    score: effectiveReps * setsIntensity * weightMult,
  };
}

export async function getAllEntries(): Promise<WorkoutEntry[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: DATA_RANGE,
  });

  const rows = res.data.values ?? [];
  // Skip header rows
  return rows
    .slice(HEADER_ROWS)
    .map((row, i) => rowToEntry(row.map(String), i + HEADER_ROWS + 1))
    .filter((e): e is WorkoutEntry => e !== null);
}

export async function appendEntries(entries: Omit<WorkoutEntry, "rowIndex" | "score">[]): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const values = entries.map((e) => [
    e.date,
    e.category,
    e.exerciseName,
    e.repsText,
    e.setsText,
    e.weightText,
    e.effectiveReps,
    e.setsIntensity,
    e.weightMult,
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: DATA_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function updateEntry(
  rowIndex: number,
  entry: Omit<WorkoutEntry, "rowIndex" | "score">
): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Sheet rows are 1-indexed; rowIndex already accounts for this
  const range = `Sheet1!A${rowIndex}:I${rowIndex}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        entry.date,
        entry.category,
        entry.exerciseName,
        entry.repsText,
        entry.setsText,
        entry.weightText,
        entry.effectiveReps,
        entry.setsIntensity,
        entry.weightMult,
      ]],
    },
  });
}

export async function deleteEntry(rowIndex: number): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Get the sheet ID (tab ID) for the first sheet
  const meta = await sheets.spreadsheets.get({ spreadsheetId: getSheetId() });
  const sheetTabId = meta.data.sheets?.[0]?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSheetId(),
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetTabId,
            dimension: "ROWS",
            startIndex: rowIndex - 1, // 0-indexed
            endIndex: rowIndex,       // exclusive
          },
        },
      }],
    },
  });
}
