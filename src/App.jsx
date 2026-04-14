import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import GraphPage from './pages/GraphPage'
import Home from './pages/Home'
import ArticlePage from './pages/ArticlePage'

const CATEGORY_COLORS = {
  Ecosystem: '#00f0ff',
  Platform: '#ff6b2d',
  Ventures: '#b44dff',
  Projects: '#ff2d7b',
  Team: '#39ff14',
  Root: '#ffe600',
  'Venture Capital': '#f59e0b',
  'Venture Builder': '#06b6d4',
  'Accelerator': '#8b5cf6',
  'Gov Funding': '#10b981',
  'Startup': '#ef4444',
  'Research': '#64748b',
}

export { CATEGORY_COLORS }

function ModeNav() {
  const location = useLocation()
  const path = location.pathname

  return (
    <nav className="mode-nav">
      <Link to="/" className="mode-nav-brand">Kracked Technologies</Link>
      <div className="mode-nav-tabs">
        <Link to="/" className={`mode-nav-tab ${path === '/' ? 'mode-nav-tab-active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>
            <line x1="12" y1="10" x2="5" y2="8"/><line x1="12" y1="10" x2="19" y2="8"/><line x1="12" y1="14" x2="5" y2="16"/><line x1="12" y1="14" x2="19" y2="16"/>
          </svg>
          Graph
        </Link>
        <Link to="/wiki" className={`mode-nav-tab ${path === '/wiki' ? 'mode-nav-tab-active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          Wiki
        </Link>
      </div>
    </nav>
  )
}

function InfoModal({ onClose }) {
  return (
    <div className="info-overlay" onClick={onClose}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose}>&times;</button>

        <div className="info-modal-header">
          <div className="info-modal-pulse-dot" />
          <h2>Kracked OS</h2>
        </div>
        <p className="info-modal-subtitle">The central nervous system of Kracked Technologies</p>

        <div className="info-modal-body">
          <section className="info-section">
            <h3>What is this?</h3>
            <p>This is a living knowledge base — every concept, venture, team member, and research thread in the Kracked ecosystem, connected in a single graph. It gets smarter every day as the team feeds into it.</p>
          </section>

          <section className="info-section">
            <h3>How data flows</h3>
            <div className="info-flow">
              <div className="info-flow-step">
                <span className="info-flow-num">1</span>
                <div>
                  <strong>Team submits daily</strong>
                  <p>Work done, blockers, insights — tagged to projects</p>
                </div>
              </div>
              <div className="info-flow-step">
                <span className="info-flow-num">2</span>
                <div>
                  <strong>Obsidian vault updates</strong>
                  <p>Reports processed into structured notes — the source of truth</p>
                </div>
              </div>
              <div className="info-flow-step">
                <span className="info-flow-num">3</span>
                <div>
                  <strong>Graph syncs automatically</strong>
                  <p>Connections, insights, and gaps surface across the ecosystem</p>
                </div>
              </div>
              <div className="info-flow-step">
                <span className="info-flow-num">4</span>
                <div>
                  <strong>Everyone learns from it</strong>
                  <p>Onboarding, decision-making, and strategy — all in one place</p>
                </div>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h3>Roadmap</h3>
            <div className="info-roadmap">
              <div className="info-roadmap-phase info-roadmap-done">
                <strong>Phase 1 — Foundation</strong>
                <ul>
                  <li>Obsidian vault as source of truth</li>
                  <li>Graph + Wiki views</li>
                  <li>Sync pipeline to Vercel</li>
                  <li>Research section</li>
                </ul>
              </div>
              <div className="info-roadmap-phase info-roadmap-current">
                <strong>Phase 2 — Intelligence</strong>
                <ul>
                  <li>Daily report submission</li>
                  <li>AI processing → auto-update notes</li>
                  <li>Weekly summaries per venture & person</li>
                  <li>Stale project detection</li>
                </ul>
              </div>
              <div className="info-roadmap-phase">
                <strong>Phase 3 — Full OS</strong>
                <ul>
                  <li>Real-time collaboration</li>
                  <li>Metrics dashboard</li>
                  <li>Decision log</li>
                  <li>AI assistant for the ecosystem</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [graph, setGraph] = useState(null)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    const isDev = window.location.hostname === 'localhost'
    const url = isDev
      ? '/graph.json'
      : 'https://gchcateoazgaft85.public.blob.vercel-storage.com/graph.json'
    fetch(url).then(r => r.json()).then(setGraph)
  }, [])

  if (!graph) return null

  return (
    <HashRouter>
      <div className="app">
        <ModeNav />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<GraphPage graph={graph} />} />
            <Route path="/wiki" element={<Home graph={graph} />} />
            <Route path="/article/:id" element={<ArticlePage graph={graph} />} />
          </Routes>
        </div>

        <button className="info-trigger" onClick={() => setShowInfo(true)} title="About Kracked OS">
          <span className="info-trigger-ping" />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </button>

        {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      </div>
    </HashRouter>
  )
}
