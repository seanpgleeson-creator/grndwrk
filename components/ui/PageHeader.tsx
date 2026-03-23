interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-[28px] leading-tight font-normal text-[var(--foreground)] [font-family:var(--font-heading),serif]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[14px] text-[var(--muted)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
