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
      <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius)] text-[11px] border bg-[var(--bg-mute)] text-[var(--ink-3)] border-[var(--line)]">
        Unscored
      </span>
    );
  }

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-[13px]",
    lg: "px-3 py-1.5 text-[14px] font-semibold",
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <span
        className={cn(
          "inline-flex items-center rounded-[var(--radius)] border font-medium",
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
            <div key={dim} className="flex items-center gap-2 text-[12px]">
              <span className="w-16 text-[var(--ink-3)] capitalize">{dim}</span>
              <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-mute)]">
                <div
                  className={cn("h-full rounded-full", cmfScoreBg(breakdown[dim]).split(" ")[0])}
                  style={{ width: `${(breakdown[dim] / 10) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-[var(--ink-3)]">{breakdown[dim]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
