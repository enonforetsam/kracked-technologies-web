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

export default function App() {
  const [graph, setGraph] = useState(null)

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
      </div>
    </HashRouter>
  )
}
