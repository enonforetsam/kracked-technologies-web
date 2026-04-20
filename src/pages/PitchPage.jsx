import { useState, useEffect, useMemo, useRef } from 'react'

// ============================================================================
// Static pitch data — kept in code so the visual layout stays controlled.
// Narrative text comes from the vault note; structured data lives here.
// ============================================================================

const LOOP_STAGES = [
  {
    n: '01',
    label: 'Train the rakyat',
    detail: 'The academy takes any Malaysian who wants to learn — kampung teen, corporate engineer, civil servant — and builds them into AI-literate builders. Free at the entry. Weekly. Open.',
    c1: 'var(--emerald)', c2: 'var(--emerald-deep)',
  },
  {
    n: '02',
    label: 'Supply the talent',
    detail: 'Every graduate joins the verified builder community. 1,190 strong today. Institutions that need AI capacity pull from here, with zero agency fee and a 48-hour shortlist.',
    c1: 'var(--cyan)', c2: 'var(--emerald)',
  },
  {
    n: '03',
    label: 'Ship the systems',
    detail: 'Bespoke AI builds for government, defence, and GLC clients. Malaysian code, Malaysian IP, Malaysian team. No foreign dependencies. No offshore leakage.',
    c1: 'var(--violet)', c2: 'var(--cyan)',
  },
  {
    n: '04',
    label: 'Teach institutions',
    detail: 'Sovereign AI lab programme for officers, civil servants, and enterprise staff. They go from "never touched AI" to "shipping useful software" in weeks. We leave the skill behind.',
    c1: 'var(--magenta)', c2: 'var(--violet)',
  },
]

const PROOF_CARDS = [
  { value: '1,190+', label: 'Vetted Malaysian builders', detail: 'Community across KL, Selangor, Penang, Johor. Verified builds, not just CVs.' },
  { value: '3', label: 'Advisors in uniform, policy, and capital', detail: 'Major Dr. Surenthiran (MAF), Azlan Ismail (MyDIGITAL), Faiz Hassan (Cradle).' },
  { value: '7', label: 'Ventures building under Kracked Labs', detail: 'rotican.ai, cofounders.my, JomKopi, JomQR, MYpeta, Burhan, Masjid OS.' },
  { value: '0', label: 'Foreign equity', detail: 'Malaysian-owned and Malaysian-governed. No capital table captureable by non-Malaysian interests.' },
  { value: 'Live', label: 'Our own AI operating system', detail: 'We run Kracked OS internally. Every agent in our pitch is one we use daily. We sell what we use.' },
  { value: 'In app.', label: 'MDEC Malaysia Digital status', detail: 'In application. Qualifying digital activity. Tax incentive alignment.' },
  { value: 'Weekly', label: 'Vibe 101 academy sessions', detail: 'Free. Live. Open to any Malaysian. Entry point of the whole loop.' },
  { value: 'Active', label: 'Pipeline with MDEC, MRANTI, Cradle', detail: 'Documented engagements across the Malaysian innovation apparatus.' },
]

const AUDIENCES = [
  {
    id: 'military',
    label: 'Military',
    opener: 'You need AI capability inside the service, not a foreign contractor selling time.',
    proof: [
      'Advisor inside the Malaysian Armed Forces — Major Dr. Surenthiran Krishnan, Signal Corps.',
      'Citizens-only build teams. Per-engagement clearance compatibility.',
      'Non-negotiable ethics: defensive, administrative, training, logistical AI. No autonomous weapons targeting.',
    ],
    ask: 'Start with one scoped pilot under RM 500k. One division. One outcome. Earn the next conversation.',
  },
  {
    id: 'government',
    label: 'Government',
    opener: 'The MyDIGITAL target is 500,000 digital economy jobs by 2025. We are the builder ecosystem that produces them.',
    proof: [
      'Advisor inside MyDIGITAL Corporation — Azlan Ismail, PMO State Director.',
      'Aligned with the Malaysia Digital Economy Blueprint.',
      'Our academy is the fastest path to raising AI literacy in the civil service.',
    ],
    ask: 'Add Kracked to the MyDIGITAL and MDEC programme register. Pilot the sovereign AI lab with one agency.',
  },
  {
    id: 'glcs',
    label: 'GLCs',
    opener: 'You are under pressure to digitise without losing sovereignty of your data or your IP.',
    proof: [
      'Malaysian-only staffing. Data residency defensible under PDPA.',
      'Kracked OS runs on Malaysian infrastructure. No foreign cloud for sensitive workloads.',
      'Delivery is priced for Malaysian procurement, not American consulting margins.',
    ],
    ask: 'One internal AI pilot. Sponsored by your digital transformation lead. Delivered in 12 weeks with a handover.',
  },
  {
    id: 'universities',
    label: 'Universities',
    opener: 'Your graduates enter a market where 40% of tech roles go unfilled because they cannot ship.',
    proof: [
      'Our vibe coding methodology closes the gap from syntax to shipping.',
      'Advisor inside Cradle Fund — Faiz Hassan, bridge to MYStartup and Tech Talents.',
      'HRD Corp-claimable workshops for corporate training, MOU-friendly for university integration.',
    ],
    ask: 'An MOU for embedded vibe coding modules and a joint cohort of 50 graduates by end of the academic year.',
  },
  {
    id: 'diaspora',
    label: 'Diaspora',
    opener: 'You moved for opportunity. We are building the reason to come home.',
    proof: [
      'Remote contribution pathways into live Malaysian projects.',
      'Advisory roles, not just board seats. Real impact on real ventures.',
      'A Malaysia you would invest in. Built by people you know.',
    ],
    ask: 'A two-hour call, quarterly. Open one door. That is all.',
  },
]

