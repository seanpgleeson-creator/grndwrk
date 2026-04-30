// Companies — empty state + populated list
const SAMPLE_COMPANIES = [
  { name: 'Linear',  stage: 'Series C',  industry: 'Developer tools',   geo: 'Remote / SF',   fit: 92, status: 'Active',  contact: 'Maya R.', updated: '2h ago' },
  { name: 'Vercel',  stage: 'Series D',  industry: 'Developer tools',   geo: 'SF / NYC',      fit: 88, status: 'Engaged', contact: 'Devin K.', updated: 'Yesterday' },
  { name: 'Ramp',    stage: 'Series D',  industry: 'Fintech',           geo: 'NYC',           fit: 81, status: 'Sourced', contact: '—',        updated: '3d ago' },
  { name: 'Notion',  stage: 'Series C',  industry: 'Productivity',      geo: 'SF',            fit: 79, status: 'Engaged', contact: 'L. Park',  updated: '4d ago' },
  { name: 'Plaid',   stage: 'Series D',  industry: 'Fintech',           geo: 'SF / NYC',      fit: 74, status: 'Sourced', contact: '—',        updated: '1w ago' },
  { name: 'Retool',  stage: 'Series C',  industry: 'Developer tools',   geo: 'SF / Remote',   fit: 71, status: 'Sourced', contact: '—',        updated: '1w ago' },
  { name: 'Mercury', stage: 'Series B',  industry: 'Fintech',           geo: 'Remote',        fit: 68, status: 'Sourced', contact: '—',        updated: '2w ago' },
];

const STATUS_TONE = {
  Active:  { bg: 'var(--ink)',     fg: 'var(--bg)' },
  Engaged: { bg: 'var(--bg-mute)', fg: 'var(--ink)' },
  Sourced: { bg: 'transparent',    fg: 'var(--ink-3)', border: 'var(--line)' },
};

function StatusPill({ status }) {
  const t = STATUS_TONE[status] || STATUS_TONE.Sourced;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 500,
      background: t.bg, color: t.fg,
      border: t.border ? `1px solid ${t.border}` : 'none',
      letterSpacing: '-0.005em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', opacity: status === 'Sourced' ? 0.6 : 1 }} />
      {status}
    </span>
  );
}

function FitBar({ score }) {
  return (
    <div className="row" style={{ gap: 8 }}>
      <div style={{
        width: 56, height: 4, borderRadius: 2,
        background: 'var(--bg-mute)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          width: `${score}%`,
          background: 'var(--ink)',
        }}/>
      </div>
      <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums', minWidth: 24 }}>{score}</span>
    </div>
  );
}

function EmptyCompanies({ onAdd }) {
  return (
    <div style={{
      border: '1px dashed var(--line)',
      borderRadius: 'var(--radius-lg)',
      padding: '64px 32px',
      textAlign: 'center',
      background: 'var(--bg-sub)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: 'var(--bg-elev)',
        border: '1px solid var(--line)',
        margin: '0 auto 20px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-2)',
      }}>
        <I.Building size={22} />
      </div>
      <h2 style={{ fontSize: 18, marginBottom: 6 }}>No companies yet</h2>
      <p style={{ maxWidth: 380, margin: '0 auto 22px', color: 'var(--ink-3)' }}>
        Start building your target list. We'll score fit against your profile and surface warm paths in.
      </p>
      <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
        <button className="btn btn-primary"><I.Plus size={13}/> Add your first company</button>
        <button className="btn">Import from LinkedIn</button>
      </div>
    </div>
  );
}

function Companies() {
  const [hasData, setHasData] = useState(true);
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return SAMPLE_COMPANIES;
    return SAMPLE_COMPANIES.filter(c => c.status === filter);
  }, [filter]);

  return (
    <div className="screen">
      <PageHeader
        eyebrow="Pipeline"
        title="Companies"
        subtitle="Track and position yourself at your target companies."
        actions={
          <>
            <div className="row" style={{
              border: '1px solid var(--line)', borderRadius: 7,
              padding: '0 8px', height: 'var(--field-h)',
              gap: 6, background: 'var(--bg-elev)',
            }}>
              <I.Search size={14} style={{ color: 'var(--ink-3)' }}/>
              <input style={{
                border: 0, outline: 0, background: 'transparent', font: 'inherit',
                fontSize: 13, color: 'var(--ink)', width: 180,
              }} placeholder="Search companies"/>
            </div>
            <button className="btn btn-sm" onClick={() => setHasData(v => !v)}>
              {hasData ? 'Show empty' : 'Show data'}
            </button>
            <button className="btn btn-sm btn-primary"><I.Plus size={13}/> Add company</button>
          </>
        }
      />

      {!hasData ? <EmptyCompanies /> : (
        <>
          {/* filter bar */}
          <div className="row" style={{ gap: 4, marginBottom: 16 }}>
            {['All','Active','Engaged','Sourced'].map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                style={{
                  border: 0, background: filter === f ? 'var(--bg-mute)' : 'transparent',
                  padding: '6px 12px', borderRadius: 6,
                  font: 'inherit', fontSize: 13, fontWeight: 500,
                  color: filter === f ? 'var(--ink)' : 'var(--ink-3)',
                  cursor: 'pointer',
                }}
              >
                {f}
                <span style={{ marginLeft: 6, color: 'var(--ink-4)', fontVariantNumeric: 'tabular-nums' }}>
                  {f === 'All' ? SAMPLE_COMPANIES.length : SAMPLE_COMPANIES.filter(c => c.status === f).length}
                </span>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn btn-sm btn-ghost"><I.Filter size={13}/> Filter</button>
          </div>

          {/* table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1fr 1.2fr 1fr 1.2fr .9fr 110px 36px',
              gap: 16,
              padding: '12px 20px',
              borderBottom: '1px solid var(--line)',
              background: 'var(--bg-sub)',
              fontSize: 11.5, fontWeight: 500,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
            }}>
              <div>Company</div>
              <div>Stage</div>
              <div>Industry</div>
              <div>Geo</div>
              <div>Fit score</div>
              <div>Status</div>
              <div>Updated</div>
              <div></div>
            </div>
            {filtered.map((c, i) => (
              <div key={c.name} style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 1.2fr 1fr 1.2fr .9fr 110px 36px',
                gap: 16,
                padding: '14px 20px',
                alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--line-2)' : 'none',
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'background .1s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-sub)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="row" style={{ gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    border: '1px solid var(--line)', background: 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, color: 'var(--ink-2)',
                    flex: '0 0 auto',
                  }}>{c.name.slice(0,1)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: 'var(--ink)' }} className="truncate">{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }} className="truncate">{c.contact}</div>
                  </div>
                </div>
                <div style={{ color: 'var(--ink-2)' }}>{c.stage}</div>
                <div style={{ color: 'var(--ink-2)' }}>{c.industry}</div>
                <div style={{ color: 'var(--ink-2)' }}>{c.geo}</div>
                <div><FitBar score={c.fit}/></div>
                <div><StatusPill status={c.status}/></div>
                <div className="meta" style={{ fontSize: 12.5 }}>{c.updated}</div>
                <div><button className="btn btn-ghost btn-icon btn-sm"><I.More size={14}/></button></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

window.Companies = Companies;
