interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "var(--gap-section)" }}>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              {eyebrow}
            </div>
          )}
          <h1>{title}</h1>
          {description && (
            <p style={{ marginTop: 8, color: "var(--ink-3)", maxWidth: 580 }}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
