"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateRelative } from "@/lib/utils";

export interface Contact {
  id: string;
  name: string;
  title: string | null;
  linkedin_url: string | null;
  connection_degree: string;
  warmth: string;
  source: string | null;
  notes: string | null;
  last_contact: Date | null;
  company_id: string | null;
  company?: { id: string; name: string } | null;
}

export interface OutreachRecord {
  id: string;
  contact_id: string;
  opportunity_id: string | null;
  date: Date;
  channel: string;
  message_summary: string | null;
  response: string | null;
}

interface ContactsPanelProps {
  contacts: Contact[];
  /** If set, new contacts will default to this company */
  companyId?: string;
  showCompany?: boolean;
}

// ── Warmth pill ───────────────────────────────────────────────────────────────
function WarmthPill({ warmth }: { warmth: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    Hot: {
      bg: "var(--ink)",
      color: "var(--bg)",
      border: "none",
    },
    Warm: {
      bg: "var(--bg-mute)",
      color: "var(--ink)",
      border: "none",
    },
    Cold: {
      bg: "transparent",
      color: "var(--ink-3)",
      border: "1px solid var(--line)",
    },
  };
  const s = styles[warmth] ?? styles.Cold;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        background: s.bg,
        color: s.color,
        border: s.border || "none",
        letterSpacing: "-0.005em",
      }}
    >
      {warmth}
    </span>
  );
}

// ── DegreeBadge ───────────────────────────────────────────────────────────────
function DegreeBadge({ degree }: { degree: string }) {
  const label =
    degree === "first" ? "1st" : degree === "second" ? "2nd" : "—";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 6px",
        background: "var(--bg-mute)",
        color: "var(--ink-3)",
        border: "none",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
}

