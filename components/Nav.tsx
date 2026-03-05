"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/log", label: "Log" },
  { href: "/history", label: "History" },
  { href: "/charts", label: "Charts" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="font-semibold text-sm mr-4">Workout Tracker</span>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </nav>
  );
}
