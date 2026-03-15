"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { LevelsFyiEmbed } from "@/components/comp/LevelsFyiEmbed";

const TRACK_OPTIONS = [
  { value: "Product Manager", label: "Product Manager" },
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "Design", label: "Design" },
  { value: "Data", label: "Data" },
  { value: "Engineering Manager", label: "Engineering Manager" },
];

export default function CompPage() {
  const [companies, setCompanies] = useState<{ value: string; label: string }[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([""]);
  const [track, setTrack] = useState("Product Manager");

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setCompanies(res.data.map((c: { id: string; name: string }) => ({ value: c.name, label: c.name })));
        }
      });
  }, []);

  function addCompany() {
    if (selectedCompanies.length < 3) {
      setSelectedCompanies([...selectedCompanies, ""]);
    }
  }

  function removeCompany(index: number) {
    setSelectedCompanies(selectedCompanies.filter((_, i) => i !== index));
  }

  function setCompany(index: number, value: string) {
    const updated = [...selectedCompanies];
    updated[index] = value;
    setSelectedCompanies(updated);
  }

  const activeCompanies = selectedCompanies.filter(Boolean);

  return (
    <div>
      <PageHeader
        title="Compensation Intelligence"
        description="Benchmark compensation across your target companies."
      />

      <div className="space-y-6">
        <Card className="p-5">
          <div className="flex items-end gap-4 flex-wrap">
            <Select
              label="Role family"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              options={TRACK_OPTIONS}
              className="w-48"
            />
            <div className="flex items-end gap-2 flex-wrap">
              {selectedCompanies.map((company, i) => (
                <div key={i} className="flex items-end gap-1">
                  <Select
                    label={i === 0 ? "Companies (up to 3)" : " "}
                    value={company}
                    onChange={(e) => setCompany(i, e.target.value)}
                    options={companies}
                    placeholder="Select company"
                    className="w-48"
                  />
                  {selectedCompanies.length > 1 && (
                    <button
                      onClick={() => removeCompany(i)}
                      className="mb-1 text-[var(--muted)] hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {selectedCompanies.length < 3 && (
                <button
                  onClick={addCompany}
                  className="mb-1 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  + Compare
                </button>
              )}
            </div>
          </div>
        </Card>

        {activeCompanies.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted)]">
            <p className="text-sm">Select a company above to view compensation data.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${activeCompanies.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {activeCompanies.map((company) => (
              <div key={company}>
                <p className="text-sm font-medium text-[var(--foreground)] mb-2">{company}</p>
                <LevelsFyiEmbed company={company} track={track} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
