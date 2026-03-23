"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  comingSoon?: boolean;
}

export function NavItem({ href, label, icon: Icon, disabled, comingSoon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-md text-[var(--muted)] opacity-40 cursor-not-allowed">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm">{label}</span>
        {comingSoon && (
          <span className="ml-auto text-[10px] bg-[var(--surface-raised)] px-1.5 py-0.5 rounded">
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
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150",
        isActive
          ? "bg-[var(--surface-raised)] text-[var(--accent)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
