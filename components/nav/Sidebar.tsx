import { NavItem } from "./NavItem";
import { ThemeToggle } from "./ThemeToggle";
import {
  LayoutDashboard,
  User,
  Building2,
  Target,
  DollarSign,
  Mail,
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] border-r border-[var(--border)] bg-[var(--sidebar)] flex flex-col z-30 transition-colors duration-150">
      <div className="px-5 py-5">
        <span className="text-lg tracking-tight text-[var(--foreground)] [font-family:var(--font-heading),serif]">
          grndwrk
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
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
  );
}
