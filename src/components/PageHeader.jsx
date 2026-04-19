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
  hosting: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      {/* Globe with latitude/longitude */}
      <circle cx="60" cy="50" r="32" />
      <ellipse cx="60" cy="50" rx="32" ry="14" opacity="0.6" />
      <line x1="28" y1="50" x2="92" y2="50" opacity="0.5" />
      <line x1="60" y1="18" x2="60" y2="82" opacity="0.5" />
      {/* Distributed nodes around the globe */}
      <circle cx="22" cy="26" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="98" cy="26" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="22" cy="74" r="3" fill="currentColor" opacity="0.65" />
      <circle cx="98" cy="74" r="3" fill="currentColor" opacity="0.65" />
      <circle cx="60" cy="8" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="60" cy="92" r="2.5" fill="currentColor" opacity="0.7" />
      {/* Edge connections */}
      <line x1="25" y1="28" x2="38" y2="40" strokeDasharray="2 2" opacity="0.45" />
      <line x1="95" y1="28" x2="82" y2="40" strokeDasharray="2 2" opacity="0.45" />
      <line x1="25" y1="72" x2="38" y2="60" strokeDasharray="2 2" opacity="0.45" />
      <line x1="95" y1="72" x2="82" y2="60" strokeDasharray="2 2" opacity="0.45" />
      <line x1="60" y1="11" x2="60" y2="18" strokeDasharray="1.5 1.5" opacity="0.4" />
      <line x1="60" y1="89" x2="60" y2="82" strokeDasharray="1.5 1.5" opacity="0.4" />
      {/* Pulsing core */}
      <circle cx="60" cy="50" r="6" fill="currentColor" />
      <circle cx="60" cy="50" r="10" opacity="0.3" />
    </svg>
  ),
  krackedos: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      {/* Central brain / core */}
      <circle cx="60" cy="50" r="10" />
      <circle cx="60" cy="50" r="4" fill="currentColor" />
      {/* Six agent nodes around */}
      <circle cx="60" cy="18" r="5" />
      <circle cx="88" cy="34" r="5" />
      <circle cx="88" cy="66" r="5" />
      <circle cx="60" cy="82" r="5" />
      <circle cx="32" cy="66" r="5" />
      <circle cx="32" cy="34" r="5" />
      {/* Connecting lines — agent-to-core */}
      <line x1="60" y1="23" x2="60" y2="40" opacity="0.5" />
      <line x1="83" y1="36" x2="69" y2="45" opacity="0.5" />
      <line x1="83" y1="64" x2="69" y2="55" opacity="0.5" />
      <line x1="60" y1="77" x2="60" y2="60" opacity="0.5" />
      <line x1="37" y1="64" x2="51" y2="55" opacity="0.5" />
      <line x1="37" y1="36" x2="51" y2="45" opacity="0.5" />
      {/* Human operator — paired with one agent */}
      <circle cx="104" cy="34" r="2.5" fill="currentColor" opacity="0.65" />
      <line x1="92" y1="34" x2="102" y2="34" strokeDasharray="1.5 1.5" opacity="0.55" />
    </svg>
  ),
  partnerships: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      {/* Two interlocking rings representing shared values */}
      <circle cx="45" cy="50" r="22" />
      <circle cx="75" cy="50" r="22" opacity="0.7" />
      {/* Handshake / bridge between them */}
      <line x1="45" y1="50" x2="75" y2="50" strokeDasharray="2 2" opacity="0.5" />
      <circle cx="60" cy="50" r="3" fill="currentColor" />
      {/* Satellite nodes around — partners */}
      <circle cx="20" cy="28" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="100" cy="28" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="20" cy="72" r="2.5" fill="currentColor" opacity="0.55" />
      <circle cx="100" cy="72" r="2.5" fill="currentColor" opacity="0.55" />
      <line x1="23" y1="30" x2="45" y2="50" opacity="0.35" />
      <line x1="97" y1="30" x2="75" y2="50" opacity="0.35" />
      <line x1="23" y1="70" x2="45" y2="50" opacity="0.3" />
      <line x1="97" y1="70" x2="75" y2="50" opacity="0.3" />
    </svg>
  ),
  kampung: (
    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2">
      {/* Hexagonal mesh — kampung as connected nodes */}
      <polygon points="30,20 42,27 42,41 30,48 18,41 18,27" opacity="0.6" />
      <polygon points="60,20 72,27 72,41 60,48 48,41 48,27" />
      <polygon points="90,20 102,27 102,41 90,48 78,41 78,27" opacity="0.6" />
      <polygon points="45,50 57,57 57,71 45,78 33,71 33,57" opacity="0.75" />
      <polygon points="75,50 87,57 87,71 75,78 63,71 63,57" opacity="0.75" />
      {/* Connecting lines */}
      <line x1="42" y1="34" x2="48" y2="34" opacity="0.5" />
      <line x1="72" y1="34" x2="78" y2="34" opacity="0.5" />
      <line x1="42" y1="41" x2="45" y2="50" opacity="0.5" />
      <line x1="57" y1="50" x2="60" y2="48" opacity="0.5" />
      <line x1="75" y1="50" x2="72" y2="48" opacity="0.5" />
      <line x1="87" y1="57" x2="90" y2="48" opacity="0.5" />
      {/* Central node — the treasury / heart */}
      <circle cx="60" cy="34" r="3" fill="currentColor" />
      <circle cx="30" cy="34" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="90" cy="34" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="45" cy="64" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="75" cy="64" r="2" fill="currentColor" opacity="0.6" />
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
