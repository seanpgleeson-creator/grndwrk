"use client";

import { useState } from "react";
import { NavItem } from "./NavItem";

// ── Inline icon set (16×16 viewBox, 1.5 stroke) ─────────────────────────
function Icon({
  children,
  size = 16,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const Icons = {
  Dashboard: () => (
    <Icon>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </Icon>
  ),
  User: () => (
    <Icon>
      <circle cx="8" cy="5.5" r="2.75" />
      <path d="M2.5 13.5c.8-2.4 3-3.75 5.5-3.75s4.7 1.35 5.5 3.75" />
    </Icon>
  ),
  Building: () => (
    <Icon>
      <rect x="3" y="2.5" width="10" height="11" rx="1" />
      <path d="M6 5.5h1M9 5.5h1M6 8h1M9 8h1M6 10.5h1M9 10.5h1" />
    </Icon>
  ),
  Target: () => (
    <Icon>
      <circle cx="8" cy="8" r="5.5" />
      <circle cx="8" cy="8" r="2.5" />
    </Icon>
  ),
  Dollar: () => (
    <Icon>
      <path d="M8 1.5v13M11 4.5H6.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H4.5" />
    </Icon>
  ),
  Mail: () => (
    <Icon>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="m2.5 5 5.5 4 5.5-4" />
    </Icon>
  ),
  Settings: () => (
    <Icon>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1.05 1.05M4.45 11.55 3.4 12.6M12.6 12.6l-1.05-1.05M4.45 4.45 3.4 3.4" />
    </Icon>
  ),
  Logo: () => (
    <Icon>
      <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" stroke="none" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" stroke="none" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
    </Icon>
  ),
};

// ── Nav config ───────────────────────────────────────────────────────────
const NAV = [
  { href: "/dashboard",     label: "Dashboard",     icon: <Icons.Dashboard /> },
  { href: "/profile",       label: "Profile",       icon: <Icons.User /> },
  { href: "/companies",     label: "Companies",     icon: <Icons.Building /> },
  { href: "/opportunities", label: "Opportunities", icon: <Icons.Target /> },
  { href: "/comp",          label: "Compensation",  icon: <Icons.Dollar /> },
  { href: "/outreach",      label: "Outreach",      icon: <Icons.Mail /> },
];

const RAIL_W = 60;
const FULL_W = 220;

// ── Sidebar ──────────────────────────────────────────────────────────────
export function Sidebar() {
  const [hovered, setHovered] = useState(false);
  const width = hovered ? FULL_W : RAIL_W;
  const collapsed = !hovered;

  return (
    <>
      {/* Desktop rail sidebar */}
      <aside
        style={{ flex: `0 0 ${RAIL_W}px`, height: "100vh", position: "sticky", top: 0, zIndex: 10 }}
        className="hidden lg:block"
      >
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height: "100vh",
            background: "var(--bg-sub)",
            borderRight: "1px solid var(--line)",
            transition: "width 180ms cubic-bezier(0.4,0,0.2,1)",
            display: "flex",
            flexDirection: "column",
            padding: "20px 12px",
            gap: 24,
            overflow: "hidden",
          }}
        >
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px", minHeight: 36 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "var(--ink)",
                color: "var(--bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icons.Logo />
            </div>
            <span
              style={{
                opacity: collapsed ? 0 : 1,
                transition: "opacity 150ms ease",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                whiteSpace: "nowrap",
              }}
            >
              grndwrk
            </span>
          </div>

          {/* Nav items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <NavItem
              label="Settings"
              icon={<Icons.Settings />}
              collapsed={collapsed}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px",
                borderTop: "1px solid var(--line)",
                marginTop: 8,
                paddingTop: 14,
              }}
            >
              {/* User avatar */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--ink-2), var(--ink))",
                  color: "var(--bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  flexShrink: 0,
                }}
              >
                U
              </div>
              <div
                style={{
                  opacity: collapsed ? 0 : 1,
                  transition: "opacity 150ms ease",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "var(--ink)",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  You
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink-3)",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  grndwrk
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile: top bar */}
      <MobileNav />
    </>
  );
}

// ── Mobile top bar + drawer ───────────────────────────────────────────────
function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="lg:hidden flex items-center justify-between"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          padding: "0 16px",
          height: 52,
          background: "var(--bg-sub)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: "var(--ink)",
              color: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icons.Logo />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)" }}>
            grndwrk
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          style={{
            border: 0,
            background: "transparent",
            color: "var(--ink-3)",
            cursor: "pointer",
            padding: 8,
            borderRadius: 6,
            display: "flex",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden"
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.4)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className="lg:hidden flex flex-col"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: FULL_W,
          zIndex: 50,
          background: "var(--bg-sub)",
          borderRight: "1px solid var(--line)",
          padding: "20px 12px",
          gap: 24,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 200ms ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
            <div
              style={{
                width: 24, height: 24, borderRadius: 6,
                background: "var(--ink)", color: "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icons.Logo />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)" }}>
              grndwrk
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            style={{
              border: 0, background: "transparent",
              color: "var(--ink-3)", cursor: "pointer",
              padding: 6, borderRadius: 6, display: "flex",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
              <path d="M3 3l10 10M13 3 3 13" />
            </svg>
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={false}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <NavItem label="Settings" icon={<Icons.Settings />} collapsed={false} />
        </div>
      </aside>
    </>
  );
}
