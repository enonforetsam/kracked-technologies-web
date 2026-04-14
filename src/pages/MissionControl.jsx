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

export default function MissionControl({ graph }) {
  const navigate = useNavigate()
  const d = graph.dashboard
  if (!d) return null

  const liveVentures = d.ventures.filter(v => v.status === 'Live').length
  const devVentures = d.ventures.filter(v => v.status !== 'Live').length

  return (
    <div className="mc">
      <div className="mc-header">
        <h1 className="mc-title">Mission Control</h1>
        <span className="mc-sync">Last sync: {new Date(graph.meta.syncedAt).toLocaleDateString()}</span>
      </div>

      <div className="mc-grid">
        {/* Active Deals */}
        <div className="mc-card mc-card-deals">
          <div className="mc-card-header">
            <h3>Active Deals</h3>
            <span className="mc-badge">{d.deals.length}</span>
          </div>
          <div className="mc-card-body">
            {d.deals.map(deal => (
              <div key={deal.id} className="mc-deal-row" onClick={() => navigate(`/article/${deal.id}`)}>
                <StatusDot status={deal.status} />
                <span className="mc-deal-name">{deal.name}</span>
                <span className="mc-deal-status">{deal.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mc-card mc-card-team">
          <div className="mc-card-header">
            <h3>Team</h3>
          </div>
          <div className="mc-card-body mc-card-center">
            <span className="mc-big-number">{d.team.count}</span>
            <span className="mc-big-label">people</span>
          </div>
          <div className="mc-card-footer">
            <span>3 advisors</span>
            <span>3 ambassadors</span>
            <span>5 interns</span>
          </div>
        </div>

        {/* Ventures */}
        <div className="mc-card mc-card-ventures">
          <div className="mc-card-header">
            <h3>Ventures</h3>
            <span className="mc-badge">{d.ventures.length}</span>
          </div>
          <div className="mc-card-body">
            {d.ventures.map(v => (
              <div key={v.id} className="mc-venture-row" onClick={() => navigate(`/article/${v.id}`)}>
                <StatusDot status={v.status} />
                <span className="mc-venture-name">{v.name}</span>
                <span className="mc-venture-status">{v.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="mc-card mc-card-roadmap">
          <div className="mc-card-header">
            <h3>Roadmap</h3>
          </div>
          <div className="mc-card-body">
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
          </div>
        </div>

        {/* Advisors */}
        <div className="mc-card mc-card-advisors">
          <div className="mc-card-header">
            <h3>Advisory Board</h3>
            <span className="mc-badge">{d.advisors.length}</span>
          </div>
          <div className="mc-card-body">
            {d.advisors.map((a, i) => (
              <div key={i} className="mc-advisor-row">
                <span className="mc-advisor-name">{a.name}</span>
                <span className="mc-advisor-domain">{a.domain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KD Academy */}
        <div className="mc-card mc-card-academy">
          <div className="mc-card-header">
            <h3>KD Academy</h3>
          </div>
          <div className="mc-card-body">
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
          </div>
        </div>

        {/* Graph link */}
        <div className="mc-card mc-card-graph" onClick={() => navigate('/graph')}>
          <div className="mc-card-header">
            <h3>Knowledge Graph</h3>
          </div>
          <div className="mc-card-body mc-card-center">
            <span className="mc-big-number">{d.graph.total}</span>
            <span className="mc-big-label">nodes</span>
          </div>
          <div className="mc-card-footer">
            <span>{d.graph.mission} mission</span>
            <span>{d.graph.research} research</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="mc-card mc-card-revenue" onClick={() => navigate('/article/revenue-model')}>
          <div className="mc-card-header">
            <h3>Revenue</h3>
          </div>
          <div className="mc-card-body mc-card-center">
            <span className="mc-big-label">Next milestone</span>
            <span className="mc-revenue-milestone">Marketplace feature</span>
            <span className="mc-big-label" style={{ marginTop: 8 }}>on Kracked Devs</span>
          </div>
        </div>
      </div>
    </div>
  )
}
