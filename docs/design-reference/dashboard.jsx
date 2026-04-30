// Dashboard — overview screen
function StatCard({ label, value, delta, hint }) {
  const positive = delta && delta.startsWith('+');
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="row-between">
        <span className="meta" style={{ fontSize: 12.5 }}>{label}</span>
        {delta && (
          <span style={{
            fontSize: 11.5, fontWeight: 500,
            color: positive ? 'var(--ink-2)' : 'var(--ink-3)',
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            {positive && <I.ArrowUp size={11} />}
            {delta}
          </span>
        )}
      </div>
      <div style={{
        fontSize: 32, fontWeight: 600,
        letterSpacing: '-0.025em',
        lineHeight: 1, color: 'var(--ink)',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

function ActivityRow({ icon, title, meta, time }) {
  return (
    <div className="row" style={{ gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line-2)' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--bg-mute)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-2)', flex: '0 0 auto',
      }}>
        {React.createElement(I[icon], { size: 14 })}
      </div>
      <div className="grow">
        <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{meta}</div>
      </div>
      <span className="meta" style={{ fontSize: 12, flex: '0 0 auto' }}>{time}</span>
    </div>
  );
}

function Dashboard({ onNav }) {
  return (
    <div className="screen">
      <PageHeader
        eyebrow="Overview"
        title="Welcome back, Jordan"
        subtitle="Here's where your search stands today. Three companies need attention this week."
        actions={
          <>
            <button className="btn btn-sm"><I.Calendar size={13}/> This week</button>
            <button className="btn btn-sm btn-primary" onClick={() => onNav('companies')}><I.Plus size={13}/> Add company</button>
          </>
        }
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 'var(--gap-section)',
      }}>
        <StatCard label="Target companies" value="24" delta="+3" hint="Across 4 stages" />
        <StatCard label="Active opportunities" value="11" delta="+2" hint="6 in progress, 5 sourced" />
        <StatCard label="Outreach in flight" value="7"  delta="—"  hint="2 awaiting response" />
        <StatCard label="Avg. response time" value="2.4d" delta="-0.6d" hint="Last 30 days" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Pipeline */}
        <div className="card" style={{ padding: 24 }}>
          <div className="row-between" style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 16 }}>Pipeline</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('opportunities')}>View all <I.ArrowRight size={12}/></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
            {[
              { stage: 'Sourced',  count: 5, total: 24 },
              { stage: 'Engaged',  count: 4, total: 24 },
              { stage: 'Active',   count: 2, total: 24 },
              { stage: 'Offer',    count: 0, total: 24 },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-elev)', padding: '14px 16px' }}>
                <div className="meta" style={{ fontSize: 11.5, marginBottom: 6 }}>{s.stage}</div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: s.count === 0 ? 'var(--ink-4)' : 'var(--ink)' }}>{s.count}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 4 }}>This week's focus</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Three threads are warming up.</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { co: 'Linear',     role: 'Director of Product, Platform', stage: 'Active',  next: 'Recruiter screen Thu 2pm' },
                { co: 'Vercel',     role: 'Head of Product, Developer Experience', stage: 'Engaged', next: 'Send follow-up email' },
                { co: 'Ramp',       role: 'VP Product, Spend',  stage: 'Sourced', next: 'Warm intro via M. Chen' },
              ].map((row, i) => (
                <div key={i} className="row" style={{
                  gap: 16, padding: '14px 0',
                  borderBottom: i < 2 ? '1px solid var(--line-2)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 7,
                    border: '1px solid var(--line)', background: 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
                    color: 'var(--ink-2)', flex: '0 0 auto',
                  }}>{row.co.slice(0,1)}</div>
                  <div className="grow">
                    <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{row.co}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{row.role}</div>
                  </div>
                  <span className="tag">{row.stage}</span>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', minWidth: 180, textAlign: 'right' }}>{row.next}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="card" style={{ padding: 24 }}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <h2 style={{ fontSize: 16 }}>Recent activity</h2>
          </div>
          <div>
            <ActivityRow icon="Mail"      title="Reply from Linear" meta="Maya R. — recruiter screen scheduled" time="2h" />
            <ActivityRow icon="Edit"      title="Updated positioning" meta="Core profile · narrative pillars" time="Yesterday" />
            <ActivityRow icon="Building"  title="Added Vercel"     meta="Series D · Developer Tools" time="2d" />
            <ActivityRow icon="Target"    title="New opportunity"  meta="Ramp · VP Product, Spend" time="3d" />
            <ActivityRow icon="Bookmark"  title="Saved compensation benchmark" meta="Director PM · Series C/D · NYC" time="5d" />
          </div>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
