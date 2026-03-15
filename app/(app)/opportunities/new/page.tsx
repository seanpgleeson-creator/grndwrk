"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createOpportunity } from "@/app/actions/opportunities";

const LEVEL_OPTIONS = [
  { value: "IC1", label: "IC1" },
  { value: "IC2", label: "IC2" },
  { value: "IC3", label: "IC3" },
  { value: "IC4", label: "IC4" },
  { value: "IC5", label: "IC5" },
  { value: "IC6", label: "IC6" },
  { value: "IC7", label: "IC7" },
  { value: "Manager", label: "Manager" },
  { value: "Director", label: "Director" },
  { value: "VP", label: "VP" },
  { value: "C-Suite", label: "C-Suite" },
  { value: "Other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "Watching", label: "Watching" },
  { value: "Preparing", label: "Preparing" },
  { value: "Applied", label: "Applied" },
];

export default function NewOpportunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<{ value: string; label: string }[]>([]);

  const [form, setForm] = useState({
    company_id: searchParams.get("company_id") ?? "",
    role_title: "",
    level: "",
    team: "",
    jd_text: "",
    status: "Watching",
  });

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setCompanies(res.data.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name })));
        }
      });
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_id || !form.role_title.trim()) {
      setError("Company and role title are required");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const opp = await createOpportunity({
          company_id: form.company_id,
          role_title: form.role_title,
          level: form.level || undefined,
          team: form.team || undefined,
          jd_text: form.jd_text || undefined,
          status: form.status,
        });
        router.push(`/opportunities/${opp.id}`);
      } catch {
        setError("Failed to create opportunity. Please try again.");
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Add Opportunity" description="Track a new role you're pursuing." />
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Company *"
            value={form.company_id}
            onChange={(e) => set("company_id", e.target.value)}
            options={companies}
            placeholder="Select a company"
          />
          <Input
            label="Role title *"
            value={form.role_title}
            onChange={(e) => set("role_title", e.target.value)}
            placeholder="Principal Product Manager"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Level"
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              options={LEVEL_OPTIONS}
              placeholder="Select level"
            />
            <Input
              label="Team / function"
              value={form.team}
              onChange={(e) => set("team", e.target.value)}
              placeholder="Marketplace, Growth"
            />
          </div>
          <Select
            label="Initial status"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            options={STATUS_OPTIONS}
          />
          <Textarea
            label="Job description"
            value={form.jd_text}
            onChange={(e) => set("jd_text", e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={isPending}>
              Add opportunity
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
