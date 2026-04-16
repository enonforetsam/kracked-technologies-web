# Kracked Technologies — Design System

The visual language of Mission Control. Cyberpunk mission-brief HUD: compact,
data-dense, operator-grade. This doc is the source of truth — edit it when
conventions change, and update the CSS to match.

---

## Principles

1. **Compact by default.** Padding is cheap; white space is expensive.
   Default card padding is 12–14px, not 20+. Dense reads as serious.
2. **One panel language everywhere.** Every major box uses the HUD panel
   treatment — square-ish 4px radius, hairline border, L-shaped corner
   brackets in the panel's accent color.
3. **Mono for data, Inter for prose.** JetBrains Mono on anything numeric,
   technical, or label-shaped (metric values, timestamps, codenames, status
   text, KV keys). Inter on anything meant to be read as sentences.
4. **Hover = faint glow, never blue outline.** Hover states emit a low-opacity
   accent glow via `box-shadow`. Borders stay stable. Saves the user's visual
   cortex from sudden border-color flashes.
5. **LEDs for status, countdowns for dates.** A pulsing colored dot beats a
   text label. `T-7d` beats "soon".
6. **Dark-first, light as fallback.** The system was designed for dark
   themes (cyberpunk, midnight, emerald, sunset). Light mode uses the same
   structure but without glows/scanlines.

---

## Tokens

### Colors (from CSS variables)
| Token | Usage |
|---|---|
| `--bg` | Page background |
| `--bg-surface` | Subtle raised surface |
| `--bg-elevated` | Panel background |
| `--text` | Body text |
| `--text-bright` | Emphasised text, headlines |
| `--text-secondary` | Secondary text |
| `--text-tertiary` | Labels, meta, mono strips |
| `--blue` | Primary accent — per-theme (cyan in cyberpunk, lavender in midnight, etc.) |
| `--accent` | Secondary accent — magenta family |
| `--border` | Hairline borders |
| `--success` | Success / live status |

### HUD-specific
| Token | Value | Usage |
|---|---|---|
| `--font-mono` | `'JetBrains Mono', SF Mono, Menlo, monospace` | Labels, data |
| `--hud-bracket` | `10px` | Length of corner bracket arms |
| `--hud-bracket-width` | `1.5px` | Thickness of corner brackets |

### Radius
- `--radius-xs: 2px` — pills, chips
- `--radius-sm: 6px` — buttons
- **Panels: 4px** — HUD panel convention (not the legacy `--radius-md: 10px`)
- `--radius-pill: 99999px` — status pills, countdown badges

### Typography
| Class / element | Family | Size | Case | Letter-spacing |
|---|---|---|---|---|
| Thesis headline (`.strategy-thesis`, `.q2plan-thesis`) | Inter 700 | 20–28px | Sentence | -0.02em |
| Codename (`.hud-codename`, card titles) | Mono 600 | 10.5–11.5px | UPPER | 0.14em |
| Data ribbon (`.hud-ribbon`) | Mono 400 | 10.5px | UPPER | 0.12em |
| Metric value (`.mc-metric-value`) | Mono 600 | 22px | — | — |
| Metric label (`.mc-metric-label`) | Mono 400 | 10px | UPPER | 0.1em |
| List name (`.mc-list-name`) | Inter 400 | 13px | Sentence | — |
| List meta (`.mc-list-status`, `.mc-list-domain`) | Mono 400 | 10.5px | — | 0.05em |
| Section label (`.strategy-section-label`, `.hud-collapse summary`) | Mono 600 | 10–11px | UPPER | 0.12–0.14em |
| Body / article | Inter 400 | 14–14.5px | Sentence | — |

### Spacing
- Card padding: `12–14px` inline, `10px` block
- Section gap: `8–10px`
- List row padding: `6px 10px`
- Avoid margins >16px unless it's a section break

---

## HUD primitive classes

All defined at the end of `styles.css`. Reusable site-wide — compose onto
any element.

