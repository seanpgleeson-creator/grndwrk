"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
  href?: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export function NavItem({ href, label, icon, disabled, comingSoon, collapsed, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = !!href && (pathname === href || (href !== "/dashboard" && pathname.startsWith(href)));

  const baseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    height: 36,
    padding: "0 8px",
    border: 0,
    borderRadius: 7,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13.5,
    fontWeight: 500,
    letterSpacing: "-0.005em",
    textAlign: "left" as const,
    textDecoration: "none",
    background: isActive ? "var(--bg-mute)" : "transparent",
    color: disabled ? "var(--ink-4)" : isActive ? "var(--ink)" : "var(--ink-3)",
    opacity: disabled ? 0.5 : 1,
    transition: "background 120ms ease, color 120ms ease",
    whiteSpace: "nowrap" as const,
    font: "inherit",
  };

  const iconStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    opacity: collapsed ? 0 : 1,
    transition: "opacity 150ms ease",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const soonStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 500,
    color: "var(--ink-4)",
    padding: "2px 6px",
    borderRadius: 4,
    background: "var(--bg-mute)",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    flexShrink: 0,
    opacity: collapsed ? 0 : 1,
    transition: "opacity 150ms ease",
  };

  const content = (
    <>
      <span style={iconStyle}>{icon}</span>
      <span style={labelStyle}>{label}</span>
      {comingSoon && <span style={soonStyle}>Soon</span>}
    </>
  );

  if (disabled || !href) {
    return (
      <button
        style={baseStyle}
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={(e) => { if (!isActive && !disabled) (e.currentTarget as HTMLElement).style.background = "var(--bg-sub)"; }}
        onMouseLeave={(e) => { if (!isActive && !disabled) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-sub)"; }}
      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = isActive ? "var(--bg-mute)" : "transparent"; }}
    >
      {content}
    </Link>
  );
}
