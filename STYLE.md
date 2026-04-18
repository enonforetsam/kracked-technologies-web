# Kracked Technologies — Design System

The visual language of Mission Control. Light-emerald HUD: compact, data-dense,
operator-grade. This doc is the source of truth — edit it when conventions
change, and update the CSS to match.

---

## Principles

1. **Compact by default.** Padding is cheap; white space is expensive.
   Default card padding is 12–14px, not 20+. Dense reads as serious.
2. **One panel language everywhere.** Every major box uses the HUD panel
   treatment — square-ish 4px radius, hairline border, L-shaped corner
   brackets in the panel's accent color.
3. **Every page starts with a `<PageHeader>`.** Eyebrow (mono, uppercase) +
   serif title + subtitle + inline SVG visual. No ad-hoc `<h1>` blocks.
4. **Mono for data, Geist for prose, serif for titles.** JetBrains Mono on
   anything numeric, technical, or label-shaped. Geist for body text.
   Instrument Serif for top-of-page titles. Bricolage Grotesque for chapter
   / section display headings.
5. **Hover = faint accent glow, never a border swap.** Hover states emit a
   low-opacity glow via `box-shadow`. Borders stay stable. Emerald theme
   uses deep forest greens on hover (`#047857`, `#065f46`).
6. **LEDs for status, countdowns for dates.** A pulsing colored dot beats a
   text label. `T-7d` beats "soon".
7. **Light-emerald primary, dark themes as alternates.** The default theme
   is light emerald with a subtle mint grid backdrop. Cyberpunk, midnight,
   sunset remain available via the settings picker.
8. **Tabs are simple.** Pill-background hover + active — no underglows,
   no accent bars on the side.

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

## Page structure (every tab follows this)

```jsx
<div className="xxx-page">
  <PageHeader
    eyebrow="MONO · UPPERCASE · METADATA"
    title="Page Title"
    subtitle="One-sentence description of what this page is for."
    visual="control | strategy | vision | graph | wiki | competitors"
  />

  {/* Page content as mc-card panels */}
  <div className="mc-card glass mc-card-wide">
    ...
  </div>
</div>
```

Rules:
- **Every tab uses `<PageHeader>`.** No ad-hoc page titles.
- **Content goes in `.mc-card glass`** panels. Never render raw prose at the
  page level — always inside a bracketed container.
- **Use `.mc-card-wide`** when the panel should span full width.
- **Consistent page padding:** 14px top, 22px sides, 24px bottom, max-width
  1280px, centered. Enforced globally via `.mc-inner, .strategy-page,
  .vision-page, .competitors-page, .article-page`.

## Components

| Component | Purpose |
|---|---|
| `<PageHeader>` | Top of every page. Accepts `eyebrow`, `title`, `subtitle`, `visual` |
| `<WhatIfReader>` / `<VisionPage>` | Chapter-by-chapter long-form reader |
| `<CardHeader>` | Small card header (icon + title + count) |
| `<StatusDot>` | Colored dot indicating a deal/venture status |

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

### Per-page checklist

When adding a new page:
1. Create `src/pages/XxxPage.jsx`
2. Import `PageHeader` from `../components/PageHeader`
3. Render `<PageHeader>` as the first child of the page root `<div>`
4. Wrap body content in `.mc-card glass mc-card-wide` panels
5. Register the route in `App.jsx`
6. Add a nav tab with a 16×16 SVG icon matching the existing style
7. Add a `visual` entry in `PageHeader.jsx`'s `VISUALS` object if new

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
