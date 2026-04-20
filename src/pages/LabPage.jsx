import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ForceGraph2D from 'react-force-graph-2d'

const LAB_OWNER = "The Master Lab"
const LAB_BOOT = Date.now()

function formatUptime(ms) {
  const s = Math.floor(ms / 1000)
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
}

function useTypewriter(text, speed = 45) {
  const [out, setOut] = useState('')
  useEffect(() => {
    setOut('')
    let i = 0
    const t = setInterval(() => {
      i++
      setOut(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, speed)
    return () => clearInterval(t)
  }, [text, speed])
  return out
}

function LabHeadline({ text }) {
  const typed = useTypewriter(text, 60)
  return <span>{typed}<span className="lab-cursor lab-cursor-bar">▊</span></span>
}

function TerminalStrip() {
  const [uptime, setUptime] = useState('00:00:00')
  useEffect(() => {
    const t = setInterval(() => setUptime(formatUptime(Date.now() - LAB_BOOT)), 1000)
    return () => clearInterval(t)
  }, [])
  const date = useMemo(() => new Date().toISOString().slice(0, 10), [])
  return (
    <div className="lab-terminal">
      <div className="lab-terminal-section">
        <span className="lab-terminal-dot lab-terminal-dot-amber" />
        <span>☤ SYS::LAB</span>
      </div>
      <span className="lab-terminal-sep" />
      <div className="lab-terminal-section"><span>HOST::LOCAL</span></div>
      <span className="lab-terminal-sep" />
      <div className="lab-terminal-section"><span>AUTH::DANIAL</span></div>
      <span className="lab-terminal-sep" />
      <div className="lab-terminal-section"><span>DATE::{date}</span></div>
      <span className="lab-terminal-sep lab-terminal-sep-flex" />
      <div className="lab-terminal-section lab-terminal-section-right">
        <span>UPTIME::{uptime}</span>
        <span className="lab-terminal-cursor">▊</span>
      </div>
    </div>
  )
}

const EXPERIMENTS = [
  {
    id: 'kracked-technologies',
    name: 'Kracked Technologies',
    tag: 'COMPANY',
    accent: '#DD8E35',
    summary: 'Everything you are building — community, academy, labs, ventures, deals, strategy, vision, the AI campus.',
    siteUrl: '/#/kracked',
    siteLabel: 'Open Mission Control',
    kind: 'company',
  },
  {
    id: 'notes',
    name: 'Notes + Ideas',
    tag: 'CAPTURE',
    accent: '#C98F3B',
    summary: 'Inbox for half-thoughts and ideas. Syncs to the vault diary when Kracked OS is wired.',
    siteUrl: '/#/',
    siteLabel: 'Open inbox',
    kind: 'experiment',
  },
  {
    id: 'my-network',
    name: 'My Network',
    tag: 'PEOPLE',
    accent: '#B8752D',
    summary: 'People around you — advisors, team, partners, founder-friends. Warm contacts and who they know.',
    siteUrl: '/#/article/my-network',
    siteLabel: 'Browse network',
    kind: 'tool',
  },
  {
    id: 'agents-skills',
    name: 'Agents + Skills',
    tag: 'RUNTIME',
    accent: '#9B6522',
    summary: 'The AI runtime — agent specs you can invoke, skills you can run. Scoped per project.',
    siteUrl: '/#/article/agents',
    siteLabel: 'Open runtime',
    kind: 'narrative',
  },
]

const ARTWORK = {
  company: (accent, id) => (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id={`${id}-g`} x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={accent} stopOpacity="0.3" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient></defs>
      <rect width="400" height="200" fill={`url(#${id}-g)`} />
      <g stroke={accent} strokeWidth="1.2" fill="none">
        <rect x="60" y="50" width="90" height="50" rx="3" opacity="0.8" />
        <rect x="170" y="50" width="90" height="50" rx="3" opacity="0.55" />
        <rect x="280" y="50" width="80" height="50" rx="3" opacity="0.35" />
        <rect x="60" y="115" width="300" height="40" rx="3" opacity="0.4" />
        <line x1="72" y1="64" x2="132" y2="64" />
        <line x1="72" y1="78" x2="118" y2="78" opacity="0.6" />
        <line x1="182" y1="64" x2="232" y2="64" opacity="0.7" />
        <line x1="292" y1="64" x2="332" y2="64" opacity="0.5" />
        <line x1="72" y1="132" x2="280" y2="132" opacity="0.6" />
      </g>
    </svg>
  ),
  narrative: (accent, id) => (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id={`${id}-g`} x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={accent} stopOpacity="0.32" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient></defs>
      <rect width="400" height="200" fill={`url(#${id}-g)`} />
      <g stroke={accent} strokeWidth="1.3" fill="none">
        <polygon points="200 40 280 90 280 150 200 180 120 150 120 90" />
        <polygon points="200 60 260 100 260 140 200 160 140 140 140 100" opacity="0.55" />
        <circle cx="200" cy="120" r="8" fill={accent} />
      </g>
    </svg>
  ),
  tool: (accent, id) => (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id={`${id}-g`} x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={accent} stopOpacity="0.3" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient></defs>
      <rect width="400" height="200" fill={`url(#${id}-g)`} />
      <g stroke={accent} strokeWidth="1.3" fill="none">
        <circle cx="200" cy="100" r="14" fill="#1a1a22" />
        <circle cx="200" cy="100" r="14" />
        <circle cx="200" cy="100" r="48" opacity="0.45" />
        <circle cx="200" cy="100" r="80" opacity="0.2" />
        <circle cx="90" cy="60" r="6" fill={accent} />
        <circle cx="310" cy="60" r="6" fill={accent} />
        <circle cx="90" cy="140" r="6" fill={accent} opacity="0.7" />
        <circle cx="310" cy="140" r="6" fill={accent} opacity="0.7" />
        <line x1="200" y1="100" x2="90" y2="60" />
        <line x1="200" y1="100" x2="310" y2="60" />
        <line x1="200" y1="100" x2="90" y2="140" opacity="0.75" />
        <line x1="200" y1="100" x2="310" y2="140" opacity="0.75" />
      </g>
    </svg>
  ),
  experiment: (accent, id) => (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id={`${id}-g`} x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={accent} stopOpacity="0.3" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient></defs>
      <rect width="400" height="200" fill={`url(#${id}-g)`} />
      <g stroke={accent} strokeWidth="1.3" fill="none">
        <circle cx="140" cy="100" r="30" opacity="0.7" />
        <circle cx="200" cy="100" r="30" />
        <circle cx="260" cy="100" r="30" opacity="0.5" />
        <line x1="60" y1="100" x2="340" y2="100" strokeDasharray="3 3" opacity="0.35" />
        <circle cx="200" cy="100" r="5" fill={accent} />
      </g>
    </svg>
  ),
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }, [key, value])
  return [value, setValue]
}