const PROBLEMS = [
  { key: 'government', label: '01 · CIVIL SERVICE', c1: 'var(--emerald)', c2: 'var(--emerald-deep)' },
  { key: 'military', label: '02 · DEFENCE & NATIONAL SECURITY', c1: 'var(--cyan)', c2: 'var(--emerald)' },
  { key: 'economy', label: '03 · RAKYAT & ECONOMY', c1: 'var(--violet)', c2: 'var(--cyan)' },
]

const OBJECTIONS = [
  {
    q: 'Are you a startup? We do not buy from startups.',
    a: 'We are a Malaysian company with a production AI operating system, a 1,190-member builder community, and advisors inside MAF, MyDIGITAL, and Cradle. We are an ecosystem, not a startup.',
  },
  {
    q: 'How do you deliver at the scale we need?',
    a: 'Start with a single scoped pilot under RM 500k. One division. One outcome. We deliver. We earn the next conversation. Scale is earned, not promised.',
  },
  {
    q: 'Why not use a foreign prime?',
    a: 'Offset credits get a foreign prime through procurement. They do not build Malaysian capability. We are the partner you loop in when the contract requires local IP, local staffing, or local capability transfer. We sit under a prime, not against one.',
  },
  {
    q: 'What security clearances do you hold?',
    a: 'We do not claim blanket clearances. We meet the clearance requirements of each specific engagement, per Malaysian citizen, per project. Citizenship-only staffing makes that straightforward.',
  },
  {
    q: 'What about ethics? AI in defence?',
    a: 'We build defensive, administrative, training, and logistical AI. We decline autonomous weapons targeting, mass surveillance without judicial oversight, and anything that abuses Malaysian citizens or others. Non-negotiable and codified.',
  },
]

// ============================================================================
// Content extractors — pull 3-liner and 60s from the vault markdown
// ============================================================================

function extractSection(content, heading) {
  if (!content) return null
  const re = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n---\\s*\\n|\\n##\\s+|$)`, 'i')
  const match = content.match(re)
  if (!match) return null
  return match[1].trim()
}

// Inline render: *italic* → <em>, `\` at end of line → <br />
function renderInline(text) {
  if (!text) return null
  const nodes = []
  const lines = text.split(/\\\s*\n/)
  lines.forEach((line, li) => {
    const parts = line.split(/(\*[^*\n]+\*)/g)
    parts.forEach((part, pi) => {
      if (!part) return
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        nodes.push(<em key={`${li}-${pi}-em`}>{part.slice(1, -1)}</em>)
      } else {
        nodes.push(part)
      }
    })
    if (li < lines.length - 1) nodes.push(<br key={`br-${li}`} />)
  })
  return nodes
}

// Split a problem-card section into headline (first **bold** line) and body
function splitCard(raw) {
  if (!raw) return { headline: '', body: '' }
  const parts = raw.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
  const first = parts[0] || ''
  const headline = first.replace(/^\*\*(.*)\*\*$/, '$1').trim()
  const body = parts.slice(1).join('\n\n').trim()
  return { headline, body }
}

// ============================================================================
// Page
// ============================================================================

