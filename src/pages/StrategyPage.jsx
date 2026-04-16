import { useState, useCallback, useRef } from 'react'
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

function Q2HeroSummary() {
  const pillars = [
    { n: 1, title: 'Tenders, Projects & Claw OS Sales', accent: '#3b82f6', bullet: 'One unified outbound motion. Project work, tender wins, Claw OS consultation/workshop/bespoke.' },
    { n: 2, title: 'KD Academy', accent: '#be185d', bullet: '12 Vibe Coding 101 sessions · 3–5 paid tutors · 3× Discord growth. Top of every funnel.' },
    { n: 3, title: 'Kracked Labs', accent: '#7c3aed', bullet: 'No new ventures. Portfolio standardised. Rick drafts Q3 health review.' },
  ]
  const milestones = [
    { label: 'Apr 22', text: 'Itachi live — CEO can ask the vault', status: 'now' },
    { label: 'Apr 30', text: 'Internal Claw OS live + first Sniper agent dry-run', status: 'next' },
    { label: 'May 31', text: 'Pitch deck v1 · Consultation SKU packaged · First proposal out', status: 'later' },
    { label: 'Jun 30', text: '2 signed consultations · 1 workshop booked · 1 bespoke in pipeline', status: 'later' },
  ]
  return (
    <div className="strategy-hero">
      <span className="strategy-eyebrow">Q2 2026 · 11 weeks · Apr 15 → Jun 30</span>
      <h1 className="strategy-thesis">Build Claw OS, sell Claw OS, feed the funnel.</h1>
      <p className="strategy-subthesis">AI company brain — <em>infra before growth</em>.</p>

      <div className="strategy-pillars">
        {pillars.map(p => (
          <div key={p.n} className="strategy-pillar" style={{ '--accent': p.accent }}>
            <span className="strategy-pillar-n">{p.n}</span>
            <div>
              <div className="strategy-pillar-title">{p.title}</div>
              <div className="strategy-pillar-bullet">{p.bullet}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="strategy-milestones">
        {milestones.map((m, i) => (
          <div key={i} className={`strategy-milestone strategy-ms-${m.status}`}>
            <div className="strategy-ms-label">{m.label}</div>
            <div className="strategy-ms-text">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StrategyDocView({ node, nodes, onOpenDoc }) {
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
      if (nodes.some(n => n.id === id && n.category === 'Strategy')) {
        onOpenDoc(id)
      }
    }
  }, [nodes, onOpenDoc])

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

export default function StrategyPage({ graph }) {
  const strategies = graph.nodes.filter(n => n.category === 'Strategy')
  const [activeId, setActiveId] = useState(strategies.find(s => s.id === 'q2-2026')?.id || strategies[0]?.id)
  const active = strategies.find(s => s.id === activeId)

  return (
    <div className="strategy-page">
      <Q2HeroSummary />

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

      {active && <StrategyDocView node={active} nodes={graph.nodes} onOpenDoc={setActiveId} />}
    </div>
  )
}