// ── AddContactForm ────────────────────────────────────────────────────────────
function AddContactForm({
  companyId,
  onDone,
}: {
  companyId?: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [degree, setDegree] = useState("cold");
  const [warmth, setWarmth] = useState("Cold");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) { setError("Name is required"); return; }
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            title: title.trim() || undefined,
            linkedin_url: linkedin.trim() || undefined,
            connection_degree: degree,
            warmth,
            notes: notes.trim() || undefined,
            company_id: companyId || undefined,
          }),
        });
        if (!res.ok) throw new Error("Failed to create contact");
        router.refresh();
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  const inputStyle = {
    width: "100%",
    height: 36,
    padding: "0 10px",
    border: "1px solid var(--line)",
    borderRadius: 6,
    background: "var(--bg-elev)",
    color: "var(--ink)",
    fontSize: 13,
    outline: "none",
    transition: "border-color 120ms ease",
  } as React.CSSProperties;

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--ink-3)",
    marginBottom: 4,
  } as React.CSSProperties;

  return (
    <div
      style={{
        background: "var(--bg-sub)",
        border: "1px solid var(--line)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--ink-3)",
          marginBottom: 14,
        }}
      >
        Add contact
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            autoFocus
            className="focus:border-[var(--ink-4)] focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--focus)_12%,transparent)]"
          />
        </div>
        <div>
          <label style={labelStyle}>Title</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. VP Engineering"
            className="focus:border-[var(--ink-4)] focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--focus)_12%,transparent)]"
          />
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>LinkedIn URL</label>
        <input
          style={inputStyle}
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          placeholder="https://linkedin.com/in/..."
          className="focus:border-[var(--ink-4)] focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--focus)_12%,transparent)]"
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>Connection</label>
          <select
            style={{ ...inputStyle }}
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            className="focus:border-[var(--ink-4)]"
          >
            <option value="first">1st degree</option>
            <option value="second">2nd degree</option>
            <option value="cold">Cold</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Warmth</label>
          <select
            style={{ ...inputStyle }}
            value={warmth}
            onChange={(e) => setWarmth(e.target.value)}
            className="focus:border-[var(--ink-4)]"
          >
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Notes</label>
        <textarea
          style={{
            ...inputStyle,
            height: "auto",
            padding: "8px 10px",
            resize: "vertical",
            minHeight: 60,
            lineHeight: 1.5,
          } as React.CSSProperties}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How you know them, context..."
          className="focus:border-[var(--ink-4)] focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--focus)_12%,transparent)]"
        />
      </div>
      {error && (
        <p className="text-[12px] text-red-700 dark:text-red-400 mb-3">{error}</p>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          style={{
            padding: "6px 14px",
            background: "var(--ink)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: isPending ? "wait" : "pointer",
            transition: "all 120ms ease",
          }}
        >
          {isPending ? "Adding…" : "Add contact"}
        </button>
        <button
          onClick={onDone}
          style={{
            padding: "6px 12px",
            background: "transparent",
            color: "var(--ink-3)",
            border: "none",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── LogOutreachForm ───────────────────────────────────────────────────────────
function LogOutreachForm({
  contactId,
  onDone,
}: {
  contactId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [channel, setChannel] = useState("linkedin");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [error, setError] = useState("");

  async function handleDraft() {
    setDraftError("");
    setDrafting(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}/outreach-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          context_note: contextNote.trim() || undefined,
          existing_draft: summary.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        data?: { draft: string; subject?: string };
        message?: string;
      };
      if (!res.ok) throw new Error(json.message ?? "Failed to generate draft");
      const draft = json.data?.draft ?? "";
      const subject = json.data?.subject;
      const full = subject ? `Subject: ${subject}\n\n${draft}` : draft;
      setSummary(full);
    } catch (e) {
      setDraftError(e instanceof Error ? e.message : "Failed");
    } finally {
      setDrafting(false);
    }
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/contacts/${contactId}/outreach`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel,
            date,
            message_summary: summary.trim() || undefined,
          }),
        });
        if (!res.ok) throw new Error("Failed to log outreach");
        router.refresh();
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  const inputStyle = {
    height: 34,
    padding: "0 10px",
    border: "1px solid var(--line)",
    borderRadius: 6,
    background: "var(--bg-elev)",
    color: "var(--ink)",
    fontSize: 13,
    outline: "none",
    width: "100%",
    transition: "border-color 120ms ease",
  } as React.CSSProperties;

  return (
    <div
      style={{
        background: "var(--bg-sub)",
        border: "1px solid var(--line-2)",
        borderRadius: 6,
        padding: 12,
        marginTop: 8,
      }}
    >
      <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--ink-3)", marginBottom: 10 }}>
        Log outreach
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--ink-3)", marginBottom: 3 }}>Channel</label>
          <select
            style={inputStyle}
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="linkedin">LinkedIn</option>
            <option value="email">Email</option>
            <option value="live_chat_virtual">Live chat (virtual)</option>
            <option value="live_chat_in_person">Live chat (in person)</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--ink-3)", marginBottom: 3 }}>Date</label>
          <input
            type="date"
            style={inputStyle}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Message — write first, then improve with AI */}
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 11, color: "var(--ink-3)", marginBottom: 3 }}>
          Message (optional)
        </label>
        <textarea
          style={{ ...inputStyle, height: "auto", padding: "7px 10px", minHeight: 80, resize: "vertical", lineHeight: 1.5 } as React.CSSProperties}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write your message here, then use Improve with AI below…"
        />
      </div>

      {/* Improve with AI */}
      <div style={{ marginBottom: 10 }}>
        {showContext && (
          <div style={{ marginBottom: 6 }}>
            <label style={{ display: "block", fontSize: 11, color: "var(--ink-3)", marginBottom: 3 }}>
              Context for AI (optional — e.g. specific role, angle, or ask)
            </label>
            <textarea
              style={{ ...inputStyle, height: "auto", padding: "6px 10px", minHeight: 44, resize: "vertical", lineHeight: 1.5 } as React.CSSProperties}
              value={contextNote}
              onChange={(e) => setContextNote(e.target.value)}
              placeholder="e.g. They're hiring a PM for their growth team — ask for an intro call"
            />
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleDraft}
            disabled={drafting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              background: "var(--bg-mute)",
              color: drafting ? "var(--ink-4)" : "var(--ink-2)",
              border: "1px solid var(--line)",
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 500,
              cursor: drafting ? "wait" : "pointer",
              transition: "all 120ms ease",
            }}
          >
            {drafting ? (
              <>
                <svg width={10} height={10} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M8 2a6 6 0 1 1-4.243 1.757" />
                </svg>
                Improving…
              </>
            ) : (
              <>
                <svg width={10} height={10} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13 2 3 9l3 1 1 3 6-10z" />
                </svg>
                Improve with AI
              </>
            )}
          </button>
          <button
            onClick={() => setShowContext((v) => !v)}
            style={{ fontSize: 11.5, color: "var(--ink-4)", background: "transparent", border: "none", cursor: "pointer" }}
          >
            {showContext ? "Hide context" : "Add context"}
          </button>
          {draftError && (
            <span className="text-[11px] text-red-700 dark:text-red-400">{draftError}</span>
          )}
        </div>
      </div>
      {error && <p className="text-[11.5px] text-red-700 dark:text-red-400 mb-2">{error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          style={{
            padding: "5px 12px",
            background: "var(--ink)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 6,
            fontSize: 12.5,
            fontWeight: 500,
            cursor: isPending ? "wait" : "pointer",
          }}
        >
          {isPending ? "Saving…" : "Log outreach"}
        </button>
        <button
          onClick={onDone}
          style={{ fontSize: 12.5, color: "var(--ink-3)", background: "transparent", border: "none", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── ContactRow ────────────────────────────────────────────────────────────────
function ContactRow({
  contact,
  showCompany,
  isLast,
}: {
  contact: Contact;
  showCompany?: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loggingOutreach, setLoggingOutreach] = useState(false);
  const [outreach, setOutreach] = useState<OutreachRecord[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function loadHistory() {
    if (outreach !== null) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}/outreach`);
      const json = (await res.json()) as { data: OutreachRecord[] };
      setOutreach(json.data ?? []);
    } catch {
      setOutreach([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  function toggleExpand() {
    if (!expanded) loadHistory();
    setExpanded((v) => !v);
    setLoggingOutreach(false);
  }

  async function handleDelete() {
    if (!confirm(`Remove ${contact.name}?`)) return;
    await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid var(--line-2)" }}>
      {/* Main row */}
      <div
        style={{ padding: "12px 20px", display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 90px 80px", gap: 16, alignItems: "center", cursor: "pointer", transition: "background 0.1s ease" }}
        className="hover:bg-[var(--bg-sub)]"
        onClick={toggleExpand}
      >
        {/* Name + title */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13.5px] font-medium text-[var(--ink)] truncate">{contact.name}</p>
            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[var(--ink-4)] hover:text-[var(--ink)] transition-colors shrink-0"
                aria-label="LinkedIn profile"
              >
                <svg width={12} height={12} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                </svg>
              </a>
            )}
          </div>
          {contact.title && (
            <p className="text-[12px] text-[var(--ink-3)] truncate">{contact.title}</p>
          )}
          {showCompany && contact.company && (
            <p className="text-[11.5px] text-[var(--ink-3)] truncate">{contact.company.name}</p>
          )}
        </div>

        {/* Warmth */}
        <div>
          <WarmthPill warmth={contact.warmth} />
        </div>

        {/* Degree */}
        <div>
          <DegreeBadge degree={contact.connection_degree} />
        </div>

        {/* Last contact */}
        <p className="text-[12px] text-[var(--ink-3)] tabular-nums">
          {contact.last_contact ? formatDateRelative(contact.last_contact) : <span className="text-[var(--ink-4)]">Never</span>}
        </p>

        {/* Log outreach quick action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
            setLoggingOutreach(true);
            if (!outreach) loadHistory();
          }}
          className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors text-left"
        >
          Log outreach
        </button>

        {/* Chevron + delete */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            aria-label="Delete contact"
            className="text-[var(--ink-4)] hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
          >
            <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
              <path d="M3 3l10 10M13 3 3 13" />
            </svg>
          </button>
          <svg
            width={12}
            height={12}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ color: "var(--ink-4)", transition: "transform 120ms ease", transform: expanded ? "rotate(180deg)" : "none" }}
          >
            <path d="M3 6l5 5 5-5" />
          </svg>
        </div>
      </div>

      {/* Expanded: outreach history + log form */}
      {expanded && (
        <div style={{ padding: "0 20px 16px", background: "var(--bg-sub)" }}>
          {/* Notes */}
          {contact.notes && (
            <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 12, paddingTop: 4, lineHeight: 1.5 }}>
              {contact.notes}
            </p>
          )}

          {/* Log outreach form */}
          {loggingOutreach ? (
            <LogOutreachForm
              contactId={contact.id}
              onDone={() => {
                setLoggingOutreach(false);
                setOutreach(null);
                loadHistory();
              }}
            />
          ) : (
            <button
              onClick={() => setLoggingOutreach(true)}
              style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink-3)", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}
              className="hover:text-[var(--ink)] transition-colors"
            >
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Log outreach
            </button>
          )}

          {/* Outreach history */}
          {loadingHistory && (
            <p style={{ fontSize: 12, color: "var(--ink-4)" }}>Loading history…</p>
          )}
          {outreach && outreach.length === 0 && !loggingOutreach && (
            <p style={{ fontSize: 12, color: "var(--ink-4)" }}>No outreach logged yet.</p>
          )}
          {outreach && outreach.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {outreach.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    padding: "10px 0",
                    borderTop: i === 0 ? "1px solid var(--line-2)" : "none",
                    borderBottom: "1px solid var(--line-2)",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "var(--ink-4)",
                      padding: "2px 6px",
                      border: "1px solid var(--line)",
                      borderRadius: 4,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {r.channel}
                  </span>
                  <div className="flex-1 min-w-0">
                    {r.message_summary && (
                      <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{r.message_summary}</p>
                    )}
                    {r.response && (
                      <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>↩ {r.response}</p>
                    )}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)", flexShrink: 0 }}>
                    {formatDateRelative(r.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ContactsPanel ─────────────────────────────────────────────────────────────
export function ContactsPanel({ contacts, companyId, showCompany }: ContactsPanelProps) {
  const [addingContact, setAddingContact] = useState(false);
  const [warmthFilter, setWarmthFilter] = useState<string>("all");

  const filtered = contacts.filter(
    (c) => warmthFilter === "all" || c.warmth === warmthFilter,
  );

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {(["all", "Hot", "Warm", "Cold"] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWarmthFilter(w)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                background: warmthFilter === w ? "var(--bg-mute)" : "transparent",
                color: warmthFilter === w ? "var(--ink)" : "var(--ink-3)",
                border: "none",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              {w === "all" ? "All" : w}
            </button>
          ))}
          <span
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginLeft: 8 }}
          >
            {filtered.length}
          </span>
        </div>
        <button
          onClick={() => setAddingContact(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            background: "var(--ink)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 6,
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 120ms ease",
          }}
        >
          <svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Add contact
        </button>
      </div>

      {/* Add contact form */}
      {addingContact && (
        <AddContactForm
          companyId={companyId}
          onDone={() => setAddingContact(false)}
        />
      )}

      {/* Table */}
      {contacts.length === 0 && !addingContact ? (
        <div
          style={{
            border: "1px dashed var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 24px",
            textAlign: "center",
            background: "var(--bg-sub)",
          }}
        >
          <p style={{ fontSize: 14, color: "var(--ink)", marginBottom: 6 }}>No contacts yet</p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", maxWidth: 320, margin: "0 auto 16px" }}>
            Add people you know at this company to track your relationship pipeline.
          </p>
          <button
            onClick={() => setAddingContact(true)}
            style={{
              padding: "7px 16px",
              background: "var(--ink)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Add your first contact
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-3)", paddingTop: 12 }}>
          No {warmthFilter !== "all" ? warmthFilter.toLowerCase() : ""} contacts.
        </p>
      ) : (
        <div
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 80px 80px 90px 80px",
              gap: 16,
              padding: "10px 20px",
              borderBottom: "1px solid var(--line)",
              background: "var(--bg-sub)",
            }}
          >
            {["Contact", "Warmth", "Degree", "Last contact", "", ""].map((h, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--ink-3)",
                }}
              >
                {h}
              </span>
            ))}
          </div>
          {filtered.map((c, i) => (
            <ContactRow
              key={c.id}
              contact={c}
              showCompany={showCompany}
              isLast={i === filtered.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
