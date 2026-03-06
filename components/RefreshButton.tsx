"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RefreshButton({
  label = "Refresh",
  variant = "outline",
  size = "sm",
  className,
}: {
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  className?: string;
}) {
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
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={loading}
      className={cn(className)}
      aria-label="Refresh dashboard"
      title="Refresh dashboard"
    >
      {loading ? "Refreshing…" : label}
    </Button>
  );
}
