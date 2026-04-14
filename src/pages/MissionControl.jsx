import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_COLORS = {
  'Awaiting Sign-off': '#f59e0b',
  'Awaiting Decision': '#f59e0b',
  'In Progress': '#3b82f6',
  'Live': '#10b981',
  'In development': '#8b5cf6',
  'Unknown': '#6b7280',
}

function StatusDot({ status }) {
  const color = STATUS_COLORS[status] || '#6b7280'
  return <span className="status-dot" style={{ background: color }} />
}

function CardContent({ id, d, navigate }) {
  switch (id) {
    case 'deals':
      return d.deals.map(deal => (
        <div key={deal.id} className="mc-deal-row" onClick={() => navigate(`/article/${deal.id}`)}>
          <StatusDot status={deal.status} />
          <span className="mc-deal-name">{deal.name}</span>
          <span className="mc-deal-status">{deal.status}</span>
        </div>
      ))
    case 'team':
      return (
        <div className="mc-card-center">
          <span className="mc-big-number">{d.team.count}</span>
          <span className="mc-big-label">people</span>
        </div>
      )
    case 'ventures':
      return d.ventures.map(v => (
        <div key={v.id} className="mc-venture-row" onClick={() => navigate(`/article/${v.id}`)}>
          <StatusDot status={v.status} />
          <span className="mc-venture-name">{v.name}</span>
          <span className="mc-venture-status">{v.status}</span>
        </div>
      ))
    case 'roadmap':
      return (
        <>
          <div className="mc-roadmap-section">
            <span className="mc-roadmap-label mc-roadmap-now">Now</span>
            <ul>{d.roadmap.now.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>
          <div className="mc-roadmap-section">
            <span className="mc-roadmap-label mc-roadmap-next">Next</span>
            <ul>{d.roadmap.next.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>
          <div className="mc-roadmap-section">
            <span className="mc-roadmap-label mc-roadmap-later">Later</span>
            <ul>{d.roadmap.later.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>
        </>
      )
    case 'advisors':
      return d.advisors.map((a, i) => (
        <div key={i} className="mc-advisor-row">
          <span className="mc-advisor-name">{a.name}</span>
          <span className="mc-advisor-domain">{a.domain}</span>
        </div>
      ))
    case 'academy':
      return (
        <>
          <div className="mc-academy-stat">
            <span className="mc-academy-label">Website</span>
            <span className="mc-academy-value">academy.krackeddevs.com</span>
          </div>
          <div className="mc-academy-stat">
            <span className="mc-academy-label">TVET</span>
            <span className="mc-academy-value">Slides ready, 2nd meeting pending</span>
          </div>
          <div className="mc-academy-stat">
            <span className="mc-academy-label">Ambassadors</span>
            <span className="mc-academy-value">4 onboarded, KPIs tracking</span>
          </div>
        </>
      )
    case 'graph':
      return (
        <div className="mc-card-center">
          <span className="mc-big-number">{d.graph.total}</span>
          <span className="mc-big-label">nodes</span>
        </div>
      )
    case 'revenue':
      return (
        <div className="mc-card-center">
          <span className="mc-big-label">Next milestone</span>
          <span className="mc-revenue-milestone">Marketplace feature</span>
          <span className="mc-big-label" style={{ marginTop: 8 }}>on Kracked Devs</span>
        </div>
      )
    default:
      return null
  }
}

const CARDS = [
  { id: 'deals', title: 'Active Deals', span: 2, badge: d => d.deals.length },
  { id: 'team', title: 'Team', footer: ['3 advisors', '3 ambassadors', '5 interns'] },
  { id: 'ventures', title: 'Ventures', span: 2, badge: d => d.ventures.length },
  { id: 'roadmap', title: 'Roadmap', span: 2 },
  { id: 'advisors', title: 'Advisory Board', badge: d => d.advisors.length },
  { id: 'academy', title: 'KD Academy' },
  { id: 'graph', title: 'Knowledge Graph', footer: d => [`${d.graph.mission} mission`, `${d.graph.research} research`] },
  { id: 'revenue', title: 'Revenue' },
]

export default function MissionControl({ graph }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)
  const d = graph.dashboard
  if (!d) return null

  const handleCardClick = (cardId, e) => {
    if (e.target.closest('.mc-deal-row') || e.target.closest('.mc-venture-row')) return
    if (cardId === 'graph' && expanded !== 'graph') {
      navigate('/graph')
      return
    }
    setExpanded(expanded === cardId ? null : cardId)
  }

  return (
    <div className="mc">
      <div className="mc-header">
        <h1 className="mc-title">Mission Control</h1>
        <span className="mc-sync">Last sync: {new Date(graph.meta.syncedAt).toLocaleDateString()}</span>
      </div>

      {expanded && <div className="mc-backdrop" onClick={() => setExpanded(null)} />}

      <div className={`mc-grid ${expanded ? 'mc-grid-has-expanded' : ''}`}>
        {CARDS.map(card => {
          const isExpanded = expanded === card.id
          const badge = typeof card.badge === 'function' ? card.badge(d) : card.badge
          const footer = typeof card.footer === 'function' ? card.footer(d) : card.footer

          return (
            <div
              key={card.id}
              className={`mc-card mc-card-${card.id} ${isExpanded ? 'mc-card-expanded' : ''} ${expanded && !isExpanded ? 'mc-card-dimmed' : ''}`}
              style={!isExpanded && card.span ? { gridColumn: `span ${card.span}` } : undefined}
              onClick={(e) => handleCardClick(card.id, e)}
            >
              <div className="mc-card-header">
                <h3>{card.title}</h3>
                <div className="mc-card-header-actions">
                  {badge && <span className="mc-badge">{badge}</span>}
                  {isExpanded && (
                    <button className="mc-card-close" onClick={(e) => { e.stopPropagation(); setExpanded(null) }}>
                      &times;
                    </button>
                  )}
                </div>
              </div>
              <div className="mc-card-body">
                <CardContent id={card.id} d={d} navigate={navigate} />
              </div>
              {footer && (
                <div className="mc-card-footer">
                  {footer.map((item, i) => <span key={i}>{item}</span>)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
