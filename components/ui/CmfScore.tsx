import { cn, cmfScoreBg, cmfRecommendation } from "@/lib/utils";

interface CmfScoreProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showRecommendation?: boolean;
  breakdown?: {
    domain: number;
    stage: number;
    scope: number;
    strategic: number;
    narrative: number;
  };
}

export function CmfScore({ score, size = "md", showRecommendation, breakdown }: CmfScoreProps) {
  if (score == null) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs border bg-[var(--surface-raised)] text-[var(--muted)] border-[var(--border)]">
        Unscored
      </span>
    );
  }

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base font-semibold",
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <span
        className={cn(
          "inline-flex items-center rounded border font-medium",
          sizeStyles[size],
          cmfScoreBg(score),
        )}
      >
        {score.toFixed(1)}
        {showRecommendation && (
          <span className="ml-1.5 opacity-70 capitalize">
            · {cmfRecommendation(score)}
          </span>
        )}
      </span>
      {breakdown && (
        <div className="space-y-1">
          {(["domain", "stage", "scope", "strategic", "narrative"] as const).map((dim) => (
            <div key={dim} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-[var(--muted)] capitalize">{dim}</span>
              <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-raised)]">
                <div
                  className={cn("h-full rounded-full", cmfScoreBg(breakdown[dim]).split(" ")[0])}
                  style={{ width: `${(breakdown[dim] / 10) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-[var(--muted)]">{breakdown[dim]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
