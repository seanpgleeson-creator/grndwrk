// Profile & Positioning Hub — the redo of the messy form screen
const profileTabs = [
  { id: 'core',      label: 'Core profile' },
  { id: 'resume',    label: 'Resume' },
  { id: 'narrative', label: 'Narrative' },
  { id: 'pillars',   label: 'Pillars' },
  { id: 'cmf',       label: 'CMF weights' },
  { id: 'comp',      label: 'Comp targets' },
];

function FieldRow({ label, help, hint, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, padding: 'var(--gap-row) 0', borderBottom: '1px solid var(--line-2)' }}>
      <div style={{ paddingTop: 8 }}>
        <label className="label" style={{ marginBottom: 4 }}>{label}</label>
        {help && <div className="help" style={{ marginTop: 0 }}>{help}</div>}
      </div>
      <div>
        {children}
        {hint && <div className="help">{hint}</div>}
      </div>
    </div>
  );
}

function Profile() {
  const [tab, setTab] = useState('core');

  return (
    <div className="screen">
      <PageHeader
        eyebrow="Profile & positioning"
        title="Your foundation"
        subtitle="Your positioning powers every module in grndwrk — from outreach copy to fit scoring."
        actions={
          <>
            <button className="btn btn-sm btn-ghost"><I.Sparkle size={13}/> Help me write</button>
            <button className="btn btn-sm btn-primary"><I.Check size={13}/> Save changes</button>
          </>
        }
      />

      {/* Tab bar */}
      <div style={{
        borderBottom: '1px solid var(--line)',
        marginBottom: 'var(--gap-section)',
        display: 'flex',
        gap: 4,
        position: 'relative',
      }}>
        {profileTabs.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              border: 0, background: 'transparent',
              padding: '10px 14px',
              font: 'inherit', fontSize: 13, fontWeight: 500,
              color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
              cursor: 'pointer',
              borderBottom: '2px solid',
              borderBottomColor: tab === t.id ? 'var(--ink)' : 'transparent',
              marginBottom: -1,
              transition: 'color .12s ease, border-color .12s ease',
              letterSpacing: '-0.005em',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Two-column field layout */}
      <div style={{ maxWidth: 920 }}>
        {tab === 'core' && (
          <>
            <FieldRow
              label="Positioning statement"
              help="Your north star — who you are, what you do, what makes you distinctive."
            >
              <textarea
                className="textarea"
                defaultValue="Product leader with 8 years building marketplace and platform products at Series B–D companies. I turn ambiguous problems into scalable systems and have shipped both the product and the code to back it up."
                style={{ minHeight: 120 }}
              />
            </FieldRow>

            <FieldRow
              label="Target roles"
              help="Titles you'd consider — used to filter opportunities."
              hint="Comma-separated. We'll match titles fuzzily."
            >
              <input className="input" defaultValue="Director of Product, Head of Product, VP Product" />
              <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {['Director of Product','Head of Product','VP Product'].map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </FieldRow>

            <FieldRow
              label="Target company stages"
              help="Funding stages that match your appetite for ambiguity."
              hint="e.g. Series B, Series C, Public"
            >
              <input className="input" defaultValue="Series B, Series C, Series D" />
            </FieldRow>

            <FieldRow
              label="Geography"
              help="Where you're open to working — remote-friendly OK."
            >
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {['NYC','SF Bay Area','Remote (US)'].map(t => (
                  <span key={t} className="tag" style={{ padding: '6px 10px' }}>
                    {t}
                    <button style={{ border: 0, background: 'transparent', color: 'var(--ink-4)', cursor: 'pointer', padding: 0, marginLeft: 2, lineHeight: 1, fontSize: 14 }}>×</button>
                  </span>
                ))}
                <button className="btn btn-sm" style={{ height: 28, padding: '0 10px' }}><I.Plus size={11}/> Add</button>
              </div>
            </FieldRow>

            <FieldRow
              label="What you avoid"
              help="Anti-fit signals. We'll flag opportunities that match."
            >
              <input className="input" placeholder="e.g. Pre-seed, IC roles, hardware" />
            </FieldRow>
          </>
        )}

        {tab !== 'core' && (
          <div style={{
            padding: '80px 0', textAlign: 'center',
            color: 'var(--ink-3)', fontSize: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'var(--bg-mute)', margin: '0 auto 16px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-3)',
            }}>
              <I.Edit size={18} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 6 }}>
              {profileTabs.find(t => t.id === tab).label}
            </div>
            <div>Switch to <button className="btn btn-ghost btn-sm" onClick={() => setTab('core')} style={{ display: 'inline-flex', height: 'auto', padding: '0 4px' }}>Core profile</button> to see the full demo.</div>
          </div>
        )}
      </div>
    </div>
  );
}

window.Profile = Profile;
