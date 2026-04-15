import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import { CATEGORY_COLORS } from '../App'

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

function renderContent(content, nodes) {
  let html = content.replace(/^#[^\n]*\n/, '')
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const slug = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const exists = nodes.some(n => n.id === slug)
    if (exists) return `<a href="#" data-node-id="${slug}" class="wiki-link">${label || target}</a>`
    return label || target
  })
  let out = marked(html)
  // External links open in new tab
  out = out.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
  return out
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

export default function MissionControl({ graph }) {
  const navigate = useNavigate()
  const [openNodeId, setOpenNodeId] = useState(null)
  const d = graph.dashboard
  if (!d) return null

  const openNode = useCallback((id) => {
    if (graph.nodes.find(n => n.id === id)) setOpenNodeId(id)
  }, [graph])

  const openedNode = openNodeId ? graph.nodes.find(n => n.id === openNodeId) : null

  return (
    <div className="mc">
      <div className="mc-mesh">
        <div className="mc-mesh-blob mc-mesh-blob-1" />
        <div className="mc-mesh-blob mc-mesh-blob-2" />
        <div className="mc-mesh-blob mc-mesh-blob-3" />
      </div>

      <div className="mc-inner">
        <div className="mc-header">
          <h1 className="mc-title">Mission Control</h1>
          <p className="mc-subtitle">Last sync · {new Date(graph.meta.syncedAt).toLocaleDateString()}</p>
        </div>

        {d.thisWeek && (
          <div className="mc-card glass mc-card-wide mc-thisweek">
            <CardHeader icon="★" title="This Week" accent={CARD_ACCENTS.thisWeek} />
            <div
              className="article-body mc-thisweek-body"
              onClickCapture={(e) => {
                const link = e.target.closest('[data-node-id]')
                if (link) { e.preventDefault(); openNode(link.dataset.nodeId) }
              }}
              dangerouslySetInnerHTML={{ __html: renderContent(d.thisWeek, graph.nodes) }}
            />
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
          <div className="mc-card glass mc-card-wide">
            <CardHeader icon="◎" title="Agents & Skills" accent={CARD_ACCENTS.agents} count={d.agents.length} />
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
        )}

        <div className="mc-row-3">
          <div className="mc-card glass">
            <CardHeader icon="✦" title="Advisory Board" accent={CARD_ACCENTS.advisors} count={d.advisors.length} />
            <div className="mc-list">
              {d.advisors.map((a, i) => (
                <div key={i} className="mc-list-row mc-list-row-static">
                  <span className="mc-list-name">{a.name}</span>
                  <span className="mc-list-domain">{a.domain}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mc-card glass">
            <CardHeader icon="⌘" title="KD Academy" accent={CARD_ACCENTS.academy} />
            <div className="mc-kv-list">
              <div className="mc-kv"><span>Website</span><span>academy.krackeddevs.com</span></div>
              <div className="mc-kv"><span>TVET</span><span>Slides ready, 2nd meeting pending</span></div>
              <div className="mc-kv"><span>Ambassadors</span><span>4 onboarded, KPIs tracking</span></div>
            </div>
          </div>

          <div className="mc-card glass">
            <CardHeader icon="◆" title="Revenue" accent={CARD_ACCENTS.revenue} />
            <div className="mc-revenue-body">
              <span className="mc-revenue-label">Next milestone</span>
              <span className="mc-revenue-value">Marketplace</span>
              <span className="mc-revenue-sub">on Kracked Devs</span>
            </div>
          </div>
        </div>
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
