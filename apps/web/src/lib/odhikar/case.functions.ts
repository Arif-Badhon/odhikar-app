"use server";
import type { CaseRecord } from "./types";

const isVictimRecord = (value: unknown): value is CaseRecord => {
  const record = value as Partial<CaseRecord> | null;
  return Boolean(
    record &&
      typeof record.id === "string" &&
      /^ODH-2026-[0-9]{4,}$/.test(record.id) &&
      typeof record.transcriptBn === "string" &&
      record.transcriptBn.trim().length > 0 &&
      !record.report,
  );
};

/** Narrow public write boundary for the anonymous victim intake. Crime reports are rejected. */
export const submitVictimCase = async ({ data: input }: { data: { record: CaseRecord } }) => {
    if (!isVictimRecord(input?.record)) throw new Error("Invalid victim case submission");
    const record = input.record;

    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${url}/cases/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record })
    });

    if (!res.ok) {
        throw new Error("The secure case record could not be saved to the API.");
    }
    
    // Note: Appointments are currently ignored in this mock, but could be implemented similarly in the API

    return { ok: true as const, caseNumber: record.id };
};