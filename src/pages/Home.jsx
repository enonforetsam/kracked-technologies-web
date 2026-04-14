import { useState, useRef, useCallback } from 'react'
import { marked } from 'marked'
import { CATEGORY_COLORS } from '../App'

function getExcerpt(content, len = 120) {
  return content
    .replace(/^#[^\n]*\n+/, '')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[#|>\-*`]/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, len)
}

function renderContent(content, nodes) {
  let html = content.replace(/^#[^\n]*\n/, '')
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const slug = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const exists = nodes.some(n => n.id === slug)
    if (exists) {
      return `<a href="#" data-node-id="${slug}" class="wiki-link">${label || target}</a>`
    }
    return label || target
  })
  return marked(html)
}

function extractHeadings(content) {
  return content.split('\n')
    .filter(l => /^#{2,3}\s/.test(l))
    .map(l => {
      const level = l.match(/^(#+)/)[1].length
      const text = l.replace(/^#+\s*/, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return { level, text, id }
    })
}

export default function Home({ graph }) {
  const [selected, setSelected] = useState(null)
  const panelRef = useRef(null)

  const featured = graph.nodes.reduce((a, b) => a.connections > b.connections ? a : b)

  const categoryCounts = {}
  for (const n of graph.nodes) {
    categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1
  }

  const mostConnected = [...graph.nodes]
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5)

  const byCategory = {}
  for (const n of graph.nodes) {
    if (!byCategory[n.category]) byCategory[n.category] = []
    byCategory[n.category].push(n)
  }
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => b.connections - a.connections)
  }

  const categoryOrder = ['Ecosystem', 'Platform', 'Ventures', 'Projects', 'Team', 'Root']

  const selectNode = useCallback((id) => {
    const node = graph.nodes.find(n => n.id === id)
    if (node) {
      setSelected(node)
      if (panelRef.current) panelRef.current.scrollTop = 0
    }
  }, [graph])

  const closePanel = useCallback(() => {
    setSelected(null)
  }, [])

  const handlePanelClick = useCallback((e) => {
    const link = e.target.closest('[data-node-id]')
    if (link) {
      e.preventDefault()
      selectNode(link.dataset.nodeId)
    }
  }, [selectNode])

  const neighbors = selected
    ? (() => {
        const ids = new Set()
        for (const edge of graph.edges) {
          if (edge.source === selected.id) ids.add(edge.target)
          if (edge.target === selected.id) ids.add(edge.source)
        }
        return graph.nodes.filter(n => ids.has(n.id))
      })()
    : []

  const articleHtml = selected ? renderContent(selected.content, graph.nodes) : ''
  const headings = selected ? extractHeadings(selected.content) : []

  return (
    <div className="home-layout">
      <div className={`home ${selected ? 'home-with-panel' : ''}`}>
        {/* Hero */}
        <div className="home-hero">
          <h1 className="home-hero-title">Kracked Technologies</h1>
          <p className="home-hero-sub">Internal knowledge base — {graph.meta.totalConcepts} concepts, {graph.meta.totalConnections} connections</p>
        </div>

        {/* Top row */}
        <div className="home-top">
          <div className="home-featured">
            <div className="home-featured-inner">
              <span className="spotlight-badge">Spotlight</span>
              <h2 className="home-featured-title">{featured.name}</h2>
              <p className="home-featured-excerpt">{getExcerpt(featured.content, 180)}</p>
              <div className="home-featured-meta">
                <span>{featured.wordCount} words</span>
                <span>{featured.connections} connections</span>
              </div>
              <button onClick={() => selectNode(featured.id)} className="home-featured-btn">
                Open article &rarr;
              </button>
            </div>
          </div>

          <div className="home-sidebar-top">
            <div className="home-topics">
              <h3 className="home-section-label">Browse by Topic</h3>
              <div className="home-topic-grid">
                {categoryOrder.filter(c => categoryCounts[c]).map(cat => (
                  <button
                    key={cat}
                    className="home-topic-card"
                    style={{ borderLeft: `3px solid ${CATEGORY_COLORS[cat]}` }}
                  >
                    <span className="home-topic-name">{cat}</span>
                    <span className="home-topic-count">{categoryCounts[cat]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="home-most-connected">
              <h3 className="home-section-label">Most Connected</h3>
              {mostConnected.map(n => (
                <button key={n.id} onClick={() => selectNode(n.id)} className="home-connected-row">
                  <span className="home-connected-name">{n.name}</span>
                  <span className="home-connected-bar">
                    <span
                      className="home-connected-fill"
                      style={{
                        width: `${(n.connections / mostConnected[0].connections) * 100}%`,
                        background: CATEGORY_COLORS[n.category] || '#5b76fe',
                      }}
                    />
                  </span>
                  <span className="home-connected-count">{n.connections}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category sections */}
        {categoryOrder.filter(c => byCategory[c]).map(cat => (
          <div key={cat} className="home-category-section">
            <div className="home-category-header">
              <span className="home-category-dot" style={{ background: CATEGORY_COLORS[cat] }} />
              <h3 className="home-category-title">{cat}</h3>
              <span className="home-category-count">{byCategory[cat].length} concepts</span>
            </div>
            <div className="home-concept-grid">
              {byCategory[cat].map(n => (
                <button key={n.id} onClick={() => selectNode(n.id)} className="home-concept-card">
                  <div className="home-concept-top">
                    <h4 className="home-concept-name">{n.name}</h4>
                    {n.connections > 0 && (
                      <span className="home-concept-connections">{n.connections}</span>
                    )}
                  </div>
                  <p className="home-concept-desc">{getExcerpt(n.content, 80)}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Slide-in article panel */}
      {selected && (
        <div className="article-panel wiki-article-panel" ref={panelRef} onClick={handlePanelClick}>
          <button className="article-panel-close" onClick={(e) => { e.stopPropagation(); closePanel() }}>
            &times;
          </button>

          <nav className="article-panel-breadcrumb">
            <span className="breadcrumb-link" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); closePanel() }}>Wiki</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-link breadcrumb-category">{selected.category}</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{selected.name}</span>
          </nav>

          <h1 className="article-panel-title">{selected.name}</h1>
          <div className="article-panel-meta">
            <span
              className="article-panel-badge"
              style={{
                background: (CATEGORY_COLORS[selected.category] || '#5b76fe') + '1a',
                color: CATEGORY_COLORS[selected.category] || '#5b76fe',
              }}
            >
              {selected.category}
            </span>
            <span>{selected.connections} connections</span>
            <span>{selected.wordCount}w</span>
          </div>

          {headings.length > 0 && (
            <div className="article-panel-toc">
              {headings.map((h, i) => (
                <a key={i} href={`#${h.id}`} className="toc-item" style={{ paddingLeft: h.level === 3 ? 12 : 0 }}>
                  {h.text}
                </a>
              ))}
            </div>
          )}

          <div className="article-body" dangerouslySetInnerHTML={{ __html: articleHtml }} />

          {neighbors.length > 0 && (
            <div className="article-panel-connections">
              <h4>Connections ({neighbors.length})</h4>
              <div className="article-panel-conn-grid">
                {neighbors.map(n => (
                  <button
                    key={n.id}
                    className="article-panel-conn-link"
                    onClick={(e) => { e.stopPropagation(); selectNode(n.id) }}
                  >
                    {n.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
