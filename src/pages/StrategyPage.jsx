import { useState, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { marked } from 'marked'

function slugifyHeading(text) {
  return 'h-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
}

function renderContent(content, nodes) {
  let html = content.replace(/^---[\s\S]*?---\s*/m, '').replace(/^#[^\n]*\n/, '')
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const slug = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const exists = nodes.some(n => n.id === slug)
    if (exists) return `<a href="#" data-node-id="${slug}" class="wiki-link">${label || target}</a>`
    return label || target
  })
  let out = marked(html)
  out = out.replace(/<(h2|h3)>([^<]+)<\/\1>/g, (_, tag, text) => `<${tag} id="${slugifyHeading(text)}">${text}</${tag}>`)
  out = out.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
  return out
}

function extractHeadings(content) {
  const body = content.replace(/^---[\s\S]*?---\s*/m, '').replace(/^#[^\n]*\n/, '')
  const out = []
  for (const line of body.split('\n')) {
    const m = line.match(/^(##+)\s+(.+?)\s*$/)
    if (m && m[1].length <= 3) {
      out.push({
        level: m[1].length,
        text: m[2].replace(/\*\*/g, '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, l) => l || t),
        id: slugifyHeading(m[2]),
      })
    }
  }
  return out
}

const Q2_START = new Date('2026-04-15')
const Q2_END = new Date('2026-06-30')

function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}
function parseMilestoneDate(label, year = 2026) {
  const parsed = new Date(`${label} ${year}`)
  return isNaN(parsed) ? null : parsed
}
function Countdown({ label }) {
  const now = new Date()
  const d = parseMilestoneDate(label)
  if (!d) return null
  const days = daysBetween(now, d)
  if (days < 0) return <span className="strategy-ms-countdown strategy-ms-countdown-done">T{days}d</span>
  if (days === 0) return <span className="strategy-ms-countdown strategy-ms-countdown-hot">TODAY</span>
  const hot = days <= 7
  return (
    <span className={`strategy-ms-countdown${hot ? ' strategy-ms-countdown-hot' : ''}`}>
      T-{days}d
    </span>
  )
}

function Q2HeroSummary({ onOpenNode }) {
  const parentOp = { codename: 'OP // PARENT-01', title: 'Projects, Tenders & Claw OS Sales', accent: '#ef4444', nodeId: 'kracked-technologies', bullet: 'Run at Kracked Technologies parent level — project work, tender wins, and Claw OS consultation / workshop / bespoke sold as one unified outbound motion.' }
  const pillars = [
    { n: '01', title: 'Kracked Devs', accent: '#22d3ee', nodeId: 'kracked-devs', bullet: 'Community + Recruitment arm. AI skill scorecards, Recruiter agent, Featured Listings.', led: 'green' },
    { n: '02', title: 'KD Academy', accent: '#e879f9', nodeId: 'kd-academy', bullet: '12 Vibe Coding 101 sessions · 3–5 paid tutors · 3× Discord growth. Top of every funnel.', led: 'amber' },
    { n: '03', title: 'Kracked Labs', accent: '#a78bfa', nodeId: 'kracked-labs', bullet: 'No new ventures. Portfolio standardised. Rick drafts Q3 health review.', led: 'blue' },
  ]
  const milestones = [
    { label: 'Apr 22', text: 'Itachi live — CEO can ask the vault', status: 'now' },
    { label: 'Apr 30', text: 'Internal Claw OS live + first Sniper agent dry-run', status: 'next' },
    { label: 'May 31', text: 'Pitch deck v1 · Consultation SKU packaged · First proposal out', status: 'later' },
    { label: 'Jun 30', text: '2 signed consultations · 1 workshop booked · 1 bespoke in pipeline', status: 'later' },
  ]

  const now = new Date()
  const elapsed = Math.max(0, daysBetween(Q2_START, now))
  const remaining = Math.max(0, daysBetween(now, Q2_END))
  const weekOf = Math.min(11, Math.max(1, Math.ceil((elapsed + 1) / 7)))

  return (
    <div className="strategy-hero">
      <div className="strategy-brief-ribbon">
        <span className="hud-led hud-led-green" />
        <span className="hud-ribbon">
          <span>Q2 2026</span>
          <span className="hud-ribbon-sep" />
          <span className="hud-ribbon-hot">WEEK {String(weekOf).padStart(2, '0')} / 11</span>
          <span className="hud-ribbon-sep" />
          <span>{elapsed}D ELAPSED · {remaining}D REMAINING</span>
          <span className="hud-ribbon-sep" />
          <span>APR 15 → JUN 30</span>
        </span>
      </div>

      <h1 className="strategy-thesis">Build Claw OS, sell Claw OS, feed the funnel.</h1>
      <p className="strategy-subthesis">AI company brain — <em>infra before growth</em>.</p>

      <div className="strategy-section-label">Parent motion · Kracked Technologies</div>
      <button
        type="button"
        className="strategy-pillar strategy-parentop strategy-pillar-btn"
        style={{ '--accent': parentOp.accent }}
        onClick={() => onOpenNode?.(parentOp.nodeId)}
      >
        <span className="strategy-pillar-n">★</span>
        <div>
          <div className="hud-codename" style={{ '--hud-accent': parentOp.accent }}>{parentOp.codename}</div>
          <div className="strategy-pillar-title">{parentOp.title}</div>
          <div className="strategy-pillar-bullet">{parentOp.bullet}</div>
        </div>
      </button>

      <div className="strategy-section-label">Three pillars</div>
      <div className="strategy-pillars">
        {pillars.map(p => (
          <button
            type="button"
            key={p.n}
            className="strategy-pillar strategy-pillar-btn"
            style={{ '--accent': p.accent }}
            onClick={() => onOpenNode?.(p.nodeId)}
          >
            <span className="strategy-pillar-n">{p.n}</span>
            <div>
              <div className="hud-codename" style={{ '--hud-accent': p.accent }}>
                <span className={`hud-led hud-led-${p.led}`} /> PILLAR {p.n} // {p.title.toUpperCase()}
              </div>
              <div className="strategy-pillar-title">{p.title}</div>
              <div className="strategy-pillar-bullet">{p.bullet}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="strategy-section-label">Milestones · Q2 Horizon</div>
      <Timeline start={Q2_START} end={Q2_END} now={now} milestones={milestones} />
    </div>
  )
}

function Timeline({ start, end, now, milestones }) {
  const span = Math.max(1, daysBetween(start, end))
  const nowPct = Math.max(0, Math.min(100, (daysBetween(start, now) / span) * 100))

  const items = milestones.map(m => {
    const d = parseMilestoneDate(m.label)
    const pct = d ? Math.max(0, Math.min(100, (daysBetween(start, d) / span) * 100)) : 0
    return { ...m, date: d, pct }
  })

  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()

  return (
    <div className="timeline">
      <div className="timeline-ribbon">
        <span className="timeline-ribbon-end">{fmt(start)}</span>
        <span className="timeline-ribbon-spacer" />
        <span className="timeline-ribbon-now" style={{ left: `${nowPct}%` }}>
          <span className="hud-led hud-led-green" /> NOW
        </span>
        <span className="timeline-ribbon-end timeline-ribbon-end-right">{fmt(end)}</span>
      </div>

      <div className="timeline-axis">
        <div className="timeline-axis-line" />
        <div className="timeline-axis-fill" style={{ width: `${nowPct}%` }} />
        <div className="timeline-now-marker" style={{ left: `${nowPct}%` }} />

        {items.map((m, i) => (
          <div
            key={i}
            className={`timeline-node timeline-ms-${m.status}`}
            style={{ left: `${m.pct}%` }}
          >
            <span className="timeline-node-dot" />
          </div>
        ))}
      </div>

      <div className="timeline-cards">
        {items.map((m, i) => (
          <div key={i} className={`timeline-card timeline-ms-${m.status}`} style={{ left: `${m.pct}%` }}>
            <div className="timeline-card-head">
              <span className="timeline-card-date">{m.label.toUpperCase()}</span>
              <Countdown label={m.label} />
            </div>
            <div className="timeline-card-text">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StrategyDocView({ node, nodes, onOpenDoc, onOpenNode }) {
  const bodyRef = useRef(null)
  const headings = extractHeadings(node.content)
  const html = renderContent(node.content, nodes)

  const scrollTo = (id) => {
    const el = bodyRef.current?.querySelector('#' + CSS.escape(id))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleClick = useCallback((e) => {
    const link = e.target.closest('[data-node-id]')
    if (link) {
      e.preventDefault()
      const id = link.dataset.nodeId
      const target = nodes.find(n => n.id === id)
      if (!target) return
      if (target.category === 'Strategy') {
        onOpenDoc(id)
      } else {
        onOpenNode?.(id)
      }
    }
  }, [nodes, onOpenDoc, onOpenNode])

  return (
    <div className="strategy-doc">
      <div className="strategy-doc-head">
        <h2>{node.name}</h2>
        {node.period && <span className="strategy-doc-period">{node.period}</span>}
      </div>
      <div className={`strategy-doc-body ${headings.length >= 3 ? 'strategy-doc-body-withtoc' : ''}`} ref={bodyRef}>
        {headings.length >= 3 && (
          <aside className="strategy-toc">
            <div className="strategy-toc-label">On this page</div>
            {headings.map(h => (
              <button key={h.id} className={`strategy-toc-item strategy-toc-l${h.level}`} onClick={() => scrollTo(h.id)}>
                {h.text}
              </button>
            ))}
          </aside>
        )}
        <article className="article-body" onClickCapture={handleClick} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

function StrategySidebar({ node, graph, onClose, onOpenNode }) {
  useEffect(() => {
    if (!node) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [node, onClose])

  const handleClick = useCallback((e) => {
    const link = e.target.closest('[data-node-id]')
    if (link) {
      e.preventDefault()
      const id = link.dataset.nodeId
      if (graph.nodes.some(n => n.id === id)) onOpenNode(id)
    }
  }, [graph, onOpenNode])

  if (!node) return null

  const html = renderContent(node.content, graph.nodes)
  const neighbors = (() => {
    const ids = new Set()
    for (const edge of graph.edges) {
      if (edge.source === node.id) ids.add(edge.target)
      if (edge.target === node.id) ids.add(edge.source)
    }
    return graph.nodes.filter(n => ids.has(n.id)).slice(0, 12)
  })()

  return (
    <>
      <div className="strategy-sidebar-scrim" onClick={onClose} />
      <aside className="strategy-sidebar">
        <div className="strategy-sidebar-head">
          <div>
            <div className="strategy-sidebar-category">{node.category}</div>
            <h3 className="strategy-sidebar-title">{node.name}</h3>
          </div>
          <div className="strategy-sidebar-actions">
            <Link to={`/article/${node.id}`} className="strategy-sidebar-open" title="Open full page">↗</Link>
            <button className="strategy-sidebar-close" onClick={onClose} title="Close" aria-label="Close">×</button>
          </div>
        </div>
        <div className="strategy-sidebar-body article-body" onClickCapture={handleClick} dangerouslySetInnerHTML={{ __html: html }} />
        {neighbors.length > 0 && (
          <div className="strategy-sidebar-footer">
            <div className="strategy-sidebar-footer-label">Connections</div>
            <div className="strategy-sidebar-neighbors">
              {neighbors.map(n => (
                <button key={n.id} className="strategy-sidebar-neighbor" onClick={() => onOpenNode(n.id)}>
                  {n.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default function StrategyPage({ graph }) {
  const strategies = graph.nodes.filter(n => n.category === 'Strategy')
  const [activeId, setActiveId] = useState(strategies.find(s => s.id === 'q2-2026')?.id || strategies[0]?.id)
  const [sidebarId, setSidebarId] = useState(null)
  const active = strategies.find(s => s.id === activeId)
  const sidebarNode = sidebarId ? graph.nodes.find(n => n.id === sidebarId) : null

  const openSidebar = useCallback((id) => {
    if (graph.nodes.some(n => n.id === id)) setSidebarId(id)
  }, [graph])

  return (
    <div className="strategy-page">
      <Q2HeroSummary onOpenNode={openSidebar} />

      {strategies.length > 0 && (
        <div className="strategy-tabs">
          {strategies.map(s => (
            <button
              key={s.id}
              className={`strategy-tab ${activeId === s.id ? 'active' : ''}`}
              onClick={() => setActiveId(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {active && (
        <StrategyDocView
          node={active}
          nodes={graph.nodes}
          onOpenDoc={setActiveId}
          onOpenNode={openSidebar}
        />
      )}

      {sidebarNode && (
        <StrategySidebar
          node={sidebarNode}
          graph={graph}
          onClose={() => setSidebarId(null)}
          onOpenNode={openSidebar}
        />
      )}
    </div>
  )
}
