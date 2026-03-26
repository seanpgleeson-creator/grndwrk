"use client";

import { useState } from "react";
import { Menu, X, LayoutDashboard, User, Building2, Target, DollarSign, Mail } from "lucide-react";
import { NavItem } from "./NavItem";
import { ThemeToggle } from "./ThemeToggle";

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <>
      <div className="px-5 py-5">
        <span className="text-lg tracking-tight text-[var(--foreground)] [font-family:var(--font-heading),serif]">
          grndwrk
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" onClick={onNavClick}>
        <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
        <NavItem href="/profile" label="Profile" icon={User} />
        <NavItem href="/companies" label="Companies" icon={Building2} />
        <NavItem href="/opportunities" label="Opportunities" icon={Target} />
        <NavItem href="/comp" label="Compensation" icon={DollarSign} />
        <NavItem href="/outreach" label="Outreach" icon={Mail} disabled comingSoon />
      </nav>

      <div className="px-3 py-3 border-t border-[var(--border)]">
        <ThemeToggle />
      </div>
    </>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] border-r border-[var(--border)] bg-[var(--sidebar)] flex-col z-30 transition-colors duration-150">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--sidebar)] border-b border-[var(--border)]">
        <span className="text-base tracking-tight text-[var(--foreground)] [font-family:var(--font-heading),serif]">
          grndwrk
        </span>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="p-2 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors duration-150"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-[260px] border-r border-[var(--border)] bg-[var(--sidebar)] flex flex-col z-50 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <span className="text-lg tracking-tight text-[var(--foreground)] [font-family:var(--font-heading),serif]">
            grndwrk
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors duration-150"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" onClick={() => setOpen(false)}>
          <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem href="/profile" label="Profile" icon={User} />
          <NavItem href="/companies" label="Companies" icon={Building2} />
          <NavItem href="/opportunities" label="Opportunities" icon={Target} />
          <NavItem href="/comp" label="Compensation" icon={DollarSign} />
          <NavItem href="/outreach" label="Outreach" icon={Mail} disabled comingSoon />
        </nav>

        <div className="px-3 py-3 border-t border-[var(--border)]">
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
