const VISUALS = {
  control: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="8" y="10" width="104" height="80" rx="2" opacity="0.25" />
      <rect x="14" y="18" width="44" height="28" rx="1" />
      <rect x="62" y="18" width="44" height="28" rx="1" opacity="0.5" />
      <rect x="14" y="52" width="92" height="30" rx="1" opacity="0.35" />
      <circle cx="20" cy="24" r="1.5" fill="currentColor" />
      <circle cx="26" cy="24" r="1.5" fill="currentColor" opacity="0.5" />
      <line x1="14" y1="36" x2="42" y2="36" strokeDasharray="2 2" />
      <line x1="62" y1="30" x2="80" y2="30" />
      <line x1="62" y1="36" x2="100" y2="36" opacity="0.5" />
      <line x1="14" y1="68" x2="60" y2="68" strokeDasharray="3 3" opacity="0.7" />
      <line x1="14" y1="74" x2="72" y2="74" opacity="0.4" />
    </svg>
  ),
  strategy: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="20" cy="78" r="4" fill="currentColor" />
      <circle cx="50" cy="58" r="4" />
      <circle cx="80" cy="38" r="4" />
      <circle cx="105" cy="18" r="4" fill="currentColor" opacity="0.8" />
      <line x1="20" y1="78" x2="50" y2="58" />
      <line x1="50" y1="58" x2="80" y2="38" />
      <line x1="80" y1="38" x2="105" y2="18" />
      <path d="M 8 90 L 115 90" opacity="0.35" />
      <path d="M 8 90 L 8 10" opacity="0.35" />
      <path d="M 20 90 L 20 82" opacity="0.5" />
      <path d="M 50 90 L 50 62" opacity="0.5" />
      <path d="M 80 90 L 80 42" opacity="0.5" />
      <path d="M 105 90 L 105 22" opacity="0.5" />
    </svg>
  ),
  vision: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="60" cy="50" r="34" />
      <circle cx="60" cy="50" r="24" opacity="0.6" />
      <circle cx="60" cy="50" r="14" opacity="0.35" />
      <circle cx="60" cy="50" r="4" fill="currentColor" />
      <line x1="60" y1="12" x2="60" y2="22" />
      <line x1="60" y1="78" x2="60" y2="88" />
      <line x1="22" y1="50" x2="32" y2="50" />
      <line x1="88" y1="50" x2="98" y2="50" />
      <path d="M 32 22 L 38 28" />
      <path d="M 82 22 L 88 28" />
      <path d="M 32 78 L 38 72" />
      <path d="M 82 78 L 88 72" />
    </svg>
  ),
  graph: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="60" cy="50" r="5" fill="currentColor" />
      <circle cx="25" cy="25" r="3" fill="currentColor" />
      <circle cx="95" cy="28" r="3" fill="currentColor" />
      <circle cx="20" cy="75" r="3" fill="currentColor" />
      <circle cx="98" cy="75" r="3" fill="currentColor" />
      <circle cx="60" cy="10" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="60" cy="90" r="3" fill="currentColor" opacity="0.7" />
      <line x1="60" y1="50" x2="25" y2="25" />
      <line x1="60" y1="50" x2="95" y2="28" />
      <line x1="60" y1="50" x2="20" y2="75" opacity="0.6" />
      <line x1="60" y1="50" x2="98" y2="75" opacity="0.6" />
      <line x1="60" y1="50" x2="60" y2="10" opacity="0.4" />
      <line x1="60" y1="50" x2="60" y2="90" opacity="0.4" />
      <line x1="25" y1="25" x2="60" y2="10" strokeDasharray="2 2" opacity="0.4" />
      <line x1="95" y1="28" x2="60" y2="10" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  wiki: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="14" y="14" width="38" height="50" rx="1" />
      <rect x="58" y="14" width="38" height="50" rx="1" opacity="0.55" />
      <rect x="36" y="36" width="38" height="50" rx="1" opacity="0.75" />
      <line x1="42" y1="46" x2="68" y2="46" />
      <line x1="42" y1="54" x2="68" y2="54" opacity="0.7" />
      <line x1="42" y1="62" x2="60" y2="62" opacity="0.5" />
      <line x1="42" y1="70" x2="68" y2="70" opacity="0.8" />
      <line x1="42" y1="78" x2="56" y2="78" opacity="0.4" />
    </svg>
  ),
  competitors: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="30" cy="50" r="22" opacity="0.55" />
      <circle cx="60" cy="50" r="22" />
      <circle cx="90" cy="50" r="22" opacity="0.4" />
      <line x1="8" y1="50" x2="114" y2="50" strokeDasharray="3 3" opacity="0.4" />
      <circle cx="60" cy="50" r="3" fill="currentColor" />
      <circle cx="30" cy="50" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="90" cy="50" r="2" fill="currentColor" opacity="0.5" />
      <text x="60" y="18" fontFamily="monospace" fontSize="8" fill="currentColor" textAnchor="middle" opacity="0.7">KRACKED</text>
      <text x="60" y="90" fontFamily="monospace" fontSize="7" fill="currentColor" textAnchor="middle" opacity="0.5">MALAYSIA</text>
    </svg>
  ),
}

export default function PageHeader({ eyebrow, title, subtitle, visual }) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        {eyebrow && (
          <div className="page-header-eyebrow">
            <span className="hud-led hud-led-green" />
            {eyebrow}
          </div>
        )}
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {visual && VISUALS[visual] && (
        <div className="page-header-visual">
          {VISUALS[visual]}
        </div>
      )}
    </div>
  )
}
