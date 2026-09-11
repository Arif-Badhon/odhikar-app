"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { CaseStoreProvider } from "@/lib/odhikar/store";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CaseStoreProvider>
        {children}
        <Toaster />
      </CaseStoreProvider>
    </QueryClientProvider>
  );
}
