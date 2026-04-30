// Shell — icon rail sidebar with hover-expand, header, and content frame
const { useState, useEffect, useRef, useCallback, useMemo } = React;

const NAV = [
  { id: 'dashboard',     label: 'Dashboard',     icon: 'Dashboard' },
  { id: 'profile',       label: 'Profile',       icon: 'User' },
  { id: 'companies',     label: 'Companies',     icon: 'Building' },
  { id: 'opportunities', label: 'Opportunities', icon: 'Target' },
  { id: 'compensation',  label: 'Compensation',  icon: 'Dollar' },
  { id: 'outreach',      label: 'Outreach',      icon: 'Mail', soon: true },
];

function Wordmark({ collapsed }) {
  return (
    <div className="row" style={{ gap: 10, padding: '0 4px', minHeight: 36 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: 'var(--ink)', color: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flex: '0 0 auto',
      }}>
        <I.Logo size={14} />
      </div>
      <div style={{
        opacity: collapsed ? 0 : 1,
        transition: 'opacity .15s ease',
        fontSize: 15, fontWeight: 600,
        letterSpacing: '-0.03em',
        color: 'var(--ink)',
        whiteSpace: 'nowrap',
      }}>
        grndwrk
      </div>
    </div>
  );
}

function NavItem({ item, active, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      className="nav-item"
      data-active={active}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%',
        height: 36,
        padding: '0 8px',
        border: 0, background: active ? 'var(--bg-mute)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink-3)',
        borderRadius: 7,
        cursor: 'pointer',
        font: 'inherit', fontSize: 13.5, fontWeight: 500,
        letterSpacing: '-0.005em',
        textAlign: 'left',
        transition: 'background .12s ease, color .12s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-sub)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', color: active ? 'var(--ink)' : 'var(--ink-3)' }}>
        {React.createElement(I[item.icon])}
      </span>
      <span style={{
        opacity: collapsed ? 0 : 1,
        transition: 'opacity .15s ease',
        whiteSpace: 'nowrap',
        flex: 1,
      }}>{item.label}</span>
      {item.soon && !collapsed && (
        <span style={{
          fontSize: 10, fontWeight: 500, color: 'var(--ink-4)',
          padding: '2px 6px', borderRadius: 4,
          background: 'var(--bg-mute)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>Soon</span>
      )}
    </button>
  );
}

function Sidebar({ active, onNav, sidebarMode }) {
  // sidebarMode: 'rail' | 'full' | 'top'
  const [hovered, setHovered] = useState(false);
  const collapsed = sidebarMode === 'rail' ? !hovered : false;

  if (sidebarMode === 'top') return null;

  const expandedW = 220;
  const railW = 60;
  const width = sidebarMode === 'full' ? expandedW : (hovered ? expandedW : railW);

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'sticky', top: 0,
        flex: `0 0 ${sidebarMode === 'rail' ? railW : expandedW}px`,
        height: '100vh',
        zIndex: 10,
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width, height: '100vh',
        background: 'var(--bg-sub)',
        borderRight: '1px solid var(--line)',
        transition: 'width .18s cubic-bezier(.4,.0,.2,1)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px',
        gap: 24,
        overflow: 'hidden',
      }}>
        <Wordmark collapsed={collapsed} />

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            <NavItem
              key={item.id}
              item={item}
              active={active === item.id}
              collapsed={collapsed}
              onClick={() => !item.soon && onNav(item.id)}
            />
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem item={{ id: 'settings', label: 'Settings', icon: 'Settings' }} collapsed={collapsed} onClick={() => {}} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px',
            borderTop: '1px solid var(--line)',
            marginTop: 8, paddingTop: 14,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--ink-2), var(--ink))',
              color: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, letterSpacing: '-0.01em',
              flex: '0 0 auto',
            }}>
              JM
            </div>
            <div style={{
              opacity: collapsed ? 0 : 1,
              transition: 'opacity .15s ease',
              minWidth: 0, flex: 1,
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Jordan Maxwell</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>jordan@maxwell.co</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopNav({ active, onNav }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'var(--bg)',
      borderBottom: '1px solid var(--line)',
      padding: '0 32px',
      height: 56,
      display: 'flex', alignItems: 'center', gap: 32,
    }}>
      <Wordmark collapsed={false} />
      <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
        {NAV.map(item => (
          <button key={item.id}
            onClick={() => !item.soon && onNav(item.id)}
            style={{
              border: 0, background: 'transparent',
              padding: '6px 12px', borderRadius: 6,
              color: active === item.id ? 'var(--ink)' : 'var(--ink-3)',
              font: 'inherit', fontSize: 13, fontWeight: 500,
              cursor: item.soon ? 'default' : 'pointer',
              opacity: item.soon ? 0.5 : 1,
            }}
          >{item.label}</button>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--ink-2), var(--ink))',
        color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 600,
      }}>JM</div>
    </header>
  );
}

function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div style={{ marginBottom: 'var(--gap-section)' }}>
      <div className="row-between" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <div style={{
              fontSize: 11, fontWeight: 500,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
              fontFamily: 'var(--font-mono)',
            }}>{eyebrow}</div>
          )}
          <h1>{title}</h1>
          {subtitle && <p style={{ marginTop: 8, color: 'var(--ink-3)', maxWidth: 580 }}>{subtitle}</p>}
        </div>
        {actions && <div className="row" style={{ gap: 8 }}>{actions}</div>}
      </div>
    </div>
  );
}

window.Sidebar = Sidebar;
window.TopNav = TopNav;
window.PageHeader = PageHeader;
window.NAV = NAV;
