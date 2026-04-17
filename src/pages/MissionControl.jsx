import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import { CATEGORY_COLORS } from '../App'
import PageHeader from '../components/PageHeader'

const CARD_ACCENTS = {
  deals: '#3b82f6',
  team: '#059669',
  ventures: '#7c3aed',
  roadmap: '#f59e0b',
  thisWeek: '#06b6d4',
  advisors: '#0e7490',
  academy: '#be185d',
  graph: '#0052ef',
  revenue: '#dc2626',
  agents: '#a855f7',
  strategy: '#ef4444',
  whatIf: '#eab308',
}

const STATUS_COLORS = {
  'Awaiting Sign-off': '#f59e0b',
  'Awaiting Decision': '#f59e0b',
  'In Progress': '#3b82f6',
  'Live': '#10b981',
  'In development': '#8b5cf6',
  'Unknown': '#6b7280',
}

function StatusDot({ status }) {
  return <span className="status-dot" style={{ background: STATUS_COLORS[status] || '#6b7280' }} />
}

function CardHeader({ icon, title, accent, count }) {
  return (
    <div className="mc-card-head" style={{ borderBottomColor: accent + '40' }}>
      <div className="mc-card-head-left">
        <span className="mc-card-icon" style={{ background: accent + '22', color: accent }}>{icon}</span>
        <span className="mc-card-head-title">{title}</span>
      </div>
      {count !== undefined && <span className="mc-card-count" style={{ color: accent }}>{count}</span>}
    </div>
  )
}

function slugifyHeading(text) {
  return 'h-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
}

function parseChapters(content) {
  const body = content.replace(/^---[\s\S]*?---\s*/m, '').replace(/^#[^\n]*\n+/, '').trim()
  const lines = body.split('\n')
  const chapters = []
  let current = { title: 'Overview', body: [] }
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/)
    if (m) {
      if (current.body.some(l => l.trim())) chapters.push({ title: current.title, body: current.body.join('\n').trim() })
      current = { title: m[1].replace(/\*\*/g, '').trim(), body: [] }
    } else {
      current.body.push(line)
    }
  }
  if (current.body.some(l => l.trim())) chapters.push({ title: current.title, body: current.body.join('\n').trim() })
  return chapters
}

function renderChapterBody(bodyMd, nodes) {
  let html = bodyMd.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const slug = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const exists = nodes.some(n => n.id === slug)
    if (exists) return `<a href="#" data-node-id="${slug}" class="wiki-link">${label || target}</a>`
    return label || target
  })
  let out = marked(html)
  out = out.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
  return out
}

