"use client";

import { useState } from "react";

interface LevelsFyiEmbedProps {
  company: string;
  track?: string;
}

export function LevelsFyiEmbed({ company, track = "Product Manager" }: LevelsFyiEmbedProps) {
  const [error, setError] = useState(false);
  const encodedCompany = encodeURIComponent(company);
  const encodedTrack = encodeURIComponent(track);
  const src = `https://www.levels.fyi/charts_embed.html?company=${encodedCompany}&track=${encodedTrack}`;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] text-center p-6">
        <p className="text-sm text-[var(--muted)] mb-2">Compensation data unavailable</p>
        <p className="text-xs text-[var(--muted)]">
          Visit{" "}
          <a
            href={`https://www.levels.fyi/companies/${encodedCompany}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            levels.fyi
          </a>{" "}
          directly, or enter comp data manually.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--border)]">
      <iframe
        src={src}
        width="100%"
        height="500"
        title={`${company} compensation data`}
        onError={() => setError(true)}
        className="block"
        loading="lazy"
      />
    </div>
  );
}
