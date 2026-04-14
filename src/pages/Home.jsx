import { Link } from 'react-router-dom'
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

export default function Home({ graph }) {
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

  return (
    <div className="home">
      {/* Hero */}
      <div className="home-hero">
        <h1 className="home-hero-title">Kracked Technologies</h1>
        <p className="home-hero-sub">Internal knowledge base — {graph.meta.totalConcepts} concepts, {graph.meta.totalConnections} connections</p>
      </div>

      {/* Top row: Featured + Browse */}
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
            <Link to={`/article/${featured.id}`} className="home-featured-btn">
              Open article &rarr;
            </Link>
          </div>
        </div>

        <div className="home-sidebar-top">
          <div className="home-topics">
            <h3 className="home-section-label">Browse by Topic</h3>
            <div className="home-topic-grid">
              {categoryOrder.filter(c => categoryCounts[c]).map(cat => (
                <Link
                  key={cat}
                  to={`/graph?category=${cat}`}
                  className="home-topic-card"
                  style={{ borderLeft: `3px solid ${CATEGORY_COLORS[cat]}` }}
                >
                  <span className="home-topic-name">{cat}</span>
                  <span className="home-topic-count">{categoryCounts[cat]}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="home-most-connected">
            <h3 className="home-section-label">Most Connected</h3>
            {mostConnected.map((n, i) => (
              <Link key={n.id} to={`/article/${n.id}`} className="home-connected-row">
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
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Category sections */}
      {categoryOrder.filter(c => byCategory[c]).map(cat => (
        <div key={cat} className="home-category-section">
          <div className="home-category-header">
            <span
              className="home-category-dot"
              style={{ background: CATEGORY_COLORS[cat] }}
            />
            <h3 className="home-category-title">{cat}</h3>
            <span className="home-category-count">{byCategory[cat].length} concepts</span>
          </div>
          <div className="home-concept-grid">
            {byCategory[cat].map(n => (
              <Link key={n.id} to={`/article/${n.id}`} className="home-concept-card">
                <div className="home-concept-top">
                  <h4 className="home-concept-name">{n.name}</h4>
                  {n.connections > 0 && (
                    <span className="home-concept-connections">{n.connections}</span>
                  )}
                </div>
                <p className="home-concept-desc">{getExcerpt(n.content, 80)}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
