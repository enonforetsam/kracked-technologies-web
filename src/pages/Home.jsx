import { useState, useCallback } from 'react'
import { marked } from 'marked'
import { CATEGORY_COLORS } from '../App'
import PageHeader from '../components/PageHeader'

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
    if (exists) return `<a href="#" data-node-id="${slug}" class="wiki-link">${label || target}</a>`
    return label || target
  })
  let out = marked(html)
  out = out.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
  return out
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

function ArticleModal({ node, graph, onClose, onOpen }) {
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

        <div className="mc-modal-head" style={{ borderBottomColor: color + '40' }}>
          <span className="mc-card-icon" style={{ background: color + '22', color }}>◆</span>
          <div className="mc-modal-head-text">
            <span className="mc-modal-category" style={{ color }}>{node.category}</span>
            <h2 className="mc-modal-title">{node.name}</h2>
          </div>
        </div>

        <div className="mc-modal-body">
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
  )
}

const CATEGORY_ICONS = {
  Ecosystem: '◉',
  Platform: '◈',
  Ventures: '▸',
  Projects: '✦',
  Team: '⌘',
  Research: '◆',
  Root: '✧',
}

export default function Home({ graph }) {
  const [openNodeId, setOpenNodeId] = useState(null)

  const openNode = useCallback((id) => {
    if (graph.nodes.find(n => n.id === id)) setOpenNodeId(id)
  }, [graph])

  const openedNode = openNodeId ? graph.nodes.find(n => n.id === openNodeId) : null

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

  const categoryOrder = ['Ecosystem', 'Platform', 'Ventures', 'Projects', 'Team', 'Research', 'Root']

  return (
    <div className="mc">
      <div className="mc-mesh">
        <div className="mc-mesh-blob mc-mesh-blob-1" />
        <div className="mc-mesh-blob mc-mesh-blob-2" />
        <div className="mc-mesh-blob mc-mesh-blob-3" />
      </div>

      <div className="mc-inner">
        <PageHeader
          eyebrow={`${graph.meta.totalConcepts} CONCEPTS · ${graph.meta.totalConnections} CONNECTIONS`}
          title="Wiki"
          subtitle="Every note in the vault, browsable by category. Click a card to read; click a connection to follow the graph."
          visual="wiki"
        />

        {/* Metric strip: category counts */}
        <div className="mc-metrics">
          {categoryOrder.filter(c => categoryCounts[c]).map(cat => (
            <div
              key={cat}
              className="mc-metric glass clickable"
              style={{ '--accent': CATEGORY_COLORS[cat] || '#0052ef' }}
              onClick={() => {
                const firstInCat = byCategory[cat][0]
                if (firstInCat) openNode(firstInCat.id)
              }}
            >
              <span className="mc-metric-label">{cat}</span>
              <span className="mc-metric-value">{categoryCounts[cat]}</span>
            </div>
          ))}
        </div>

        {/* Featured + Most Connected side by side */}
        <div className="mc-row-2">
          <div className="mc-card glass clickable" onClick={() => openNode(featured.id)}>
            <CardHeader icon="★" title="Featured" accent={CATEGORY_COLORS[featured.category] || '#0052ef'} />
            <div className="home-featured-body">
              <h2 className="home-featured-title">{featured.name}</h2>
              <p className="home-featured-excerpt">{getExcerpt(featured.content, 160)}</p>
              <div className="home-featured-meta">
                <span>{featured.wordCount} words</span>
                <span>{featured.connections} connections</span>
              </div>
            </div>
          </div>

          <div className="mc-card glass">
            <CardHeader icon="✦" title="Most Connected" accent="#0052ef" />
            <div className="mc-list">
              {mostConnected.map(n => (
                <div key={n.id} className="mc-list-row" onClick={() => openNode(n.id)}>
                  <span
                    className="status-dot"
                    style={{ background: CATEGORY_COLORS[n.category] || '#0052ef' }}
                  />
                  <span className="mc-list-name">{n.name}</span>
                  <span className="mc-list-status">{n.connections} links</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category sections */}
        {categoryOrder.filter(c => byCategory[c]).map(cat => {
          const color = CATEGORY_COLORS[cat] || '#0052ef'
          const icon = CATEGORY_ICONS[cat] || '◆'
          return (
            <div key={cat} className="mc-card glass mc-card-wide">
              <CardHeader icon={icon} title={cat} accent={color} count={byCategory[cat].length} />
              <div className="home-concept-grid">
                {byCategory[cat].map(n => (
                  <button key={n.id} onClick={() => openNode(n.id)} className="home-concept-card">
                    <div className="home-concept-top">
                      <h4 className="home-concept-name">{n.name}</h4>
                      {n.connections > 0 && (
                        <span className="home-concept-connections">{n.connections}</span>
                      )}
                    </div>
                    <p className="home-concept-desc">{getExcerpt(n.content, 70)}</p>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {openedNode && (
        <ArticleModal
          node={openedNode}
          graph={graph}
          onClose={() => setOpenNodeId(null)}
          onOpen={openNode}
        />
      )}
    </div>
  )
}
