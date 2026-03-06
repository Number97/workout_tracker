"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RefreshButton({ label = "Refresh" }: { label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleRefresh() {
    setLoading(true);
    router.refresh();
    // router.refresh() is synchronous in triggering re-fetch but has no callback;
    // reset loading state after a short delay
    setTimeout(() => setLoading(false), 1200);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
      {loading ? "Refreshing…" : label}
    </Button>
  );
}