function WhatIfReader({ content, graph, onOpen }) {
  const chapters = useMemo(() => parseChapters(content), [content])
  const total = chapters.length
  const [idx, setIdx] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [idx, fullscreen])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreen(false)
      else if (e.key === 'ArrowRight') setIdx(i => Math.min(total - 1, i + 1))
      else if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen, total])

  const handleBodyClick = useCallback((e) => {
    const link = e.target.closest('[data-node-id]')
    if (link) { e.preventDefault(); onOpen(link.dataset.nodeId) }
  }, [onOpen])

  if (total === 0) return null
  const current = chapters[idx] || chapters[0]
  const progress = ((idx + 1) / total) * 100
  const accent = '#eab308'

  const reader = (
    <div className={`mc-whatif-reader${fullscreen ? ' mc-whatif-fullscreen' : ''}${minimized ? ' mc-whatif-minimized' : ''}`}>
      <div className="mc-whatif-head" style={{ borderBottomColor: accent + '40' }}>
        <div className="mc-card-head-left">
          <span className="mc-card-icon" style={{ background: accent + '22', color: accent }}>◇</span>
          <span className="mc-card-head-title">What If</span>
          <span className="mc-whatif-chapter-label">Ch. {idx + 1} / {total} — {current.title}</span>
        </div>
        <div className="mc-whatif-controls">
          <button className="mc-whatif-ctrl" onClick={() => setMinimized(m => !m)} title={minimized ? 'Expand' : 'Minimize'} aria-label="Minimize">
            {minimized ? '▢' : '—'}
          </button>
          <button className="mc-whatif-ctrl" onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} aria-label="Fullscreen">
            {fullscreen ? '⤓' : '⤢'}
          </button>
          {fullscreen && (
            <button className="mc-whatif-ctrl mc-whatif-close" onClick={() => setFullscreen(false)} title="Close" aria-label="Close">
              ×
            </button>
          )}
        </div>
      </div>
      <div className="mc-whatif-progress" aria-hidden>
        <div className="mc-whatif-progress-track">
          {chapters.map((c, i) => (
            <button
              key={i}
              className={`mc-whatif-progress-seg${i === idx ? ' is-current' : ''}${i < idx ? ' is-done' : ''}`}
              onClick={() => setIdx(i)}
              title={c.title}
              style={{ flex: 1 }}
            />
          ))}
        </div>
        <div className="mc-whatif-progress-fill" style={{ width: `${progress}%`, background: accent }} />
      </div>

      {!minimized && (
        <div className="mc-whatif-shell">
          <aside className="mc-whatif-sidebar">
            <h3>Chapters</h3>
            <div className="mc-whatif-toc">
              {chapters.map((c, i) => (
                <button
                  key={i}
                  className={`mc-whatif-toc-item${i === idx ? ' is-active' : ''}`}
                  onClick={() => setIdx(i)}
                >
                  <span className="mc-whatif-toc-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mc-whatif-toc-title">{c.title}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="mc-whatif-main">
            <div
              ref={bodyRef}
              className="article-body mc-whatif-chapter"
              onClickCapture={handleBodyClick}
              dangerouslySetInnerHTML={{ __html: renderChapterBody(current.body, graph.nodes) }}
            />

            <div className="mc-whatif-nav">
              <button
                className="mc-whatif-navbtn"
                onClick={() => setIdx(i => Math.max(0, i - 1))}
                disabled={idx === 0}
              >
                ← Previous
              </button>
              <span className="mc-whatif-navcount">{idx + 1} of {total}</span>
              <button
                className="mc-whatif-navbtn mc-whatif-navbtn-primary"
                onClick={() => setIdx(i => Math.min(total - 1, i + 1))}
                disabled={idx === total - 1}
                style={{ background: accent }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="mc-whatif-overlay" onClick={(e) => { if (e.target === e.currentTarget) setFullscreen(false) }}>
        {reader}
      </div>
    )
  }

  return <div className="mc-card glass mc-card-wide mc-whatif-card">{reader}</div>
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
  // Add ids to h2 and h3 for TOC anchoring
  out = out.replace(/<(h2|h3)>([^<]+)<\/\1>/g, (_, tag, text) => `<${tag} id="${slugifyHeading(text)}">${text}</${tag}>`)
  // External links open in new tab
  out = out.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
  return out
}

function extractHeadings(content) {
  const body = content.replace(/^---[\s\S]*?---\s*/m, '').replace(/^#[^\n]*\n/, '')
  const out = []
  for (const line of body.split('\n')) {
    const m = line.match(/^(##+)\s+(.+?)\s*$/)
    if (m && m[1].length <= 3) {
      out.push({ level: m[1].length, text: m[2].replace(/\*\*/g, '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, l) => l || t), id: slugifyHeading(m[2]) })
    }
  }
  return out
}

function ArticleModal({ node, graph, onClose, onOpen, trail = [], onJumpTrail }) {
  const handleClick = useCallback((e) => {
    const link = e.target.closest('[data-node-id]')
    if (link) {
      e.preventDefault()
      onOpen(link.dataset.nodeId)
    }
  }, [onOpen])

  if (!node) return null
  const color = CATEGORY_COLORS[node.category] || '#0052ef'
  const html = renderContent(node.content, graph.nodes)
  const headings = extractHeadings(node.content)
  const bodyRef = useRef(null)
  const scrollTo = (id) => {
    const el = bodyRef.current?.querySelector('#' + CSS.escape(id))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const neighbors = (() => {
    const ids = new Set()
    for (const edge of graph.edges) {
      if (edge.source === node.id) ids.add(edge.target)
      if (edge.target === node.id) ids.add(edge.source)
    }
    return graph.nodes.filter(n => ids.has(n.id))
  })()

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal glass" onClick={e => e.stopPropagation()} onClickCapture={handleClick}>
        <button className="mc-modal-close" onClick={onClose}>&times;</button>

        {trail.length > 1 && (
          <div className="mc-breadcrumbs">
            {trail.map((n, i) => (
              <span key={n.id} className="mc-crumb-wrap">
                {i > 0 && <span className="mc-crumb-sep">›</span>}
                {i === trail.length - 1 ? (
                  <span className="mc-crumb mc-crumb-current">{n.name}</span>
                ) : (
                  <button className="mc-crumb" onClick={() => onJumpTrail(i)}>{n.name}</button>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="mc-modal-head" style={{ borderBottomColor: color + '40' }}>
          <span className="mc-card-icon" style={{ background: color + '22', color }}>◆</span>
          <div className="mc-modal-head-text">
            <span className="mc-modal-category" style={{ color }}>{node.category}</span>
            <h2 className="mc-modal-title">{node.name}</h2>
          </div>
        </div>

        <div className={`mc-modal-body ${headings.length >= 3 ? 'mc-modal-body-withtoc' : ''}`} ref={bodyRef}>
          {headings.length >= 3 && (
            <aside className="mc-toc">
              <div className="mc-toc-label">On this page</div>
              {headings.map(h => (
                <button
                  key={h.id}
                  className={`mc-toc-item mc-toc-l${h.level}`}
                  onClick={() => scrollTo(h.id)}
                >
                  {h.text}
                </button>
              ))}
            </aside>
          )}

          <div className="mc-modal-main">
            <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />

            {neighbors.length > 0 && (
              <div className="mc-modal-connections">
                <h4>Connections ({neighbors.length})</h4>
                <div className="mc-modal-conn-grid">
                  {neighbors.map(n => (
                    <button key={n.id} className="mc-modal-conn" onClick={() => onOpen(n.id)}>
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Q2PlanSummary({ strategies, openNode }) {
  const parentOp = { title: 'Projects, Tenders & Claw OS Sales', accent: '#ef4444', bullet: 'Run at the Kracked Technologies parent level: project work, tender wins, and Claw OS consultation / workshop / bespoke — one unified outbound.' }
  const pillars = [
    { n: 1, title: 'Kracked Devs', accent: '#3b82f6', bullet: 'Community + Recruitment arm. AI skill scorecards, Recruiter agent, Featured Listings. MYR 15k Q2 target.' },
    { n: 2, title: 'KD Academy', accent: '#be185d', bullet: '12 Vibe Coding 101 sessions · 3–5 paid tutors · 3× Discord growth. Top of every funnel.' },
    { n: 3, title: 'Kracked Labs', accent: '#7c3aed', bullet: 'No new ventures. Portfolio standardised. Rick drafts Q3 health review.' },
  ]
  const milestones = [
    { label: 'Apr 22', text: 'Itachi live — CEO can ask the vault', status: 'now' },
    { label: 'Apr 30', text: 'Internal Claw OS live + first Sniper agent dry-run', status: 'next' },
    { label: 'May 31', text: 'Pitch deck v1 · Consultation SKU packaged · First proposal out', status: 'later' },
    { label: 'Jun 30', text: '2 signed consultations · 1 workshop booked · 1 bespoke in pipeline', status: 'later' },
  ]
  const metrics = [
    { label: 'YT sessions', baseline: 1, target: 12 },
    { label: 'Paid tutors', baseline: 0, target: '3–5' },
    { label: 'Discovery calls', baseline: 0, target: 10 },
    { label: 'Paid consultations', baseline: 0, target: 2 },
    { label: 'Workshops booked', baseline: 0, target: '1+' },
    { label: 'Tender applications', baseline: 0, target: 3 },
  ]
  return (
    <div className="q2plan">
      <div className="q2plan-hero">
        <div className="q2plan-hero-left">
          <div className="strategy-brief-ribbon">
            <span className="hud-led hud-led-green" />
            <span className="hud-ribbon">
              <span>Q2 2026</span>
              <span className="hud-ribbon-sep" />
              <span className="hud-ribbon-hot">11 WEEKS</span>
              <span className="hud-ribbon-sep" />
              <span>APR 15 → JUN 30</span>
            </span>
          </div>
          <h3 className="q2plan-thesis">Build Claw OS, sell Claw OS, feed the funnel.</h3>
          <p className="q2plan-subthesis">AI company brain — <em>infra before growth</em>.</p>
        </div>
        <div className="q2plan-docs">
          {strategies.map(s => (
            <button key={s.id} className="q2plan-doc" onClick={() => openNode(s.id)}>
              <span className="q2plan-doc-name">{s.name}</span>
              <span className="q2plan-doc-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      <div className="q2plan-section-label">Parent motion · Kracked Technologies</div>
      <div className="q2plan-pillar q2plan-parentop" style={{ '--accent': parentOp.accent }}>
        <span className="q2plan-pillar-n">★</span>
        <div>
          <div className="q2plan-pillar-title">{parentOp.title}</div>
          <div className="q2plan-pillar-bullet">{parentOp.bullet}</div>
        </div>
      </div>

      <div className="q2plan-section-label">Three pillars</div>
      <div className="q2plan-pillars">
        {pillars.map(p => (
          <div key={p.n} className="q2plan-pillar" style={{ '--accent': p.accent }}>
            <span className="q2plan-pillar-n">{p.n}</span>
            <div>
              <div className="q2plan-pillar-title">{p.title}</div>
              <div className="q2plan-pillar-bullet">{p.bullet}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="q2plan-section-label">Milestones</div>
      <div className="q2plan-milestones">
        {milestones.map((m, i) => (
          <div key={i} className={`q2plan-milestone q2plan-ms-${m.status}`}>
            <div className="q2plan-ms-label">{m.label}</div>
            <div className="q2plan-ms-text">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="q2plan-section-label">Metrics · baseline → Q2 target</div>
      <div className="q2plan-metrics">
        {metrics.map((m, i) => (
          <div key={i} className="q2plan-metric">
            <div className="q2plan-metric-label">{m.label}</div>
            <div className="q2plan-metric-val"><span className="q2plan-metric-base">{m.baseline}</span> → <span className="q2plan-metric-target">{m.target}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MissionControl({ graph }) {
  const navigate = useNavigate()
  const [trail, setTrail] = useState([])
  const MAX_TRAIL = 7
  const [topTab, setTopTab] = useState('q2plan')
  const d = graph.dashboard
  if (!d) return null

  const openNode = useCallback((id) => {
    if (!graph.nodes.find(n => n.id === id)) return
    setTrail(prev => {
      if (prev[prev.length - 1] === id) return prev
      const existing = prev.indexOf(id)
      if (existing !== -1) return prev.slice(0, existing + 1)
      const next = [...prev, id]
      return next.length > MAX_TRAIL ? next.slice(next.length - MAX_TRAIL) : next
    })
  }, [graph])

  const jumpTrail = useCallback((idx) => {
    setTrail(prev => prev.slice(0, idx + 1))
  }, [])

  const closeModal = useCallback(() => setTrail([]), [])

  const currentId = trail[trail.length - 1]
  const openedNode = currentId ? graph.nodes.find(n => n.id === currentId) : null
  const trailNodes = trail.map(id => graph.nodes.find(n => n.id === id)).filter(Boolean)

  return (
    <div className="mc">
      <div className="mc-mesh">
        <div className="mc-mesh-blob mc-mesh-blob-1" />
        <div className="mc-mesh-blob mc-mesh-blob-2" />
        <div className="mc-mesh-blob mc-mesh-blob-3" />
      </div>

      <div className="mc-inner">
        <PageHeader
          eyebrow={`LAST SYNC · ${new Date(graph.meta.syncedAt).toLocaleDateString().toUpperCase()}`}
          title="Mission Control"
          subtitle="Live operational view of Kracked Technologies — every deal, venture, agent, and milestone in one place."
          visual="control"
        />

        {(d.thisWeek || (d.strategies && d.strategies.length > 0)) && (
          <div className="mc-card glass mc-card-wide">
            <div className="mc-tabs">
              {d.thisWeek && (
                <button
                  className={`mc-tab ${topTab === 'thisweek' ? 'active' : ''}`}
                  onClick={() => setTopTab('thisweek')}
                  style={{ '--accent': CARD_ACCENTS.thisWeek }}
                >
                  <span className="mc-card-icon" style={{ background: CARD_ACCENTS.thisWeek + '22', color: CARD_ACCENTS.thisWeek }}>★</span>
                  This Week
                </button>
              )}
              {d.strategies && d.strategies.length > 0 && (
                <button
                  className={`mc-tab mc-tab-pulse ${topTab === 'q2plan' ? 'active' : ''}`}
                  onClick={() => setTopTab('q2plan')}
                  style={{ '--accent': CARD_ACCENTS.strategy }}
                >
                  <span className="mc-card-icon" style={{ background: CARD_ACCENTS.strategy + '22', color: CARD_ACCENTS.strategy }}>◆</span>
                  Q2 Plan
                </button>
              )}
            </div>

            {topTab === 'thisweek' && d.thisWeek && (
              <div
                className="article-body mc-thisweek-body"
                onClickCapture={(e) => {
                  const link = e.target.closest('[data-node-id]')
                  if (link) { e.preventDefault(); openNode(link.dataset.nodeId) }
                }}
                dangerouslySetInnerHTML={{ __html: renderContent(d.thisWeek, graph.nodes) }}
              />
            )}

            {topTab === 'q2plan' && d.strategies && (
              <Q2PlanSummary strategies={d.strategies} openNode={openNode} />
            )}
          </div>
        )}

        <div className="mc-metrics">
          <div className="mc-metric glass" style={{ '--accent': CARD_ACCENTS.team }}>
            <span className="mc-metric-label">Team</span>
            <span className="mc-metric-value">{d.team.count}</span>
          </div>
          <div className="mc-metric glass" style={{ '--accent': CARD_ACCENTS.ventures }}>
            <span className="mc-metric-label">Ventures</span>
            <span className="mc-metric-value">{d.ventures.length}</span>
          </div>
          <div className="mc-metric glass" style={{ '--accent': CARD_ACCENTS.deals }}>
            <span className="mc-metric-label">Tenders & Contracts</span>
            <span className="mc-metric-value">{d.deals.length}</span>
          </div>
          <div className="mc-metric glass clickable" style={{ '--accent': CARD_ACCENTS.graph }} onClick={() => navigate('/graph')}>
            <span className="mc-metric-label">Nodes</span>
            <span className="mc-metric-value">{d.graph.total}</span>
          </div>
          <div className="mc-metric glass" style={{ '--accent': CARD_ACCENTS.advisors }}>
            <span className="mc-metric-label">Advisors</span>
            <span className="mc-metric-value">{d.advisors.length}</span>
          </div>
        </div>

        <div className="mc-row-2">
          <div className="mc-card glass">
            <CardHeader icon="◉" title="Tenders & Contracts" accent={CARD_ACCENTS.deals} count={d.deals.length} />
            <div className="mc-list">
              {d.deals.map(deal => (
                <div key={deal.id} className="mc-list-row" onClick={() => openNode(deal.id)}>
                  <StatusDot status={deal.status} />
                  <span className="mc-list-name">{deal.name}</span>
                  <span className="mc-list-status">{deal.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mc-card glass">
            <CardHeader icon="◈" title="Ventures" accent={CARD_ACCENTS.ventures} count={d.ventures.length} />
            <div className="mc-list">
              {d.ventures.map(v => (
                <div key={v.id} className="mc-list-row" onClick={() => openNode(v.id)}>
                  <StatusDot status={v.status} />
                  <span className="mc-list-name">{v.name}</span>
                  <span className="mc-list-status">{v.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mc-card glass mc-card-wide">
          <CardHeader icon="▸" title="Roadmap" accent={CARD_ACCENTS.roadmap} />
          <div className="mc-roadmap-cols">
            <div className="mc-roadmap-col">
              <span className="mc-roadmap-tag mc-tag-now">Now</span>
              <ul>{d.roadmap.now.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div className="mc-roadmap-col">
              <span className="mc-roadmap-tag mc-tag-next">Next</span>
              <ul>{d.roadmap.next.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div className="mc-roadmap-col">
              <span className="mc-roadmap-tag mc-tag-later">Later</span>
              <ul>{d.roadmap.later.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          </div>
        </div>

        {d.agents && d.agents.length > 0 && (
          <details className="mc-collapsible">
            <summary>
              <span className="hud-led hud-led-blue" />
              <span className="mc-collapsible-summary-title">Agents & Skills</span>
              <span className="mc-collapsible-summary-meta">
                {d.agents.map(a => a.name).join(' · ')}
              </span>
              <span className="hud-collapse-count">{d.agents.length}</span>
            </summary>
            <div className="mc-collapsible-body">
              <div className="mc-list">
                {d.agents.map(a => (
                  <div key={a.id} className="mc-list-row" onClick={() => openNode(a.id)}>
                    <StatusDot status={a.status === 'planning' ? 'In development' : a.status} />
                    <span className="mc-list-name">{a.name}</span>
                    <span className="mc-list-domain">{a.blurb}</span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        )}

        <div className="mc-row-3">
          <details className="mc-collapsible">
            <summary>
              <span className="hud-led hud-led-blue hud-led-static" style={{ '--hud-led-color': '#0e7490' }} />
              <span className="mc-collapsible-summary-title">Advisory Board</span>
              <span className="mc-collapsible-summary-meta">
                {d.advisors.map(a => a.name.split(' ')[0]).join(' · ')}
              </span>
              <span className="hud-collapse-count">{d.advisors.length}</span>
            </summary>
            <div className="mc-collapsible-body">
              <div className="mc-list">
                {d.advisors.map((a, i) => (
                  <div key={i} className="mc-list-row mc-list-row-static">
                    <span className="mc-list-name">{a.name}</span>
                    <span className="mc-list-domain">{a.domain}</span>
                  </div>
                ))}
              </div>
            </div>
          </details>

          <details className="mc-collapsible">
            <summary>
              <span className="hud-led hud-led-amber" />
              <span className="mc-collapsible-summary-title">KD Academy</span>
              <span className="mc-collapsible-summary-meta">
                {Object.keys(d.academy?.ops || {}).slice(0, 2).join(' · ') || 'academy.krackeddevs.com'}
              </span>
            </summary>
            <div className="mc-collapsible-body">
              <div className="mc-kv-list">
                <div className="mc-kv"><span>Website</span><span>{d.academy?.website || 'academy.krackeddevs.com'}</span></div>
                {Object.entries(d.academy?.ops || {}).map(([k, v]) => (
                  <div key={k} className="mc-kv"><span>{k}</span><span>{v}</span></div>
                ))}
              </div>
            </div>
          </details>

          <details className="mc-collapsible" open>
            <summary>
              <span className="hud-led hud-led-red" />
              <span className="mc-collapsible-summary-title">Revenue</span>
              <span className="mc-collapsible-summary-meta">
                Next: {d.revenue?.nextMilestone || 'Marketplace'}
              </span>
            </summary>
            <div className="mc-collapsible-body">
              <div className="mc-revenue-body">
                <span className="mc-revenue-label">Next milestone</span>
                <span className="mc-revenue-value">{d.revenue?.nextMilestone || 'Marketplace'}</span>
                {d.revenue?.nextMilestoneDetail && (
                  <span className="mc-revenue-sub">{d.revenue.nextMilestoneDetail}</span>
                )}
              </div>
            </div>
          </details>
        </div>

        {d.whatIf && (
          <WhatIfReader content={d.whatIf} graph={graph} onOpen={openNode} />
        )}
      </div>

      {openedNode && (
        <ArticleModal
          node={openedNode}
          graph={graph}
          onClose={closeModal}
          onOpen={openNode}
          trail={trailNodes}
          onJumpTrail={jumpTrail}
        />
      )}
    </div>
  )
}