function BracketCorners() {
  return (
    <>
      <span className="lab-bracket lab-bracket-tl" />
      <span className="lab-bracket lab-bracket-tr" />
      <span className="lab-bracket lab-bracket-bl" />
      <span className="lab-bracket lab-bracket-br" />
    </>
  )
}

function ExperimentCard({ experiment, onOpen, index }) {
  const art = ARTWORK[experiment.kind]?.(experiment.accent, experiment.id) || ARTWORK.experiment(experiment.accent, experiment.id)
  return (
    <button className="lab-card" style={{ '--accent': experiment.accent, animationDelay: `${index * 60}ms` }} onClick={() => onOpen(experiment)}>
      <BracketCorners />
      <div className="lab-card-cover">
        {art}
        <div className="lab-card-scan" aria-hidden />
        <div className="lab-card-cover-chrome">
          <span className="lab-card-cover-chrome-id">ID::{String(index).padStart(3, '0')}</span>
          <span className="lab-card-cover-chrome-dot" />
        </div>
      </div>
      <div className="lab-card-body">
        <div className="lab-card-tag">{experiment.tag}</div>
        <h3 className="lab-card-name">{experiment.name}</h3>
        <div className="lab-card-open-hint">OPEN →</div>
      </div>
    </button>
  )
}

