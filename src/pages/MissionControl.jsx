import { useNavigate } from 'react-router-dom'

const CARD_ACCENTS = {
  deals: '#3b82f6',
  team: '#059669',
  ventures: '#7c3aed',
  roadmap: '#f59e0b',
  advisors: '#0e7490',
  academy: '#be185d',
  graph: '#0052ef',
  revenue: '#dc2626',
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

export default function MissionControl({ graph }) {
  const navigate = useNavigate()
  const d = graph.dashboard
  if (!d) return null

  return (
    <div className="mc">
      <div className="mc-header">
        <div>
          <h1 className="mc-title">Mission Control</h1>
          <p className="mc-subtitle">Last sync: {new Date(graph.meta.syncedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Row 1: Key metrics */}
      <div className="mc-metrics">
        <div className="mc-metric" style={{ borderTopColor: CARD_ACCENTS.team }}>
          <span className="mc-metric-value">{d.team.count}</span>
          <span className="mc-metric-label">Team</span>
        </div>
        <div className="mc-metric" style={{ borderTopColor: CARD_ACCENTS.ventures }}>
          <span className="mc-metric-value">{d.ventures.length}</span>
          <span className="mc-metric-label">Ventures</span>
        </div>
        <div className="mc-metric" style={{ borderTopColor: CARD_ACCENTS.deals }}>
          <span className="mc-metric-value">{d.deals.length}</span>
          <span className="mc-metric-label">Active Deals</span>
        </div>
        <div className="mc-metric" style={{ borderTopColor: CARD_ACCENTS.graph }} onClick={() => navigate('/graph')}>
          <span className="mc-metric-value">{d.graph.total}</span>
          <span className="mc-metric-label">Nodes</span>
        </div>
        <div className="mc-metric" style={{ borderTopColor: CARD_ACCENTS.advisors }}>
          <span className="mc-metric-value">{d.advisors.length}</span>
          <span className="mc-metric-label">Advisors</span>
        </div>
      </div>

      {/* Row 2: Deals + Ventures side by side */}
      <div className="mc-row-2">
        <div className="mc-card" style={{ borderTopColor: CARD_ACCENTS.deals }}>
          <h3 className="mc-card-title">Active Deals</h3>
          <div className="mc-list">
            {d.deals.map(deal => (
              <div key={deal.id} className="mc-list-row" onClick={() => navigate(`/article/${deal.id}`)}>
                <StatusDot status={deal.status} />
                <span className="mc-list-name">{deal.name}</span>
                <span className="mc-list-status">{deal.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mc-card" style={{ borderTopColor: CARD_ACCENTS.ventures }}>
          <h3 className="mc-card-title">Ventures</h3>
          <div className="mc-list">
            {d.ventures.map(v => (
              <div key={v.id} className="mc-list-row" onClick={() => navigate(`/article/${v.id}`)}>
                <StatusDot status={v.status} />
                <span className="mc-list-name">{v.name}</span>
                <span className="mc-list-status">{v.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Roadmap full width */}
      <div className="mc-card mc-card-wide" style={{ borderTopColor: CARD_ACCENTS.roadmap }}>
        <h3 className="mc-card-title">Roadmap</h3>
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

      {/* Row 4: Advisors + Academy + Revenue */}
      <div className="mc-row-3">
        <div className="mc-card" style={{ borderTopColor: CARD_ACCENTS.advisors }}>
          <h3 className="mc-card-title">Advisory Board</h3>
          <div className="mc-list">
            {d.advisors.map((a, i) => (
              <div key={i} className="mc-list-row mc-list-row-static">
                <span className="mc-list-name">{a.name}</span>
                <span className="mc-list-domain">{a.domain}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mc-card" style={{ borderTopColor: CARD_ACCENTS.academy }}>
          <h3 className="mc-card-title">KD Academy</h3>
          <div className="mc-kv-list">
            <div className="mc-kv"><span>Website</span><span>academy.krackeddevs.com</span></div>
            <div className="mc-kv"><span>TVET</span><span>Slides ready, 2nd meeting pending</span></div>
            <div className="mc-kv"><span>Ambassadors</span><span>4 onboarded, KPIs tracking</span></div>
          </div>
        </div>

        <div className="mc-card" style={{ borderTopColor: CARD_ACCENTS.revenue }}>
          <h3 className="mc-card-title">Revenue</h3>
          <div className="mc-revenue-body">
            <span className="mc-revenue-label">Next milestone</span>
            <span className="mc-revenue-value">Marketplace feature</span>
            <span className="mc-revenue-sub">on Kracked Devs</span>
          </div>
        </div>
      </div>
    </div>
  )
}
