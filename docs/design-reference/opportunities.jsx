// Opportunities — kanban-style pipeline
const OPP_STAGES = [
  { id: 'sourced',  label: 'Sourced',  count: 5 },
  { id: 'engaged',  label: 'Engaged',  count: 4 },
  { id: 'active',   label: 'Active',   count: 2 },
  { id: 'offer',    label: 'Offer',    count: 0 },
];

const OPPS = {
  sourced: [
    { co: 'Ramp',    role: 'VP Product, Spend',          fit: 81, next: 'Warm intro via M. Chen' },
    { co: 'Plaid',   role: 'Director PM, Identity',      fit: 74, next: 'Research thesis' },
    { co: 'Retool',  role: 'Head of Product, Platform',  fit: 71, next: 'Apply via referral' },
    { co: 'Mercury', role: 'Group PM, Lending',          fit: 68, next: 'Find warm path' },
    { co: 'Stripe',  role: 'Director PM, Capital',       fit: 65, next: 'Identify hiring manager' },
  ],
  engaged: [
    { co: 'Vercel',  role: 'Head of Product, DX',        fit: 88, next: 'Send follow-up email' },
    { co: 'Notion',  role: 'Director PM, AI',            fit: 79, next: 'Schedule coffee w/ L. Park' },
    { co: 'Figma',   role: 'Director PM, Dev',           fit: 76, next: 'Reply to recruiter' },
    { co: 'Airtable',role: 'Head of Product, Apps',      fit: 73, next: 'Awaiting response (4d)' },
  ],
  active: [
    { co: 'Linear',  role: 'Director of Product, Platform', fit: 92, next: 'Recruiter screen Thu 2pm' },
    { co: 'Cron',    role: 'Head of Product',               fit: 84, next: 'Final round prep' },
  ],
  offer: [],
};

function OppCard({ opp }) {
  return (
    <div style={{
      background: 'var(--bg-elev)',
      border: '1px solid var(--line)',
      borderRadius: 8,
      padding: 14,
      display: 'flex', flexDirection: 'column', gap: 10,
      cursor: 'grab',
      transition: 'border-color .12s ease, transform .12s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink-4)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
    >
      <div className="row-between">
        <div className="row" style={{ gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 5,
            border: '1px solid var(--line)', background: 'var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600, color: 'var(--ink-2)',
          }}>{opp.co.slice(0,1)}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{opp.co}</div>
        </div>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{opp.fit}</span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>{opp.role}</div>
      <div className="row" style={{ gap: 6, paddingTop: 8, borderTop: '1px solid var(--line-2)' }}>
        <I.ArrowRight size={11} style={{ color: 'var(--ink-3)' }}/>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.3 }}>{opp.next}</span>
      </div>
    </div>
  );
}

function Opportunities() {
  return (
    <div className="screen">
      <PageHeader
        eyebrow="Pipeline"
        title="Opportunities"
        subtitle="Drag to move stages. Each card is scored against your positioning."
        actions={
          <>
            <button className="btn btn-sm"><I.Filter size={13}/> Filter</button>
            <button className="btn btn-sm btn-primary"><I.Plus size={13}/> Add opportunity</button>
          </>
        }
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        alignItems: 'start',
      }}>
        {OPP_STAGES.map(stage => {
          const cards = OPPS[stage.id] || [];
          return (
            <div key={stage.id} style={{
              background: 'var(--bg-sub)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              display: 'flex', flexDirection: 'column', gap: 10,
              minHeight: 200,
            }}>
              <div className="row-between" style={{ padding: '4px 6px 6px' }}>
                <div className="row" style={{ gap: 8 }}>
                  <h3 style={{ fontSize: 13 }}>{stage.label}</h3>
                  <span style={{
                    fontSize: 11.5, color: 'var(--ink-3)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{cards.length}</span>
                </div>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ width: 24, height: 24 }}>
                  <I.Plus size={12}/>
                </button>
              </div>
              {cards.length === 0 ? (
                <div style={{
                  padding: '32px 12px', textAlign: 'center',
                  fontSize: 12, color: 'var(--ink-4)',
                  border: '1px dashed var(--line)',
                  borderRadius: 8,
                }}>No opportunities yet</div>
              ) : (
                cards.map((opp, i) => <OppCard key={i} opp={opp}/>)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.Opportunities = Opportunities;
