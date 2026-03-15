"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
}

export function NavItem({ href, label, icon, disabled, comingSoon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-md text-[var(--muted)] opacity-40 cursor-not-allowed">
        <span className="h-4 w-4 shrink-0">{icon}</span>
        <span className="text-sm">{label}</span>
        {comingSoon && (
          <span className="ml-auto text-xs bg-[var(--surface-raised)] px-1.5 py-0.5 rounded">
            Soon
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        isActive
          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]",
      )}
    >
      <span className="h-4 w-4 shrink-0">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
