// Persistence boundary. Today: browser storage seeded with demo cases.
// Swapping in a database means implementing CaseRepository once.
import { submitVictimCase } from "./case.functions";
import { seedQueue } from "./fixtures";
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
  
  private get url() {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  async list(): Promise<CaseRecord[]> {
    try {
      const token = localStorage.getItem("odhikar_access_token");
      const res = await fetch(`${this.url}/cases/queue`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      const onlineCases = data.map((row: any) => {
        let record = row.structured_record;
        if (typeof record === "string") {
            try { record = JSON.parse(record); } catch(e) {}
        }
        if (row.audio_path) {
            record.audioDataUrl = `${this.url}/${row.audio_path}`;
        }
        return record;
      });
      
      const localCases = await this.fallback.list();
      const onlineIds = new Set(onlineCases.map((c: any) => c.id));
      const offlineCases = localCases.filter(c => !onlineIds.has(c.id));
      
      return [...onlineCases, ...offlineCases];
    } catch {
      return this.fallback.list();
    }
  }

  async get(id: string) {
    try {
      const res = await fetch(`${this.url}/cases/${id}`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      const record = typeof data.structured_record === "string" ? JSON.parse(data.structured_record) : data.structured_record;
      if (data.audio_path) {
        record.audioDataUrl = `${this.url}/${data.audio_path}`;
      }
      return record;
    } catch {
      return this.fallback.get(id);
    }
  }

  async save(record: CaseRecord): Promise<CaseRecord> {
    try {
      await submitVictimCase({ data: { record } });
      return record;
    } catch (error) {
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