export default function PitchPage({ graph }) {
  const node = graph.nodes.find(n => n.id === 'the-kracked-vision-an-advanced-future-for-malaysia')

  const threeLiner = useMemo(() => {
    const raw = node && extractSection(node.content, 'the-3-liner')
    if (!raw) return null
    return raw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  }, [node])

  const story = useMemo(() => {
    const raw = node && extractSection(node.content, 'the-60-second-story')
    if (!raw) return null
    return raw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  }, [node])

  const closing = useMemo(() => {
    const raw = node && extractSection(node.content, 'closing-line')
    return raw ? raw.trim() : null
  }, [node])

  const problem = useMemo(() => {
    if (!node) return null
    return {
      headline: extractSection(node.content, 'the-problem-headline'),
      lead: extractSection(node.content, 'the-problem-lead'),
      opportunity: extractSection(node.content, 'the-opportunity'),
      cards: PROBLEMS.map(p => ({
        ...p,
        ...splitCard(extractSection(node.content, `the-problem-${p.key}`)),
      })),
    }
  }, [node])

  const version = node?.version || 1
  const lastUpdated = node?.last_updated || '2026-04-20'

  const [activeAudience, setActiveAudience] = useState('military')
  const [openObjection, setOpenObjection] = useState(null)
  const [copied, setCopied] = useState(false)
  const threeLinerRef = useRef(null)

  // Keyboard shortcut: press "2" to jump to the 3-liner
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === '2') {
        threeLinerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const copyThreeLiner = async () => {
    if (!threeLiner) return
    await navigator.clipboard.writeText(threeLiner.join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollTo = (id) => (e) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pitch-page">
      {/* Side-rail anchor nav */}
      <nav className="pitch-rail">
        {[
          { id: 'pitch-hero', label: 'Open' },
          { id: 'pitch-problem', label: 'Problem' },
          { id: 'pitch-3liner', label: '3-liner', shortcut: '2' },
          { id: 'pitch-loop', label: 'Loop' },
          { id: 'pitch-story', label: 'Story' },
          { id: 'pitch-proof', label: 'Proof' },
          { id: 'pitch-audience', label: 'Audience' },
          { id: 'pitch-objections', label: 'Objections' },
        ].map(s => (
          <a key={s.id} href={`#${s.id}`} onClick={scrollTo(s.id)} className="pitch-rail-item">
            <span className="pitch-rail-dot" />
            <span className="pitch-rail-label">{s.label}{s.shortcut && <kbd>{s.shortcut}</kbd>}</span>
          </a>
        ))}
      </nav>

      {/* Section 1 — Hero */}
      <section id="pitch-hero" className="pitch-hero">
        <div className="pitch-hero-mesh" />
        <div className="pitch-hero-inner">
          <div className="pitch-eyebrow">THE KRACKED VISION</div>
          <h1 className="pitch-hero-title">
            An <em>Advanced Future</em><br />for Malaysia.
          </h1>
          <p className="pitch-hero-sub">
            Malaysia's sovereign AI builder. Owned by Malaysians. Staffed by Malaysians.
            Accountable to Malaysians.
          </p>
          <div className="pitch-hero-actions">
            <a href="#pitch-3liner" onClick={scrollTo('pitch-3liner')} className="pitch-btn pitch-btn-primary">Read the pitch ↓</a>
            <a href="#pitch-story" onClick={scrollTo('pitch-story')} className="pitch-btn">The 60-second story →</a>
          </div>
        </div>
      </section>

      {/* Section 2 — Problem & Opportunity */}
      <section id="pitch-problem" className="pitch-problem-section">
        <div className="pitch-section-label">THE PROBLEM · THE OPPORTUNITY</div>
        <h2 className="pitch-problem-headline">
          {problem?.headline
            ? renderInline(problem.headline)
            : <>AI is the <em>new industrial revolution</em>.<br />The skills are the spades.</>}
        </h2>
        <p className="pitch-problem-lead">
          {problem?.lead || 'This is a gold rush. The countries that teach their people to wield AI — and build with it — will define the next decade. The ones that do not will watch their talent, their IP, and their sovereignty leak to whoever owns the tools.'}
        </p>

        <div className="pitch-problem-sublabel">WHERE MALAYSIA IS EXPOSED</div>
        <div className="pitch-problem-grid">
          {(problem?.cards || PROBLEMS).map(p => (
            <div key={p.key} className="pitch-problem-card" style={{ '--c1': p.c1, '--c2': p.c2 }}>
              <div className="pitch-problem-card-label">{p.label}</div>
              {p.headline && <div className="pitch-problem-card-headline">{p.headline}</div>}
              {p.body && <div className="pitch-problem-card-body">{p.body}</div>}
            </div>
          ))}
        </div>

        <div className="pitch-problem-turn">
          <div className="pitch-problem-sublabel pitch-problem-sublabel-light">THE OPPORTUNITY</div>
          <p className="pitch-problem-opportunity">
            {problem?.opportunity || 'Malaysia has the population, the institutions, and the talent density to lead the region. What is missing is a builder ecosystem that is owned, staffed, and accountable to Malaysians. That is what Kracked Technologies is building — and how we turn the gold rush into a sovereign advantage instead of a foreign extraction.'}
          </p>
        </div>
      </section>

      {/* Section 3 — The 3-liner */}
      <section id="pitch-3liner" className="pitch-3liner-section" ref={threeLinerRef}>
        <div className="pitch-3liner-header">
          <div className="pitch-section-label">THE 3-LINER · MEMORISE VERBATIM</div>
          <button className="pitch-copy-btn" onClick={copyThreeLiner}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <div className="pitch-3liner-body">
          {threeLiner ? threeLiner.map((line, i) => (
            <p key={i} className={`pitch-3liner-line pitch-3liner-line-${i}`}>{line}</p>
          )) : <p style={{ opacity: 0.5 }}>Pitch content loading from vault…</p>}
        </div>
      </section>

      {/* Section 3 — The Loop */}
      <section id="pitch-loop" className="pitch-loop-section">
        <div className="pitch-section-label">THE LOOP · NOT A MENU</div>
        <div className="pitch-loop">
          {LOOP_STAGES.map((s, i) => (
            <div key={s.n} className="pitch-loop-stage" style={{ '--c1': s.c1, '--c2': s.c2 }}>
              <div className="pitch-loop-num">{s.n}</div>
              <div className="pitch-loop-label">{s.label}</div>
              <div className="pitch-loop-detail">{s.detail}</div>
              {i < LOOP_STAGES.length - 1 && <div className="pitch-loop-arrow">→</div>}
            </div>
          ))}
        </div>
        {closing && <div className="pitch-loop-close">{closing}</div>}
      </section>

      {/* Section 4 — The 60-second story */}
      <section id="pitch-story" className="pitch-story-section">
        <div className="pitch-story-head">
          <div className="pitch-section-label">THE 60-SECOND STORY</div>
          <div className="pitch-story-time">Read aloud · 1:00</div>
        </div>
        <div className="pitch-story-body">
          {story ? story.map((p, i) => (
            <p key={i} className="pitch-story-para">{p}</p>
          )) : <p style={{ opacity: 0.5 }}>Story content loading from vault…</p>}
        </div>
      </section>

      {/* Section 5 — Proof points */}
      <section id="pitch-proof" className="pitch-proof-section">
        <div className="pitch-section-label">PROOF POINTS · GRAB AND USE</div>
        <div className="pitch-proof-grid">
          {PROOF_CARDS.map((p, i) => (
            <div key={i} className="pitch-proof-card">
              <div className="pitch-proof-value">{p.value}</div>
              <div className="pitch-proof-label">{p.label}</div>
              <div className="pitch-proof-detail">{p.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6 — Audience tabs */}
      <section id="pitch-audience" className="pitch-audience-section">
        <div className="pitch-section-label">TAILORED BY AUDIENCE</div>
        <div className="pitch-audience-tabs">
          {AUDIENCES.map(a => (
            <button
              key={a.id}
              className={`pitch-audience-tab ${activeAudience === a.id ? 'is-active' : ''}`}
              onClick={() => setActiveAudience(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
        {AUDIENCES.filter(a => a.id === activeAudience).map(a => (
          <div key={a.id} className="pitch-audience-panel">
            <div className="pitch-audience-opener">{a.opener}</div>
            <div className="pitch-audience-sublabel">PROOF THAT LANDS FOR THIS ROOM</div>
            <ul className="pitch-audience-proof">
              {a.proof.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
            <div className="pitch-audience-sublabel">THE ASK</div>
            <div className="pitch-audience-ask">{a.ask}</div>
          </div>
        ))}
      </section>

      {/* Section 7 — Objection handling */}
      <section id="pitch-objections" className="pitch-objections-section">
        <div className="pitch-section-label">OBJECTIONS · HONEST ANSWERS</div>
        <div className="pitch-objections-list">
          {OBJECTIONS.map((o, i) => (
            <div key={i} className={`pitch-objection ${openObjection === i ? 'is-open' : ''}`}>
              <button
                className="pitch-objection-q"
                onClick={() => setOpenObjection(openObjection === i ? null : i)}
              >
                <span>{o.q}</span>
                <span className="pitch-objection-toggle">{openObjection === i ? '−' : '+'}</span>
              </button>
              {openObjection === i && <div className="pitch-objection-a">{o.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pitch-footer">
        <div className="pitch-footer-left">
          <span>Kracked Technologies</span>
          <span className="pitch-footer-sep">·</span>
          <span>Kuala Lumpur, Malaysia</span>
        </div>
        <div className="pitch-footer-right">
          <span>Version {version}</span>
          <span className="pitch-footer-sep">·</span>
          <span>Last updated {lastUpdated}</span>
        </div>
      </footer>

      <style>{`
        .pitch-page {
          position: relative;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(24px, 5vw, 72px);
        }

        .pitch-rail {
          position: fixed;
          right: clamp(16px, 3vw, 32px);
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pitch-rail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-tertiary, var(--fg-mute));
          text-decoration: none;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .pitch-rail-item:hover { opacity: 1; color: var(--emerald-deep, #047857); }
        .pitch-rail-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid currentColor;
          flex-shrink: 0;
        }
        .pitch-rail-label {
          display: none;
        }
        .pitch-rail-item:hover .pitch-rail-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .pitch-rail-item kbd {
          padding: 1px 5px;
          border: 1px solid currentColor;
          border-radius: 2px;
          font-size: 8.5px;
          font-family: inherit;
        }
        @media (max-width: 900px) { .pitch-rail { display: none; } }

        .pitch-eyebrow {
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 11px;
          letter-spacing: 0.24em;
          color: var(--emerald-deep, #047857);
          margin-bottom: 24px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .pitch-eyebrow::before {
          content: '';
          width: 24px;
          height: 1px;
          background: currentColor;
        }

        .pitch-section-label {
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 10.5px;
          letter-spacing: 0.22em;
          color: var(--fg-mute, rgba(10,46,26,0.5));
          margin-bottom: 32px;
          padding-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .pitch-section-label::before {
          content: '';
          width: 20px;
          height: 1px;
          background: var(--emerald-deep, #047857);
        }

        /* Hero */
        .pitch-hero {
          position: relative;
          min-height: 62vh;
          display: flex;
          align-items: center;
          padding: var(--s-8) 0 var(--s-6);
          overflow: hidden;
        }
        .pitch-hero-mesh {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image:
            radial-gradient(800px 600px at 80% 10%, color-mix(in srgb, var(--emerald, #10b981) 22%, transparent), transparent 60%),
            radial-gradient(600px 600px at 0% 60%, color-mix(in srgb, var(--cyan, #06d6c4) 16%, transparent), transparent 60%),
            radial-gradient(700px 500px at 100% 100%, color-mix(in srgb, var(--violet, #8a6bf0) 10%, transparent), transparent 60%);
          pointer-events: none;
        }
        .pitch-hero-inner { position: relative; z-index: 1; max-width: 980px; }
        .pitch-hero-title {
          font-family: 'Ovo', serif;
          font-weight: 400;
          font-size: var(--fs-display);
          line-height: var(--lh-tight);
          letter-spacing: -0.012em;
          color: var(--fg, #0a2e1a);
          margin-bottom: var(--s-5);
          padding: 0.04em 0 0.12em;
          max-width: var(--w-display);
        }
        .pitch-hero-title em {
          font-style: italic;
          background: linear-gradient(110deg, var(--emerald-deep, #047857), var(--magenta, #e74c9f), var(--violet, #8a6bf0));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          padding: 0 0.08em;
        }
        .pitch-hero-sub {
          font-family: 'Ovo', serif;
          font-style: italic;
          font-size: var(--fs-lead);
          line-height: var(--lh-body);
          color: var(--fg-soft, rgba(10,46,26,0.72));
          max-width: var(--w-lead);
          margin-bottom: var(--s-6);
        }
        .pitch-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

        .pitch-btn {
          padding: 12px 22px;
          border-radius: 3px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg, #0a2e1a);
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--emerald-deep, #047857) 40%, transparent);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
        }
        .pitch-btn:hover {
          border-color: var(--emerald-deep, #047857);
          background: color-mix(in srgb, var(--emerald, #10b981) 8%, transparent);
        }
        .pitch-btn-primary {
          background: var(--emerald-deep, #047857);
          color: var(--paper-glow, #f6fdf9);
          border-color: var(--emerald-deep, #047857);
        }
        .pitch-btn-primary:hover {
          background: var(--emerald-dark, #065f46);
          border-color: var(--emerald-dark, #065f46);
          color: var(--paper-glow, #f6fdf9);
        }

        /* Problem & Opportunity */
        .pitch-problem-section {
          padding: var(--s-8) 0;
          border-top: 1px solid var(--line, rgba(4,120,87,0.2));
        }
        .pitch-problem-headline {
          font-family: 'Ovo', serif;
          font-weight: 400;
          font-size: var(--fs-h1);
          line-height: var(--lh-tight);
          letter-spacing: -0.01em;
          color: var(--fg, #0a2e1a);
          margin-bottom: var(--s-5);
          max-width: 22ch;
        }
        .pitch-problem-headline em {
          font-style: italic;
          background: linear-gradient(110deg, var(--emerald-deep, #047857), var(--cyan, #06d6c4));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pitch-problem-lead {
          font-family: 'Ovo', serif;
          font-style: italic;
          font-size: var(--fs-lead);
          line-height: var(--lh-body);
          color: var(--fg-soft, rgba(10,46,26,0.72));
          max-width: var(--w-lead);
          margin-bottom: var(--s-7);
        }
        .pitch-problem-sublabel {
          font-family: var(--font-mono, monospace);
          font-size: var(--fs-label);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--emerald-deep, #047857);
          margin-bottom: var(--s-4);
        }
        .pitch-problem-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: var(--s-7);
        }
        .pitch-problem-card {
          position: relative;
          padding: var(--s-5);
          background: color-mix(in srgb, var(--paper-glow, #f6fdf9) 72%, transparent);
          border: 1px solid var(--line, rgba(4,120,87,0.2));
          border-radius: 4px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .pitch-problem-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--c1), var(--c2));
        }
        .pitch-problem-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px -16px color-mix(in srgb, var(--c1) 30%, transparent);
        }
        .pitch-problem-card-label {
          font-family: var(--font-mono, monospace);
          font-size: var(--fs-label);
          letter-spacing: 0.18em;
          color: var(--c1);
          margin-bottom: var(--s-3);
        }
        .pitch-problem-card-headline {
          font-family: 'Ovo', serif;
          font-size: var(--fs-h3);
          line-height: var(--lh-snug);
          color: var(--fg, #0a2e1a);
          margin-bottom: var(--s-3);
        }
        .pitch-problem-card-body {
          font-family: 'Mulish', sans-serif;
          font-size: var(--fs-body-sm);
          line-height: var(--lh-body);
          color: var(--fg-soft, rgba(10,46,26,0.72));
        }
        .pitch-problem-turn {
          padding: var(--s-5) var(--s-6);
          border-left: 3px solid var(--emerald-deep, #047857);
          background: color-mix(in srgb, var(--emerald, #10b981) 6%, transparent);
        }
        .pitch-problem-turn .pitch-problem-sublabel {
          margin-bottom: var(--s-3);
        }
        .pitch-problem-opportunity {
          font-family: 'Ovo', serif;
          font-style: italic;
          font-size: var(--fs-lead);
          line-height: var(--lh-body);
          color: var(--fg, #0a2e1a);
          max-width: var(--w-text);
          margin: 0;
        }
        @media (max-width: 900px) {
          .pitch-problem-grid { grid-template-columns: 1fr; }
        }

        /* 3-liner */
        .pitch-3liner-section {
          padding: var(--s-7) 0 var(--s-8);
          border-top: 1px solid var(--line, rgba(4,120,87,0.2));
        }
        .pitch-3liner-header {
          margin-bottom: var(--s-5);
        }
        .pitch-3liner-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pitch-3liner-header .pitch-section-label { margin-bottom: 0; }
        .pitch-copy-btn {
          padding: 8px 14px;
          border: 1px solid var(--line-strong, rgba(4,120,87,0.4));
          border-radius: 3px;
          background: transparent;
          font-family: var(--font-mono, monospace);
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--emerald-deep, #047857);
          cursor: pointer;
          transition: all 0.2s;
        }
        .pitch-copy-btn:hover {
          background: color-mix(in srgb, var(--emerald, #10b981) 10%, transparent);
          border-color: var(--emerald-deep, #047857);
        }
        .pitch-3liner-body {
          max-width: 52ch;
        }
        .pitch-3liner-line {
          font-family: 'Ovo', serif;
          font-weight: 400;
          font-size: var(--fs-h2);
          line-height: var(--lh-snug);
          letter-spacing: -0.006em;
          color: var(--fg, #0a2e1a);
          margin-bottom: var(--s-4);
          max-width: 52ch;
        }
        .pitch-3liner-line-1 {
          background: linear-gradient(110deg, var(--emerald-deep, #047857), var(--cyan, #06d6c4));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pitch-3liner-line-2 { color: var(--fg-soft, rgba(10,46,26,0.72)); }

        /* Loop */
        .pitch-loop-section {
          padding: var(--s-8) 0;
          border-top: 1px solid var(--line, rgba(4,120,87,0.2));
        }
        .pitch-loop {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 40px;
        }
        .pitch-loop-stage {
          position: relative;
          padding: 28px 24px;
          background: color-mix(in srgb, var(--paper-glow, #f6fdf9) 72%, transparent);
          border: 1px solid var(--line, rgba(4,120,87,0.2));
          border-radius: 4px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .pitch-loop-stage::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--c1), var(--c2));
        }
        .pitch-loop-stage:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 36px -18px color-mix(in srgb, var(--c1) 35%, transparent);
        }
        .pitch-loop-num {
          font-family: var(--font-mono, monospace);
          font-size: 10.5px;
          letter-spacing: 0.2em;
          color: var(--c1);
          margin-bottom: 10px;
        }
        .pitch-loop-label {
          font-family: 'Ovo', serif;
          font-size: var(--fs-h3);
          line-height: var(--lh-snug);
          margin-bottom: var(--s-3);
          color: var(--fg, #0a2e1a);
        }
        .pitch-loop-detail {
          font-size: var(--fs-body-sm);
          line-height: var(--lh-body);
          color: var(--fg-soft, rgba(10,46,26,0.72));
        }
        .pitch-loop-arrow {
          position: absolute;
          right: -18px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--emerald-deep, #047857);
          opacity: 0.5;
          font-size: 20px;
          z-index: 2;
        }
        .pitch-loop-close {
          font-family: 'Ovo', serif;
          font-style: italic;
          font-size: var(--fs-lead);
          line-height: var(--lh-snug);
          color: var(--emerald-deep, #047857);
          padding: var(--s-5) var(--s-6);
          border-left: 3px solid var(--emerald-deep, #047857);
          background: color-mix(in srgb, var(--emerald, #10b981) 6%, transparent);
        }
        @media (max-width: 900px) {
          .pitch-loop { grid-template-columns: 1fr 1fr; }
          .pitch-loop-arrow { display: none; }
        }
        @media (max-width: 600px) {
          .pitch-loop { grid-template-columns: 1fr; }
        }

        /* 60s Story */
        .pitch-story-section {
          padding: var(--s-8) 0;
          border-top: 1px solid var(--line, rgba(4,120,87,0.2));
        }
        .pitch-story-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pitch-story-head .pitch-section-label { margin-bottom: 0; }
        .pitch-story-time {
          font-family: var(--font-mono, monospace);
          font-size: 10.5px;
          letter-spacing: 0.14em;
          color: var(--emerald-deep, #047857);
          padding: 6px 12px;
          border: 1px solid color-mix(in srgb, var(--emerald-deep, #047857) 40%, transparent);
          border-radius: 999px;
        }
        .pitch-story-body {
          max-width: var(--w-text);
        }
        .pitch-story-para {
          font-family: 'Mulish', sans-serif;
          font-size: var(--fs-body);
          line-height: var(--lh-relaxed);
          color: var(--fg, #0a2e1a);
          margin-bottom: 1em;
        }

        /* Proof */
        .pitch-proof-section {
          padding: var(--s-8) 0;
          border-top: 1px solid var(--line, rgba(4,120,87,0.2));
        }
        .pitch-proof-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }
        .pitch-proof-card {
          padding: 24px;
          background: color-mix(in srgb, var(--paper-glow, #f6fdf9) 72%, transparent);
          border: 1px solid var(--line, rgba(4,120,87,0.2));
          border-radius: 4px;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .pitch-proof-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px -16px color-mix(in srgb, var(--emerald, #10b981) 30%, transparent);
        }
        .pitch-proof-value {
          font-family: 'Ovo', serif;
          font-size: 26px;
          line-height: 1.1;
          color: var(--emerald-deep, #047857);
          margin-bottom: var(--s-2);
        }
        .pitch-proof-label {
          font-family: 'Mulish', sans-serif;
          font-size: var(--fs-body-sm);
          font-weight: var(--fw-semibold);
          color: var(--fg, #0a2e1a);
          margin-bottom: var(--s-2);
          line-height: var(--lh-snug);
        }
        .pitch-proof-detail {
          font-size: var(--fs-caption);
          line-height: var(--lh-body);
          color: var(--fg-soft, rgba(10,46,26,0.72));
        }

        /* Audience */
        .pitch-audience-section {
          padding: var(--s-8) 0;
          border-top: 1px solid var(--line, rgba(4,120,87,0.2));
        }
        .pitch-audience-tabs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 32px;
          padding: 6px;
          background: color-mix(in srgb, var(--paper-glow, #f6fdf9) 60%, transparent);
          border: 1px solid var(--line, rgba(4,120,87,0.2));
          border-radius: 6px;
          width: fit-content;
        }
        .pitch-audience-tab {
          padding: 10px 18px;
          border: none;
          border-radius: 3px;
          background: transparent;
          font-family: var(--font-mono, monospace);
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-mute, rgba(10,46,26,0.5));
          cursor: pointer;
          transition: all 0.2s;
        }
        .pitch-audience-tab:hover { color: var(--fg, #0a2e1a); }
        .pitch-audience-tab.is-active {
          background: var(--emerald-deep, #047857);
          color: var(--paper-glow, #f6fdf9);
        }
        .pitch-audience-panel {
          padding: 32px;
          background: color-mix(in srgb, var(--paper-glow, #f6fdf9) 72%, transparent);
          border: 1px solid var(--line, rgba(4,120,87,0.2));
          border-radius: 4px;
          max-width: 760px;
        }
        .pitch-audience-opener {
          font-family: 'Ovo', serif;
          font-style: italic;
          font-size: var(--fs-lead);
          line-height: var(--lh-snug);
          color: var(--fg, #0a2e1a);
          margin-bottom: var(--s-5);
          padding-bottom: var(--s-4);
          border-bottom: 1px dashed var(--line-strong, rgba(4,120,87,0.4));
        }
        .pitch-audience-sublabel {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.2em;
          color: var(--emerald-deep, #047857);
          margin-bottom: 12px;
          margin-top: 18px;
        }
        .pitch-audience-sublabel:first-of-type { margin-top: 0; }
        .pitch-audience-proof {
          list-style: none;
          padding: 0;
          margin: 0 0 8px 0;
        }
        .pitch-audience-proof li {
          padding: 10px 0 10px 20px;
          position: relative;
          font-size: 14.5px;
          line-height: 1.55;
          color: var(--fg, #0a2e1a);
        }
        .pitch-audience-proof li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--emerald-deep, #047857);
        }
        .pitch-audience-ask {
          font-family: 'Ovo', serif;
          font-style: italic;
          font-size: var(--fs-body);
          line-height: var(--lh-body);
          color: var(--emerald-dark, #065f46);
          padding: var(--s-3) var(--s-4);
          background: color-mix(in srgb, var(--emerald, #10b981) 8%, transparent);
          border-radius: 3px;
        }

        /* Objections */
        .pitch-objections-section {
          padding: var(--s-8) 0;
          border-top: 1px solid var(--line, rgba(4,120,87,0.2));
        }
        .pitch-objections-list {
          max-width: 820px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pitch-objection {
          border: 1px solid var(--line, rgba(4,120,87,0.2));
          border-radius: 4px;
          overflow: hidden;
          background: color-mix(in srgb, var(--paper-glow, #f6fdf9) 60%, transparent);
          transition: border-color 0.2s;
        }
        .pitch-objection.is-open {
          border-color: var(--emerald-deep, #047857);
        }
        .pitch-objection-q {
          width: 100%;
          padding: var(--s-4) var(--s-5);
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--s-4);
          cursor: pointer;
          font-family: 'Ovo', serif;
          font-size: var(--fs-body);
          line-height: var(--lh-snug);
          color: var(--fg, #0a2e1a);
          text-align: left;
        }
        .pitch-objection-toggle {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--line-strong, rgba(4,120,87,0.4));
          border-radius: 50%;
          font-family: var(--font-mono, monospace);
          font-size: 14px;
          color: var(--emerald-deep, #047857);
        }
        .pitch-objection-a {
          padding: 0 var(--s-5) var(--s-4);
          font-family: 'Mulish', sans-serif;
          font-size: var(--fs-body-sm);
          line-height: var(--lh-body);
          color: var(--fg-soft, rgba(10,46,26,0.72));
          max-width: var(--w-text);
        }

        /* Footer */
        .pitch-footer {
          margin-top: 80px;
          padding: 32px 0 48px;
          border-top: 1px solid var(--line, rgba(4,120,87,0.2));
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--fg-mute, rgba(10,46,26,0.5));
        }
        .pitch-footer-left, .pitch-footer-right { display: flex; gap: 10px; }
        .pitch-footer-sep { opacity: 0.5; }

        /* Print */
        @media print {
          .pitch-rail { display: none; }
          .pitch-hero { min-height: auto; padding: 20px 0; }
          .pitch-hero-mesh { display: none; }
          .pitch-btn, .pitch-copy-btn { display: none; }
          .pitch-section-label { page-break-after: avoid; }
          section { page-break-inside: avoid; padding: 40px 0; }
        }
      `}</style>
    </div>
  )
}
