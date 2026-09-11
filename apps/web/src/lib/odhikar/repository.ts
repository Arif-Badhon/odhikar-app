// Persistence boundary. Today: browser storage seeded with demo cases.
// Swapping in a database means implementing CaseRepository once.
import { supabase } from "@/integrations/supabase/client";
import { submitVictimCase } from "./case.functions";
import { seedQueue } from "./fixtures";
import type { Json } from "@/integrations/supabase/types";
import type { CaseRecord } from "./types";
import type { CaseRepository } from "./services/types";

const KEY = "odhikar.cases.v2";

export class LocalCaseRepository implements CaseRepository {
  private read(): CaseRecord[] {
    if (typeof window === "undefined") return seedQueue();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) {
        const seeded = seedQueue();
        this.write(seeded);
        return seeded;
      }
      return JSON.parse(raw) as CaseRecord[];
    } catch {
      return seedQueue();
    }
  }

  private write(rows: CaseRecord[]): void {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(rows));
    } catch {
      // Storage full (recorded audio is bulky) — drop audio payloads and retry.
      try {
        const slim = rows.map(({ audioDataUrl: _drop, ...rest }) => rest);
        window.localStorage.setItem(KEY, JSON.stringify(slim));
      } catch {
        /* ignore */
      }
    }
  }

  async list(): Promise<CaseRecord[]> {
    return this.read();
  }

  async get(id: string): Promise<CaseRecord | undefined> {
    return this.read().find((c) => c.id === id);
  }

  async save(record: CaseRecord): Promise<CaseRecord> {
    const rows = this.read();
    const idx = rows.findIndex((c) => c.id === record.id);
    const next = idx >= 0 ? rows.map((c) => (c.id === record.id ? record : c)) : [record, ...rows];
    this.write(next);
    return record;
  }

  async reset(): Promise<CaseRecord[]> {
    const seeded = seedQueue();
    this.write(seeded);
    return seeded;
  }
}

class CloudCaseRepository implements CaseRepository {
  private fallback = new LocalCaseRepository();

  async list(): Promise<CaseRecord[]> {
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) return [];
    const { data, error } = await supabase.from("cases").select("structured_record,audio_path").eq("case_kind", "victim");
    if (error) throw error;
    return Promise.all((data ?? []).map(async (row) => {
      const record = row.structured_record as unknown as CaseRecord;
      if (!row.audio_path) return record;
      const signed = await supabase.storage.from("case-audio").createSignedUrl(row.audio_path, 900);
      return { ...record, audioDataUrl: signed.data?.signedUrl };
    }));
  }

  async get(id: string) { return (await this.list()).find((record) => record.id === id); }

  async save(record: CaseRecord): Promise<CaseRecord> {
    try {
      const { data: auth } = await supabase.auth.getSession();
      if (auth.session) {
        const safe = { ...record };
        delete safe.audioDataUrl;
        const { error } = await supabase.from("cases").update({
          status: record.status,
          urgency: record.urgency,
          safety_flag: record.safetyFlag,
          safety_note: record.safetyNote ?? null,
          structured_record: safe as unknown as Json,
          missing_fields: record.missing as Json,
        }).eq("case_number", record.id).eq("case_kind", "victim");
        if (error) throw error;
      } else {
        await submitVictimCase({ data: { record } });
      }
      return record;
    } catch (error) {
      // A failed public submission remains recoverable on this device and is never presented as synced.
      await this.fallback.save(record);
      throw error;
    }
  }

  async reset(): Promise<CaseRecord[]> { return this.list(); }
}

export const caseRepository: CaseRepository = new CloudCaseRepository();

export function generateCaseId(): string {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `ODH-2026-${n}`;
}