function ExperimentModal({ experiment, onClose }) {
  const [notes, setNotes] = useLocalStorage(`lab:notes:${experiment.id}`, '')
  const [todos, setTodos] = useLocalStorage(`lab:todos:${experiment.id}`, [])
  const [todoText, setTodoText] = useState('')

  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onClose])

  const addTodo = () => {
    const txt = todoText.trim()
    if (!txt) return
    setTodos([...todos, { id: Date.now(), text: txt, done: false }])
    setTodoText('')
  }
  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const removeTodo = (id) => setTodos(todos.filter(t => t.id !== id))

  const openSite = () => {
    if (experiment.siteUrl.startsWith('http')) window.open(experiment.siteUrl, '_blank', 'noopener,noreferrer')
    else window.location.hash = experiment.siteUrl.replace(/^\/#?/, '')
  }

  return (
    <div className="lab-modal-overlay" onClick={onClose}>
      <div className="lab-modal" style={{ '--accent': experiment.accent }} onClick={e => e.stopPropagation()}>
        <BracketCorners />
        <button className="lab-modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="lab-modal-head">
          <div className="lab-modal-tag">{experiment.tag}</div>
          <h2 className="lab-modal-title">{experiment.name}</h2>
          <p className="lab-modal-summary">{experiment.summary}</p>
        </div>

        <div className="lab-modal-body">
          <section className="lab-modal-section">
            <div className="lab-modal-section-head">
              <h3>Notes</h3>
              <span className="lab-modal-section-hint">Saved locally. Sync via Kracked OS later.</span>
            </div>
            <textarea
              className="lab-modal-notes"
              placeholder="Drop anything here — ideas, context, half-thoughts. Will sync to the vault when Kracked OS is wired."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={6}
            />
          </section>

          <section className="lab-modal-section">
            <div className="lab-modal-section-head">
              <h3>To-dos</h3>
              <span className="lab-modal-section-hint">{todos.filter(t => !t.done).length} open · {todos.length} total</span>
            </div>
            <div className="lab-modal-todo-input">
              <input
                type="text"
                placeholder="Add a to-do for this workspace…"
                value={todoText}
                onChange={e => setTodoText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addTodo() }}
              />
              <button onClick={addTodo}>Add</button>
            </div>
            {todos.length > 0 && (
              <ul className="lab-modal-todos">
                {todos.map(t => (
                  <li key={t.id} className={t.done ? 'is-done' : ''}>
                    <label>
                      <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t.id)} />
                      <span>{t.text}</span>
                    </label>
                    <button className="lab-modal-todo-remove" onClick={() => removeTodo(t.id)} aria-label="Remove">×</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="lab-modal-foot">
          <button className="lab-modal-foot-ghost" onClick={onClose}>Close</button>
          <button className="lab-modal-foot-primary" onClick={openSite}>{experiment.siteLabel} →</button>
        </div>
      </div>
    </div>
  )
}

function Inbox() {
  const [inbox, setInbox] = useLocalStorage('lab:inbox', [])
  const [text, setText] = useState('')
  const add = () => {
    const t = text.trim()
    if (!t) return
    setInbox([{ id: Date.now(), text: t, date: new Date().toISOString() }, ...inbox])
    setText('')
  }
  const remove = useCallback((id) => setInbox(inbox.filter(i => i.id !== id)), [inbox, setInbox])

  const fmt = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <section className="lab-inbox">
      <div className="lab-inbox-head">
        <div>
          <h2 className="lab-inbox-title">Inbox</h2>
          <p className="lab-inbox-hint">Drop anything. Sort later. Will sync to your vault once Kracked OS is wired.</p>
        </div>
        <div className="lab-inbox-count">{inbox.length}</div>
      </div>

      <div className="lab-inbox-input">
        <input
          type="text"
          placeholder="What's on your mind?"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add() }}
          autoFocus
        />
        <button onClick={add} disabled={!text.trim()}>Capture</button>
      </div>

      {inbox.length > 0 && (
        <ul className="lab-inbox-list">
          {inbox.slice(0, 8).map(item => (
            <li key={item.id}>
              <span className="lab-inbox-date">{fmt(item.date)}</span>
              <span className="lab-inbox-text">{item.text}</span>
              <button className="lab-inbox-remove" onClick={() => remove(item.id)} aria-label="Dismiss">×</button>
            </li>
          ))}
          {inbox.length > 8 && <li className="lab-inbox-more">+{inbox.length - 8} more in inbox</li>}
        </ul>
      )}
    </section>
  )
}

