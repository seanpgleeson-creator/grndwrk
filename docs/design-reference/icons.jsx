// Lightweight stroke icons (Lucide-style, sized via currentColor)
// All 16x16 viewBox, 1.5 stroke for crispness at small sizes.

const Icon = ({ d, size = 16, stroke = 1.5, fill, children, ...rest }) => (
  <svg
    width={size} height={size} viewBox="0 0 16 16"
    fill={fill || "none"}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const I = {
  Dashboard: (p) => <Icon {...p}><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></Icon>,
  User:      (p) => <Icon {...p}><circle cx="8" cy="5.5" r="2.75"/><path d="M2.5 13.5c.8-2.4 3-3.75 5.5-3.75s4.7 1.35 5.5 3.75"/></Icon>,
  Building:  (p) => <Icon {...p}><rect x="3" y="2.5" width="10" height="11" rx="1"/><path d="M6 5.5h1M9 5.5h1M6 8h1M9 8h1M6 10.5h1M9 10.5h1"/></Icon>,
  Target:    (p) => <Icon {...p}><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2.5"/></Icon>,
  Dollar:    (p) => <Icon {...p}><path d="M8 1.5v13M11 4.5H6.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H4.5"/></Icon>,
  Mail:      (p) => <Icon {...p}><rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="m2.5 5 5.5 4 5.5-4"/></Icon>,
  Search:    (p) => <Icon {...p}><circle cx="7" cy="7" r="4.5"/><path d="m13.5 13.5-3-3"/></Icon>,
  Plus:      (p) => <Icon {...p}><path d="M8 3v10M3 8h10"/></Icon>,
  Check:     (p) => <Icon {...p}><path d="m3 8.5 3 3 7-7"/></Icon>,
  Chevron:   (p) => <Icon {...p}><path d="m6 4 4 4-4 4"/></Icon>,
  ChevronD:  (p) => <Icon {...p}><path d="m4 6 4 4 4-4"/></Icon>,
  ArrowRight:(p) => <Icon {...p}><path d="M3 8h10M9 4l4 4-4 4"/></Icon>,
  ArrowUp:   (p) => <Icon {...p}><path d="M8 13V3M4 7l4-4 4 4"/></Icon>,
  Settings:  (p) => <Icon {...p}><circle cx="8" cy="8" r="2"/><path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1.05 1.05M4.45 11.55 3.4 12.6M12.6 12.6l-1.05-1.05M4.45 4.45 3.4 3.4"/></Icon>,
  Moon:      (p) => <Icon {...p}><path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"/></Icon>,
  Sparkle:   (p) => <Icon {...p}><path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2"/></Icon>,
  More:      (p) => <Icon {...p}><circle cx="3.5" cy="8" r=".75" fill="currentColor"/><circle cx="8" cy="8" r=".75" fill="currentColor"/><circle cx="12.5" cy="8" r=".75" fill="currentColor"/></Icon>,
  Filter:    (p) => <Icon {...p}><path d="M2 3.5h12M4 8h8M6.5 12.5h3"/></Icon>,
  Calendar:  (p) => <Icon {...p}><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/></Icon>,
  TrendUp:   (p) => <Icon {...p}><path d="M2 11.5 6 7.5l3 3 5-6M10 5.5h4v4"/></Icon>,
  Briefcase: (p) => <Icon {...p}><rect x="2" y="4.5" width="12" height="9" rx="1.5"/><path d="M5.5 4.5V3.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1"/></Icon>,
  Bookmark:  (p) => <Icon {...p}><path d="M3.5 2.5h9v11l-4.5-3-4.5 3z"/></Icon>,
  Globe:     (p) => <Icon {...p}><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c1.7 1.5 2.5 3.5 2.5 5.5s-.8 4-2.5 5.5C6.3 12 5.5 10 5.5 8s.8-4 2.5-5.5z"/></Icon>,
  Edit:      (p) => <Icon {...p}><path d="M11.5 2.5 13.5 4.5 5 13l-3 .5.5-3z"/></Icon>,
  Logo:      (p) => <Icon {...p}><rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" stroke="none"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" stroke="none"/><rect x="2" y="9" width="5" height="5" rx="1"/></Icon>,
};

window.I = I;
window.Icon = Icon;