| Class | What it does |
|---|---|
| `.hud-frame` + `.hud-corners` | L-shaped corner brackets (4 corners) |
| `.hud-ribbon` | Mono data strip. Wrap children in `<span>`, separate with `<span class="hud-ribbon-sep" />` |
| `.hud-ribbon-hot` | Highlight a single span in the accent color |
| `.hud-led` + `.hud-led-{green\|amber\|red\|blue}` | Pulsing status dot |
| `.hud-led-static` | Disable the pulse |
| `.hud-codename` + `.hud-codename-num` | Per-panel identifier (`PILLAR 01 // KRACKED DEVS`) |
| `.hud-countdown` + `-past` / `-hot` | `T-7d` badge |
| `.hud-collapse` | Styled `<details>`. Pair `<summary>` with `.hud-collapse-count` pill |

### Example composition

```jsx
<div className="hud-frame" style={{ '--hud-accent': '#22d3ee' }}>
  <span className="hud-corners" />
  <div className="hud-codename">
    <span className="hud-led hud-led-green" /> PILLAR 01 // KRACKED DEVS
  </div>
  <p>...content...</p>
</div>
```

---

## Panel rules — the "every box looks the same" contract

Every major container — Mission Control cards, Strategy pillars, collapsibles,
the metric ribbon, the What If reader, modal bodies — follows:

1. `border-radius: 4px` (not 10+)
2. `border: 1px solid color-mix(in srgb, var(--border) 70-80%, transparent)`
3. `background: color-mix(in srgb, var(--bg-elevated) 40%, transparent)`
4. **L-shaped corner brackets** in the panel's accent color (via
   `::before`/`::after` + `.hud-corners::before`/`::after`)
5. **Hover glow, not border swap:** `box-shadow: 0 0 0 1px accent-alpha, 0 8px 28px accent-glow-alpha`. The border does not change color.
6. If clickable, add `cursor: pointer` and a `:focus-visible` ring
7. Mono type on headers and labels; Inter on content

Applied globally via the `.mc-card`, `.mc-collapsible`, `.strategy-pillar`,
`.mc-metrics`, `.mc-whatif-card` overrides at the bottom of `styles.css`.

---

## Interaction patterns

### Hover
- **Faint glow** via `box-shadow` using the panel's accent.
- `transition: box-shadow 0.18s ease, transform 0.18s ease`.
- Optional `transform: translateY(-1px)` on clickable cards.
- **Never** change border color on hover — only opacity or shadow.

### Focus
- `:focus-visible` shows a 2px outline in `--blue`, offset 2px.

### Active / pressed
- `transform: translateY(0)` + slightly increase shadow opacity.

### Status indicators
- **Live / active:** green LED, pulsing
- **Pending / waiting:** amber LED, pulsing
- **Blocked / hot:** red LED, pulsing
- **Neutral / informational:** blue LED, pulsing
- **Historical / done:** gray or colored dot, `hud-led-static` (no pulse)

---

## Layout

### Page
- Max width: full (no inner container above `--page-max` unless the route
  explicitly wants it)
- Page padding: `14–18px` top/bottom, `16–24px` horizontal
- Stacks vertically with `gap: 8–10px` between major sections

### Mission Control
1. **This Week** (banner, always open)
2. **Q2 Plan** ribbon + thesis + pillars + milestones
3. **Metrics ribbon** (5-col mono strip)
4. **Tenders & Ventures** side-by-side
5. **Roadmap** (3-col now/next/later)
6. **Agents & Skills** (collapsible)
7. **Row 3**: Advisory Board / KD Academy / Revenue (all collapsibles, Revenue open)
8. **What If** reader (chapter nav)

### Strategy
1. Mission-brief hero (ribbon + thesis + parent op + pillars + milestones)
2. Strategy-doc tabs
3. Active doc body with TOC (if ≥3 headings)

### Graph / Article
- Retain existing layouts; inherit HUD typography via global overrides.

---

## When adding a new panel

1. Reach for **existing classes first** — `.mc-card`, `.mc-collapsible`, or
   the primitives.
2. If genuinely new: use `4px` radius, hairline border, corner brackets,
   mono header.
3. Hover = glow, never border swap.
4. Run it past this doc before merging.
