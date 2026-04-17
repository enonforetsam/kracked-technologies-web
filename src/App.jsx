import { useState, useEffect, createContext, useContext } from 'react'
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import GraphPage from './pages/GraphPage'
import Home from './pages/Home'
import ArticlePage from './pages/ArticlePage'
import MissionControl from './pages/MissionControl'
import StrategyPage from './pages/StrategyPage'
import VisionPage from './pages/VisionPage'

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

const THEMES = [
  { id: 'light', label: 'Light', colors: ['#ffffff', '#0052ef', '#f36458'] },
  { id: 'cyberpunk', label: 'Cyberpunk', colors: ['#0a0a0f', '#00f0ff', '#ff2d7b'] },
  { id: 'midnight', label: 'Midnight', colors: ['#0d0a1a', '#a78bfa', '#f472b6'] },
  { id: 'emerald', label: 'Emerald', colors: ['#060f0a', '#34d399', '#f59e0b'] },
  { id: 'sunset', label: 'Sunset', colors: ['#1a0e08', '#f97316', '#fb7185'] },
]

const ThemeContext = createContext()
export function useTheme() { return useContext(ThemeContext) }
export { THEMES }

function ModeNav() {
  const location = useLocation()
  const path = location.pathname
  const { theme, setTheme, showSettings, setShowSettings } = useTheme()

  return (
    <nav className="mode-nav">
      <Link to="/" className="mode-nav-brand">Kracked Technologies</Link>
      <div className="mode-nav-tabs">
        <Link to="/" className={`mode-nav-tab ${path === '/' ? 'mode-nav-tab-active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          Control
        </Link>
        <Link to="/graph" className={`mode-nav-tab ${path === '/graph' ? 'mode-nav-tab-active' : ''}`}>
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
        <Link to="/strategy" className={`mode-nav-tab ${path.startsWith('/strategy') ? 'mode-nav-tab-active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2"/>
          </svg>
          Strategy
        </Link>
        <Link to="/vision" className={`mode-nav-tab ${path.startsWith('/vision') ? 'mode-nav-tab-active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
          </svg>
          Vision
        </Link>
      </div>
      <div className="mode-nav-right">
        <button
          className="mode-nav-settings"
          onClick={() => setShowSettings(s => !s)}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
        {showSettings && (
          <div className="global-settings-dropdown">
            <h4>Theme</h4>
            <div className="theme-picker">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  className={`theme-swatch ${theme === t.id ? 'theme-active' : ''}`}
                  onClick={() => setTheme(t.id)}
                >
                  <div className="theme-swatch-colors">
                    {t.colors.map((c, i) => <div key={i} style={{ background: c }} />)}
                  </div>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
            <p>This is a living knowledge base — every concept, venture, team member, and research thread in the Kracked ecosystem, connected in a single graph.</p>
          </section>

          <section className="info-section">
            <h3>How data flows</h3>
            <div className="info-flow">
              <div className="info-flow-step">
                <span className="info-flow-num">1</span>
                <div><strong>Team submits daily</strong><p>Work done, blockers, insights — tagged to projects</p></div>
              </div>
              <div className="info-flow-step">
                <span className="info-flow-num">2</span>
                <div><strong>Obsidian vault updates</strong><p>Reports processed into structured notes</p></div>
              </div>
              <div className="info-flow-step">
                <span className="info-flow-num">3</span>
                <div><strong>Graph syncs automatically</strong><p>Connections and insights surface across the ecosystem</p></div>
              </div>
              <div className="info-flow-step">
                <span className="info-flow-num">4</span>
                <div><strong>Everyone learns from it</strong><p>Onboarding, decisions, strategy — all in one place</p></div>
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
  const [theme, setTheme] = useState('light')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const isDev = window.location.hostname === 'localhost'
    const url = isDev
      ? '/graph.json'
      : 'https://gchcateoazgaft85.public.blob.vercel-storage.com/graph.json'
    fetch(url).then(r => r.json()).then(setGraph)
  }, [])

  // Close settings dropdown on outside click
  useEffect(() => {
    if (!showSettings) return
    const handler = (e) => {
      if (!e.target.closest('.mode-nav-right')) setShowSettings(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showSettings])

  if (!graph) return null

  return (
    <ThemeContext.Provider value={{ theme, setTheme, showSettings, setShowSettings }}>
      <HashRouter>
        <div className="app">
          <ModeNav />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<MissionControl graph={graph} />} />
              <Route path="/graph" element={<GraphPage graph={graph} />} />
              <Route path="/wiki" element={<Home graph={graph} />} />
              <Route path="/strategy" element={<StrategyPage graph={graph} />} />
              <Route path="/vision" element={<VisionPage graph={graph} />} />
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
    </ThemeContext.Provider>
  )
}
