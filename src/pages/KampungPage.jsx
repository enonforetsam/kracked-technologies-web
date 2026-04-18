import { useState, useRef, useMemo, useEffect } from 'react'
import { marked } from 'marked'
import PageHeader from '../components/PageHeader'

function renderContent(content, nodes) {
  let html = content
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
      const slug = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const exists = nodes.some(n => n.id === slug)
      if (exists) return `<a href="#/article/${slug}">${label || target}</a>`
      return label || target
    })
  let out = marked(html)
  out = out.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
  return out
}

function parseChapters(content) {
  const body = content.replace(/^---[\s\S]*?---\s*/m, '').replace(/^#[^\n]*\n+/, '').trim()
  const lines = body.split('\n')
  const chapters = []
  let current = { title: 'Overview', body: [] }
  for (const line of lines) {
    if (/^---\s*$/.test(line)) continue
    const m = line.match(/^##\s+(.+?)\s*$/)
    if (m) {
      if (current.body.some(l => l.trim())) {
        chapters.push({ title: current.title, body: current.body.join('\n').trim() })
      }
      current = { title: m[1].replace(/\*\*/g, ''), body: [] }
    } else {
      current.body.push(line)
    }
  }
  if (current.body.some(l => l.trim())) {
    chapters.push({ title: current.title, body: current.body.join('\n').trim() })
  }
  return chapters
}

export default function KampungPage({ graph }) {
  const node = graph.nodes.find(n => n.id === 'the-kracked-kampung')
  const [idx, setIdx] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const bodyRef = useRef(null)

  const chapters = useMemo(() => node ? parseChapters(node.content) : [], [node])
  const total = chapters.length

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [idx])

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

  if (!node || total === 0) {
    return (
      <div className="vision-page" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Kampung white paper not found in vault.</p>
      </div>
    )
  }

  const current = chapters[idx] || chapters[0]
  const html = renderContent(current.body, graph.nodes)

  const reader = (
    <div className={`vision-reader${fullscreen ? ' vision-fullscreen' : ''}`}>
      <div className="vision-head">
        <div className="vision-head-left">
          <span className="hud-led hud-led-blue" />
          <span className="vision-head-title">Kampung Economics</span>
          <span className="vision-head-chapter">{current.title}</span>
        </div>
        <div className="vision-head-controls">
          <span className="hud-ribbon" style={{ marginRight: 8 }}>
            <span>{idx + 1} / {total}</span>
          </span>
          <button className="mc-whatif-ctrl" onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {fullscreen ? '⤓' : '⤢'}
          </button>
          {fullscreen && (
            <button className="mc-whatif-ctrl mc-whatif-close" onClick={() => setFullscreen(false)} title="Close">×</button>
          )}
        </div>
      </div>

      <div className="vision-progress">
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

      <div className="vision-shell">
        <aside className="vision-sidebar">
          <h3>Chapters</h3>
          <div className="vision-toc">
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

        <div className="vision-main">
          <div ref={bodyRef} className="article-body vision-chapter">
            <div className="vision-chapter-header">
              <span className="vision-chapter-eyebrow">Chapter {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
              <h1 className="vision-chapter-heading">{current.title}</h1>
            </div>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          <div className="vision-nav">
            <button
              className="mc-whatif-navbtn"
              onClick={() => setIdx(i => Math.max(0, i - 1))}
              disabled={idx === 0}
            >← Previous</button>
            <span className="mc-whatif-navcount">{idx + 1} of {total}</span>
            <button
              className="mc-whatif-navbtn mc-whatif-navbtn-primary"
              onClick={() => setIdx(i => Math.min(total - 1, i + 1))}
              disabled={idx === total - 1}
              style={{ background: 'var(--blue)' }}
            >Next →</button>
          </div>
        </div>
      </div>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="vision-page">
        <div className="mc-whatif-overlay" onClick={e => { if (e.target === e.currentTarget) setFullscreen(false) }}>
          {reader}
        </div>
      </div>
    )
  }

  return (
    <div className="vision-page">
      <PageHeader
        eyebrow="WHITE PAPER · PROPOSAL · APRIL 2026"
        title="Kampung Economics"
        subtitle="A self-sustaining on-chain builder economy. The Kracked Kampung, tokenised. Network School as reference, Malaysia as home. Proposal, not commitment."
        visual="kampung"
      />
      {reader}
    </div>
  )
}
