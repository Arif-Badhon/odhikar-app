import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { caseRepository } from "./repository";
import type { CaseRecord } from "./types";

interface Store {
  cases: CaseRecord[];
  loading: boolean;
  getCase: (id: string) => CaseRecord | undefined;
  upsert: (c: CaseRecord) => void;
  reset: () => void;
  refresh: () => Promise<void>;
  syncError: string | null;
}

const Ctx = createContext<Store | null>(null);

export function CaseStoreProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setCases(await caseRepository.list()); setSyncError(null); }
    catch { setSyncError("Secure records could not be loaded. Please retry."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let alive = true;
    void caseRepository.list().then((rows) => { if (alive) setCases(rows); }).catch(() => {
      if (alive) setSyncError("Secure records could not be loaded. Please retry.");
    }).finally(() => { if (alive) setLoading(false); });
    return () => {
      alive = false;
    };
  }, []);

  const upsert = useCallback((c: CaseRecord) => {
    setCases((prev) => {
      const idx = prev.findIndex((p) => p.id === c.id);
      return idx >= 0 ? prev.map((p) => (p.id === c.id ? c : p)) : [c, ...prev];
    });
    void caseRepository.save(c).then(() => setSyncError(null)).catch(() => setSyncError("Not synced yet. A recoverable copy remains on this device."));
  }, []);

  const reset = useCallback(() => {
    void caseRepository.reset().then(setCases);
  }, []);

  const value = useMemo<Store>(
    () => ({ cases, loading, getCase: (id) => cases.find((c) => c.id === id), upsert, reset, refresh, syncError }),
    [cases, loading, upsert, reset, refresh, syncError],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCaseStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCaseStore must be used inside CaseStoreProvider");
  return ctx;
}