function LabGraph({ graph }) {
  const containerRef = useRef(null)
  const fgRef = useRef(null)
  const navigate = useNavigate()
  const [dims, setDims] = useState({ w: 800, h: 520 })
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect
      setDims({ w: Math.floor(r.width), h: 520 })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const data = useMemo(() => {
    const nodeIds = new Set(graph.nodes.map(n => n.id))
    return {
      nodes: graph.nodes.map(n => ({ id: n.id, name: n.name, category: n.category, connections: n.connections || 0 })),
      links: graph.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target)).map(e => ({ source: e.source, target: e.target })),
    }
  }, [graph])

  const nodeStyle = useCallback((node) => {
    const isHot = hovered === node.id
    const r = Math.max(2.2, Math.min(7.5, 2.2 + Math.sqrt(node.connections || 1) * 0.9))
    return { r, color: isHot ? '#E8A54C' : '#DD8E35', label: node.name }
  }, [hovered])

  const paintNode = useCallback((node, ctx, globalScale) => {
    const { r, color, label } = nodeStyle(node)
    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = hovered === node.id ? 16 : 4
    ctx.fill()
    ctx.shadowBlur = 0
    if (hovered === node.id) {
      ctx.font = `${12 / globalScale}px var(--font-mono)`
      ctx.fillStyle = '#F6F1E7'
      ctx.textAlign = 'center'
      ctx.fillText(label, node.x, node.y - r - 6 / globalScale)
    }
  }, [hovered, nodeStyle])

  return (
    <div className="lab-graph">
      <div className="lab-graph-head">
        <div className="lab-graph-eyebrow">
          <span className="hud-led hud-led-amber" />
          VAULT::GRAPH
        </div>
        <div className="lab-graph-meta">{data.nodes.length} nodes · {data.links.length} edges</div>
      </div>
      <div ref={containerRef} className="lab-graph-canvas-wrap">
        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          width={dims.w}
          height={dims.h}
          backgroundColor="transparent"
          nodeRelSize={3}
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={(node, color, ctx) => {
            const { r } = nodeStyle(node)
            ctx.beginPath()
            ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI, false)
            ctx.fillStyle = color
            ctx.fill()
          }}
          linkColor={() => 'rgba(221, 142, 53, 0.28)'}
          linkWidth={0.5}
          cooldownTicks={140}
          onEngineStop={() => fgRef.current?.zoomToFit(600, 40)}
          onNodeHover={(node) => setHovered(node ? node.id : null)}
          onNodeClick={(node) => navigate(`/article/${node.id}`)}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
        <div className="lab-graph-legend">
          <span>CLICK::OPEN</span>
          <span>·</span>
          <span>DRAG::PAN</span>
          <span>·</span>
          <span>SCROLL::ZOOM</span>
        </div>
      </div>
    </div>
  )
}

export default function LabPage({ graph }) {
  const [activeExperiment, setActiveExperiment] = useState(null)

  return (
    <div className="lab-page lab-page-v2">
      <TerminalStrip />

      <header className="lab-headline">
        <BracketCorners />
        <div className="lab-headline-inner">
          <div className="lab-headline-topline">
            <span className="lab-headline-mark">☤</span>
            <span className="lab-headline-coords">N 03° 07' 58" · E 101° 39' 23"</span>
          </div>
          <h1 className="lab-headline-title"><LabHeadline text={LAB_OWNER} /></h1>
          <p className="lab-headline-sub">{useTypewriter('A gallery of what you are building. Click an experiment to note, plan, and enter.', 14)}<span className="lab-cursor">_</span></p>
          <div className="lab-headline-foot">v0.10 · LOCAL INSTANCE · MIT · 2026</div>
        </div>
      </header>

      <Inbox />

      <div className="lab-section-bar">
        <div className="lab-section-label">Gallery · {EXPERIMENTS.length}</div>
        <div className="lab-section-hint">Tap any card for notes + to-dos.</div>
      </div>
      <div className="lab-gallery-v2">
        {EXPERIMENTS.map((e, i) => <ExperimentCard key={e.id} experiment={e} onOpen={setActiveExperiment} index={i + 1} />)}
      </div>

      {graph && graph.nodes && <LabGraph graph={graph} />}

      {activeExperiment && <ExperimentModal experiment={activeExperiment} onClose={() => setActiveExperiment(null)} />}
    </div>
  )
}
