// Main app — wires tweaks + routing
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "dashboard",
  "type": "sans",
  "theme": "neutral",
  "density": "balanced",
  "sidebarMode": "rail",
  "formStyle": "bordered",
  "dark": false
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useState(t.screen || 'dashboard');

  // Apply theme attrs to body
  useEffect(() => {
    document.body.dataset.type    = t.type;
    document.body.dataset.theme   = t.theme;
    document.body.dataset.density = t.density;
    document.body.dataset.form    = t.formStyle;
    document.body.classList.toggle('dark', !!t.dark);
  }, [t.type, t.theme, t.density, t.formStyle, t.dark]);

  const onNav = (id) => {
    setActive(id);
    setTweak('screen', id);
  };

  // sync if tweak changes screen
  useEffect(() => { if (t.screen && t.screen !== active) setActive(t.screen); }, [t.screen]);

  const showTopNav = t.sidebarMode === 'top';

  const Screens = {
    dashboard:     () => <Dashboard onNav={onNav} />,
    profile:       () => <Profile />,
    companies:     () => <Companies />,
    opportunities: () => <Opportunities />,
    compensation:  () => <PlaceholderScreen title="Compensation" subtitle="Benchmark targets, leverage, and equity scenarios." icon="Dollar" />,
  };

  const Screen = Screens[active] || Screens.dashboard;

  return (
    <>
      <div className="app" style={{ flexDirection: showTopNav ? 'column' : 'row' }}>
        {showTopNav
          ? <TopNav active={active} onNav={onNav} />
          : <Sidebar active={active} onNav={onNav} sidebarMode={t.sidebarMode} />}
        <main style={{
          flex: 1,
          minWidth: 0,
          padding: 'var(--pad-y) var(--pad-x)',
          maxWidth: '100%',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Screen key={active} />
          </div>
        </main>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Screen" />
        <TweakSelect label="Show" value={active}
          options={[
            { value: 'dashboard', label: 'Dashboard' },
            { value: 'profile', label: 'Profile & positioning' },
            { value: 'companies', label: 'Companies' },
            { value: 'opportunities', label: 'Opportunities' },
            { value: 'compensation', label: 'Compensation' },
          ]}
          onChange={(v) => onNav(v)} />

        <TweakSection label="Typography" />
        <TweakRadio label="Headlines" value={t.type}
          options={[
            { value: 'sans', label: 'Sans' },
            { value: 'serif-heads', label: 'Serif' },
            { value: 'mono-accents', label: 'Mono labels' },
          ]}
          onChange={(v) => setTweak('type', v)} />

        <TweakSection label="Color" />
        <TweakRadio label="Theme" value={t.theme}
          options={[
            { value: 'neutral', label: 'Neutral' },
            { value: 'warm', label: 'Warm' },
            { value: 'cool', label: 'Cool' },
            { value: 'accent', label: 'Accent' },
          ]}
          onChange={(v) => setTweak('theme', v)} />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'spacious', label: 'Spacious' },
          ]}
          onChange={(v) => setTweak('density', v)} />
        <TweakRadio label="Sidebar" value={t.sidebarMode}
          options={[
            { value: 'rail', label: 'Rail' },
            { value: 'full', label: 'Full' },
            { value: 'top', label: 'Top' },
          ]}
          onChange={(v) => setTweak('sidebarMode', v)} />

        <TweakSection label="Forms" />
        <TweakRadio label="Field style" value={t.formStyle}
          options={[
            { value: 'bordered', label: 'Bordered' },
            { value: 'filled', label: 'Filled' },
            { value: 'underlined', label: 'Underlined' },
          ]}
          onChange={(v) => setTweak('formStyle', v)} />
      </TweaksPanel>
    </>
  );
}

function PlaceholderScreen({ title, subtitle, icon }) {
  return (
    <div className="screen">
      <PageHeader eyebrow="Module" title={title} subtitle={subtitle} />
      <div className="card" style={{
        padding: '80px 32px', textAlign: 'center',
        background: 'var(--bg-sub)', borderStyle: 'dashed',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          margin: '0 auto 18px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-2)',
        }}>{React.createElement(I[icon] || I.Sparkle, { size: 22 })}</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 6 }}>Module preview</div>
        <p style={{ color: 'var(--ink-3)' }}>This module is part of the redesign system. Use the tweaks panel to switch styles.</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
