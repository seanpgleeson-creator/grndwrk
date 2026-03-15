"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createCompany } from "@/app/actions/companies";

const STAGE_OPTIONS = [
  { value: "Pre-seed", label: "Pre-seed" },
  { value: "Seed", label: "Seed" },
  { value: "Series A", label: "Series A" },
  { value: "Series B", label: "Series B" },
  { value: "Series C", label: "Series C" },
  { value: "Series D+", label: "Series D+" },
  { value: "Public", label: "Public" },
  { value: "Other", label: "Other" },
];

const SIZE_OPTIONS = [
  { value: "1-50", label: "1–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-1000", label: "201–1000" },
  { value: "1000+", label: "1000+" },
];

const TIER_OPTIONS = [
  { value: "1", label: "Tier 1 — Top priority" },
  { value: "2", label: "Tier 2 — Strong interest" },
  { value: "3", label: "Tier 3 — Monitoring" },
];

export default function NewCompanyPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    website: "",
    linkedin_url: "",
    hq: "",
    stage: "",
    size: "",
    tier: "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Company name is required");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const company = await createCompany({
          name: form.name,
          website: form.website || undefined,
          linkedin_url: form.linkedin_url || undefined,
          hq: form.hq || undefined,
          stage: form.stage || undefined,
          size: form.size || undefined,
          tier: form.tier ? Number(form.tier) : undefined,
          notes: form.notes || undefined,
        });
        router.push(`/companies/${company.id}`);
      } catch {
        setError("Failed to create company. Please try again.");
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Add Company" description="Add a company to your target list." />
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Company name *"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Acme Corp"
            error={error && !form.name ? "Required" : undefined}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Website"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://acme.com"
            />
            <Input
              label="LinkedIn URL"
              value={form.linkedin_url}
              onChange={(e) => set("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/company/acme"
            />
          </div>
          <Input
            label="HQ location"
            value={form.hq}
            onChange={(e) => set("hq", e.target.value)}
            placeholder="San Francisco, CA"
          />
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Stage"
              value={form.stage}
              onChange={(e) => set("stage", e.target.value)}
              options={STAGE_OPTIONS}
              placeholder="Select stage"
            />
            <Select
              label="Size"
              value={form.size}
              onChange={(e) => set("size", e.target.value)}
              options={SIZE_OPTIONS}
              placeholder="Select size"
            />
            <Select
              label="Tier"
              value={form.tier}
              onChange={(e) => set("tier", e.target.value)}
              options={TIER_OPTIONS}
              placeholder="Select tier"
            />
          </div>
          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Why this company? What excites you about them?"
            rows={3}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={isPending}>
              Add company
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
