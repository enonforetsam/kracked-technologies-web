import { useRef, useCallback, useEffect, useMemo, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import ForceGraph3D from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { forceCollide } from 'd3'
import { marked } from 'marked'
import { CATEGORY_COLORS } from '../App'

function getExcerpt(content, len = 160) {
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
    if (exists) {
      return `<a href="#" data-node-id="${slug}" class="wiki-link">${label || target}</a>`
    }
    return label || target
  })
  return marked(html)
}

function extractHeadings(content) {
  return content.split('\n')
    .filter(l => /^#{2,3}\s/.test(l))
    .map(l => {
      const level = l.match(/^(#+)/)[1].length
      const text = l.replace(/^#+\s*/, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return { level, text, id }
    })
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export default function GraphPage({ graph }) {
  const fgRef = useRef()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [hovered, setHovered] = useState(null)
  const panelRef = useRef(null)
  const gridRef = useRef(null)

  const [view, setView] = useState('all') // 'mission' | 'research' | 'all'

  const [settings, setSettings] = useState({
    repulsion: 800,
    linkDistance: 280,
    centerForce: 3,
    nodeSize: 6,
    labelSize: 16,
    showLabels: true,
    showOrphans: true,
    linkOpacity: 12,
    collisionPadding: 30,
    panelWidth: 440,
    theme: 'light',
    mode3d: false,
    // 3D settings
    showLabels3d: true,
    nodeSize3d: 2,
    bloomStrength: 1.2,
    bloomRadius: 0.4,
    starCount: 2000,
    autoRotateSpeed: 0.4,
    particleSpeed: 4,
    fogDensity: 0.5,
  })

  const updateSetting = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  const data = useMemo(() => {
    const filtered = view === 'all'
      ? graph.nodes
      : view === 'research'
        ? graph.nodes.filter(n => n.category === 'Research')
        : graph.nodes.filter(n => n.category !== 'Research')
    const nodeIds = new Set(filtered.map(n => n.id))
    const nodes = filtered.map(n => ({
      ...n,
      val: settings.nodeSize + n.connections * 3,
    }))
    const links = graph.edges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map(e => ({ source: e.source, target: e.target }))
    return {
      nodes: settings.showOrphans ? nodes : nodes.filter(n => n.connections > 0),
      links,
    }
  }, [graph, settings.nodeSize, settings.showOrphans, view])

  useEffect(() => {
    const fg = fgRef.current
    if (!fg || !fg.d3Force) return
    try {
      fg.d3Force('charge').strength(-settings.repulsion).distanceMax(settings.repulsion)
      fg.d3Force('link').distance(settings.linkDistance)
      fg.d3Force('center').strength(settings.centerForce / 100)
      if (!settings.mode3d) {
        fg.d3Force('collide', forceCollide(node => {
          const labelW = (node.__labelWidth || 0) / 2
          const nodeR = node.val || 6
          return Math.max(nodeR, labelW) + settings.collisionPadding
        }).strength(0.8))
      }
      fg.d3ReheatSimulation()
    } catch(e) { /* ignore if forces not ready */ }
  }, [data, settings.repulsion, settings.linkDistance, settings.centerForce, settings.collisionPadding, settings.mode3d])

  // Grid background
  useEffect(() => {
    const canvas = gridRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const gridSize = 60
    const lines = []

    // Collect all grid lines
    const init = () => {
      lines.length = 0
      const cols = Math.ceil(canvas.width / gridSize) + 1
      const rows = Math.ceil(canvas.height / gridSize) + 1
      for (let i = 0; i < cols; i++) {
        lines.push({ x: i * gridSize, dir: 'v', phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.7 })
      }
      for (let j = 0; j < rows; j++) {
        lines.push({ y: j * gridSize, dir: 'h', phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.7 })
      }
    }
    init()

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = getCssVar('--bg')
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const gridColor = getCssVar('--grid-color')
      for (const line of lines) {
        const pulse = Math.sin(t * 0.001 * line.speed + line.phase)
        const alpha = 0.03 + Math.max(0, pulse) * 0.04
        ctx.strokeStyle = `rgba(${gridColor}, ${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        if (line.dir === 'v') {
          ctx.moveTo(line.x, 0)
          ctx.lineTo(line.x, canvas.height)
        } else {
          ctx.moveTo(0, line.y)
          ctx.lineTo(canvas.width, line.y)
        }
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // 3D mode: bloom, auto-rotate, starfield, node animation
  useEffect(() => {
    if (!settings.mode3d) return

    let animId
    let timer
    let retryTimer

    const setup = () => {
      const fg = fgRef.current
      if (!fg) {
        retryTimer = setTimeout(setup, 100)
        return
      }

      timer = setTimeout(() => {
        // Auto-rotate
        try {
          const controls = fg.controls && fg.controls()
          if (controls && controls.autoRotate !== undefined) {
            controls.autoRotate = true
            controls.autoRotateSpeed = settings.autoRotateSpeed
          }
        } catch(e) {}

        // Scene setup
        let scene, renderer, camera
        try {
          renderer = fg.renderer()
          scene = fg.scene()
          camera = fg.camera()
        } catch(e) { return }

        if (!renderer || !scene || !camera) return

        // Bloom
        try {
          const composer = new EffectComposer(renderer)
          composer.addPass(new RenderPass(scene, camera))
          const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            settings.bloomStrength,
            settings.bloomRadius,
            0.2
          )
          composer.addPass(bloomPass)
          fg.postProcessingComposer = composer
        } catch(e) {}

        // Starfield
        const starsGeo = new THREE.BufferGeometry()
        const positions = new Float32Array(settings.starCount * 3)
        for (let i = 0; i < settings.starCount * 3; i++) {
          positions[i] = (Math.random() - 0.5) * 2000
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const starsMat = new THREE.PointsMaterial({
          color: 0x00f0ff, size: 0.8, transparent: true, opacity: 0.6, sizeAttenuation: true, fog: false,
        })
        const stars = new THREE.Points(starsGeo, starsMat)
        scene.add(stars)

        // Lighting & fog
        scene.add(new THREE.AmbientLight(0x333344, 1))
        scene.fog = new THREE.FogExp2(0x0a0a0f, settings.fogDensity / 1000)

        // Animation loop
        const animate = (t) => {
          scene.traverse(obj => {
            const ud = obj.userData
            if (!ud || !ud.type) return

            if (ud.type === 'sun') {
              const pulse = Math.sin(t * 0.003) * 0.5 + 0.5
              ud.fire1.rotation.y = t * 0.0008
              ud.fire1.rotation.x = t * 0.0003
              ud.fire2.rotation.y = -t * 0.0005
              ud.fire2.rotation.z = t * 0.0004
              ud.corona.material.opacity = 0.1 + pulse * 0.1
              ud.corona.scale.setScalar(1 + pulse * 0.05)
              ud.glow.material.opacity = 0.04 + pulse * 0.04
              ud.fire1.material.opacity = 0.5 + pulse * 0.3
            }

            if (ud.type === 'planet') {
              ud.ring1.rotation.z = t * 0.0003
              ud.ring2.rotation.z = -t * 0.0002
              ud.body.rotation.y = t * 0.0005
              const pulse = Math.sin(t * 0.002 + obj.position.x * 0.05) * 0.5 + 0.5
              ud.atmo.material.opacity = 0.08 + pulse * 0.08
            }

            if (ud.type === 'moon') {
              ud.moon.rotation.y = t * 0.001
              const pulse = Math.sin(t * 0.002 + obj.position.z * 0.1) * 0.5 + 0.5
              ud.glow.material.opacity = 0.05 + pulse * 0.06
            }
          })

          if (stars) {
            stars.rotation.y = t * 0.00003
            stars.rotation.x = t * 0.00001
          }
          animId = requestAnimationFrame(animate)
        }
        animId = requestAnimationFrame(animate)
      }, 800)
    }

    setup()

    return () => {
      clearTimeout(timer)
      clearTimeout(retryTimer)
      cancelAnimationFrame(animId)
      try {
        const fg = fgRef.current
        if (fg) {
          const controls = fg.controls && fg.controls()
          if (controls && controls.autoRotate !== undefined) {
            controls.autoRotate = false
          }
        }
      } catch(e) {}
    }
  }, [settings.mode3d])

  const neighbors = useMemo(() => {
    if (!selected) return []
    const connectedIds = new Set()
    for (const edge of graph.edges) {
      if (edge.source === selected.id) connectedIds.add(edge.target)
      if (edge.target === selected.id) connectedIds.add(edge.source)
    }
    return graph.nodes.filter(n => connectedIds.has(n.id))
  }, [selected, graph])

  const hoveredNeighborIds = useMemo(() => {
    if (!hovered) return null
    const ids = new Set([hovered.id])
    for (const edge of graph.edges) {
      if (edge.source === hovered.id) ids.add(edge.target)
      if (edge.target === hovered.id) ids.add(edge.source)
    }
    return ids
  }, [hovered, graph])

  const selectNode = useCallback((nodeOrId) => {
    const node = typeof nodeOrId === 'string'
      ? data.nodes.find(n => n.id === nodeOrId)
      : nodeOrId
    if (node) {
      setSelected(node)
      if (panelRef.current) panelRef.current.scrollTop = 0

      // Fly camera to node in 3D mode
      if (settings.mode3d && fgRef.current && fgRef.current.cameraPosition) {
        const distance = 120
        const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0)
        fgRef.current.cameraPosition(
          { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
          { x: node.x || 0, y: node.y || 0, z: node.z || 0 },
          1500
        )
      }
    }
  }, [data, settings.mode3d])

  const closePanel = useCallback(() => {
    setSelected(null)

    // Zoom back out in 3D mode
    if (settings.mode3d && fgRef.current && fgRef.current.cameraPosition) {
      fgRef.current.cameraPosition(
        { x: 0, y: 0, z: 400 },
        { x: 0, y: 0, z: 0 },
        1500
      )
    }
  }, [settings.mode3d])

  const handleNodeClick = useCallback((node) => {
    selectNode(node)
  }, [selectNode])

  // Handle wiki-link clicks inside article content
  const handleContentClick = useCallback((e) => {
    const link = e.target.closest('[data-node-id]')
    if (link) {
      e.preventDefault()
      selectNode(link.dataset.nodeId)
      if (panelRef.current) panelRef.current.scrollTop = 0
    }
  }, [selectNode])

  const handleNodeHover = useCallback((node) => {
    setHovered(node || null)
  }, [])

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const size = node.val
    const color = CATEGORY_COLORS[node.category] || '#5b76fe'
    const isSelected = selected && selected.id === node.id
    const dimmed = hoveredNeighborIds && !hoveredNeighborIds.has(node.id)
    const alpha = dimmed ? 0.1 : 1

    ctx.globalAlpha = alpha

    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
    ctx.fillStyle = isSelected ? color + '44' : color + '22'
    ctx.fill()

    if (isSelected) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI)
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.arc(node.x, node.y, size * 0.6, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()

    if (settings.showLabels) {
      const fontSize = Math.min(settings.labelSize / globalScale, settings.labelSize * 0.9)
      if (fontSize >= 3) {
        ctx.font = `600 ${fontSize}px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = getCssVar('--graph-label')
        // Fade text as it gets very small
        if (fontSize < 6) ctx.globalAlpha = alpha * ((fontSize - 3) / 3)
        ctx.fillText(node.name, node.x, node.y + size + 4)
        // Store text width for collision
        node.__labelWidth = ctx.measureText(node.name).width
        node.__labelHeight = fontSize
      }
    }

    ctx.globalAlpha = 1
  }, [selected, hoveredNeighborIds, settings.showLabels, settings.labelSize])

  const results = search.length > 1
    ? data.nodes.filter(n =>
        n.name.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8)
    : []

  const articleHtml = selected
    ? renderContent(selected.content, graph.nodes)
    : ''
  const headings = selected ? extractHeadings(selected.content) : []

  return (
    <div className="graph-page">
      {/* Header */}
      <div className="graph-header">
        <div className="view-switcher">
          {[
            { id: 'mission', label: 'Mission Data' },
            { id: 'research', label: 'Research' },
            { id: 'all', label: 'Everything' },
          ].map(v => (
            <button
              key={v.id}
              className={`view-btn ${view === v.id ? 'view-btn-active' : ''}`}
              onClick={() => { setView(v.id); setSelected(null) }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="graph-search">
          <input
            type="text"
            placeholder="Search concepts..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowResults(true) }}
            onFocus={() => search.length > 1 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {showResults && results.length > 0 && (
            <div className="search-results">
              {results.map(n => (
                <div
                  key={n.id}
                  className="search-result-item"
                  onMouseDown={() => selectNode(n.id)}
                >
                  <span className="search-result-name">{n.name}</span>
                  <span className="search-result-category">{n.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="header-stats">
          <span>{data.nodes.length} concepts</span>
          <span>{data.links.length} connections</span>
        </div>
      </div>

      {/* Grid background (2D only) */}
      {!settings.mode3d && <canvas className="grid-bg" ref={gridRef} />}

      {/* Layout: graph + article side by side */}
      <div className={`graph-layout ${selected ? 'graph-layout-split' : ''}`}>
        {/* Graph */}
        <div className="graph-container">
          {settings.mode3d ? (
            <ForceGraph3D
              ref={fgRef}
              graphData={data}
              onNodeClick={handleNodeClick}
              nodeColor={node => CATEGORY_COLORS[node.category] || '#00f0ff'}
              nodeRelSize={5}
              nodeLabel={node => node.name}
              linkColor={() => `rgba(${getCssVar('--graph-link')}, ${settings.linkOpacity / 100})`}
              linkWidth={0.3}
              linkOpacity={settings.linkOpacity / 100}
              backgroundColor={getCssVar('--graph-bg')}
              d3VelocityDecay={0.25}
              d3AlphaDecay={0.015}
              warmupTicks={100}
            />
          ) : (
            <ForceGraph2D
              ref={fgRef}
              graphData={data}
              nodeCanvasObject={nodeCanvasObject}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              onBackgroundClick={closePanel}
              linkColor={link => {
                if (!hoveredNeighborIds) return `rgba(${getCssVar('--graph-link')}, ${settings.linkOpacity / 100})`
                const srcId = typeof link.source === 'object' ? link.source.id : link.source
                const tgtId = typeof link.target === 'object' ? link.target.id : link.target
                const connected = hoveredNeighborIds.has(srcId) && hoveredNeighborIds.has(tgtId)
                return connected ? `rgba(${getCssVar('--graph-link')}, 0.5)` : `rgba(${getCssVar('--graph-link')}, 0.03)`
              }}
              linkWidth={0.8}
              d3VelocityDecay={0.25}
              d3AlphaDecay={0.015}
              warmupTicks={100}
              backgroundColor="transparent"
              nodePointerAreaPaint={(node, color, ctx) => {
                ctx.beginPath()
                ctx.arc(node.x, node.y, node.val + 5, 0, 2 * Math.PI)
                ctx.fillStyle = color
                ctx.fill()
              }}
            />
          )}
        </div>

        {/* Article panel */}
        {selected && (
          <div className="article-panel" ref={panelRef} onClick={handleContentClick}>
            <button className="article-panel-close" onClick={(e) => { e.stopPropagation(); closePanel() }}>
              &times;
            </button>

            <nav className="article-panel-breadcrumb">
              <span className="breadcrumb-link" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); closePanel() }}>Graph</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-link breadcrumb-category">{selected.category}</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{selected.name}</span>
            </nav>

            <h1 className="article-panel-title">{selected.name}</h1>
            <div className="article-panel-meta">
              <span
                className="article-panel-badge"
                style={{
                  background: (CATEGORY_COLORS[selected.category] || '#5b76fe') + '1a',
                  color: CATEGORY_COLORS[selected.category] || '#5b76fe',
                }}
              >
                {selected.category}
              </span>
              <span>{selected.connections} connections</span>
              <span>{selected.wordCount}w</span>
            </div>

            {headings.length > 0 && (
              <div className="article-panel-toc">
                {headings.map((h, i) => (
                  <a key={i} href={`#${h.id}`} className="toc-item" style={{ paddingLeft: h.level === 3 ? 12 : 0 }}>
                    {h.text}
                  </a>
                ))}
              </div>
            )}

            <div className="article-body" dangerouslySetInnerHTML={{ __html: articleHtml }} />

            {neighbors.length > 0 && (
              <div className="article-panel-connections">
                <h4>Connections ({neighbors.length})</h4>
                <div className="article-panel-conn-grid">
                  {neighbors.map(n => (
                    <button
                      key={n.id}
                      className="article-panel-conn-link"
                      onClick={(e) => { e.stopPropagation(); selectNode(n.id); if (panelRef.current) panelRef.current.scrollTop = 0 }}
                    >
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings toggle */}
      <button
        className="graph-settings-toggle"
        onClick={() => setShowSettings(s => !s)}
        title="Graph settings"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </button>

      {/* Settings panel */}
      {showSettings && (
        <div className="graph-settings">
          <h3>Theme</h3>
          <div className="theme-picker">
            {[
              { id: 'cyberpunk', label: 'Cyberpunk', colors: ['#0a0a0f', '#00f0ff', '#ff2d7b'] },
              { id: 'light', label: 'Light', colors: ['#ffffff', '#5b76fe', '#e0447a'] },
              { id: 'midnight', label: 'Midnight', colors: ['#0d0a1a', '#a78bfa', '#f472b6'] },
              { id: 'emerald', label: 'Emerald', colors: ['#060f0a', '#34d399', '#f59e0b'] },
              { id: 'sunset', label: 'Sunset', colors: ['#1a0e08', '#f97316', '#fb7185'] },
            ].map(t => (
              <button
                key={t.id}
                className={`theme-swatch ${settings.theme === t.id ? 'theme-active' : ''}`}
                onClick={() => updateSetting('theme', t.id)}
                title={t.label}
              >
                <div className="theme-swatch-colors">
                  {t.colors.map((c, i) => (
                    <div key={i} style={{ background: c }} />
                  ))}
                </div>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <h3>Display</h3>

          <label className="settings-row">
            <span>Show labels</span>
            <input type="checkbox" checked={settings.showLabels} onChange={e => updateSetting('showLabels', e.target.checked)} />
          </label>

          <label className="settings-row">
            <span>Show orphans</span>
            <input type="checkbox" checked={settings.showOrphans} onChange={e => updateSetting('showOrphans', e.target.checked)} />
          </label>

          <label className="settings-row">
            <span>3D mode</span>
            <input type="checkbox" checked={settings.mode3d} onChange={e => updateSetting('mode3d', e.target.checked)} />
          </label>

          <h3>Forces</h3>

          <label className="settings-slider">
            <div className="settings-slider-header">
              <span>Repulsion</span>
              <span className="settings-value">{settings.repulsion}</span>
            </div>
            <input type="range" min="100" max="2000" step="50" value={settings.repulsion} onChange={e => updateSetting('repulsion', +e.target.value)} />
          </label>

          <label className="settings-slider">
            <div className="settings-slider-header">
              <span>Link distance</span>
              <span className="settings-value">{settings.linkDistance}</span>
            </div>
            <input type="range" min="50" max="500" step="10" value={settings.linkDistance} onChange={e => updateSetting('linkDistance', +e.target.value)} />
          </label>

          <label className="settings-slider">
            <div className="settings-slider-header">
              <span>Center force</span>
              <span className="settings-value">{settings.centerForce}%</span>
            </div>
            <input type="range" min="1" max="20" step="1" value={settings.centerForce} onChange={e => updateSetting('centerForce', +e.target.value)} />
          </label>

          <label className="settings-slider">
            <div className="settings-slider-header">
              <span>Node spacing</span>
              <span className="settings-value">{settings.collisionPadding}px</span>
            </div>
            <input type="range" min="0" max="80" step="5" value={settings.collisionPadding} onChange={e => updateSetting('collisionPadding', +e.target.value)} />
          </label>

          <h3>Appearance</h3>

          <label className="settings-slider">
            <div className="settings-slider-header">
              <span>Node size</span>
              <span className="settings-value">{settings.nodeSize}</span>
            </div>
            <input type="range" min="2" max="16" step="1" value={settings.nodeSize} onChange={e => updateSetting('nodeSize', +e.target.value)} />
          </label>

          <label className="settings-slider">
            <div className="settings-slider-header">
              <span>Label size</span>
              <span className="settings-value">{settings.labelSize}</span>
            </div>
            <input type="range" min="8" max="28" step="1" value={settings.labelSize} onChange={e => updateSetting('labelSize', +e.target.value)} />
          </label>

          <label className="settings-slider">
            <div className="settings-slider-header">
              <span>Link opacity</span>
              <span className="settings-value">{settings.linkOpacity}%</span>
            </div>
            <input type="range" min="2" max="60" step="2" value={settings.linkOpacity} onChange={e => updateSetting('linkOpacity', +e.target.value)} />
          </label>

          <label className="settings-slider">
            <div className="settings-slider-header">
              <span>Panel width</span>
              <span className="settings-value">{settings.panelWidth}px</span>
            </div>
            <input type="range" min="320" max="700" step="20" value={settings.panelWidth} onChange={e => updateSetting('panelWidth', +e.target.value)} />
          </label>

          {settings.mode3d && (
            <>
              <h3>3D Settings</h3>

              <label className="settings-row">
                <span>Show labels</span>
                <input type="checkbox" checked={settings.showLabels3d} onChange={e => updateSetting('showLabels3d', e.target.checked)} />
              </label>

              <label className="settings-slider">
                <div className="settings-slider-header">
                  <span>Node size</span>
                  <span className="settings-value">{settings.nodeSize3d}</span>
                </div>
                <input type="range" min="1" max="8" step="0.5" value={settings.nodeSize3d} onChange={e => updateSetting('nodeSize3d', +e.target.value)} />
              </label>

              <label className="settings-slider">
                <div className="settings-slider-header">
                  <span>Bloom strength</span>
                  <span className="settings-value">{settings.bloomStrength}</span>
                </div>
                <input type="range" min="0" max="3" step="0.1" value={settings.bloomStrength} onChange={e => updateSetting('bloomStrength', +e.target.value)} />
              </label>

              <label className="settings-slider">
                <div className="settings-slider-header">
                  <span>Bloom radius</span>
                  <span className="settings-value">{settings.bloomRadius}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={settings.bloomRadius} onChange={e => updateSetting('bloomRadius', +e.target.value)} />
              </label>

              <label className="settings-slider">
                <div className="settings-slider-header">
                  <span>Rotation speed</span>
                  <span className="settings-value">{settings.autoRotateSpeed}</span>
                </div>
                <input type="range" min="0" max="3" step="0.1" value={settings.autoRotateSpeed} onChange={e => updateSetting('autoRotateSpeed', +e.target.value)} />
              </label>

              <label className="settings-slider">
                <div className="settings-slider-header">
                  <span>Particle speed</span>
                  <span className="settings-value">{settings.particleSpeed}</span>
                </div>
                <input type="range" min="1" max="20" step="1" value={settings.particleSpeed} onChange={e => updateSetting('particleSpeed', +e.target.value)} />
              </label>

              <label className="settings-slider">
                <div className="settings-slider-header">
                  <span>Stars</span>
                  <span className="settings-value">{settings.starCount}</span>
                </div>
                <input type="range" min="0" max="5000" step="250" value={settings.starCount} onChange={e => updateSetting('starCount', +e.target.value)} />
              </label>

              <label className="settings-slider">
                <div className="settings-slider-header">
                  <span>Fog density</span>
                  <span className="settings-value">{settings.fogDensity}</span>
                </div>
                <input type="range" min="0" max="10" step="0.5" value={settings.fogDensity} onChange={e => updateSetting('fogDensity', +e.target.value)} />
              </label>
            </>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="graph-legend">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="graph-legend-item">
            <div className="legend-dot" style={{ background: color }} />
            {cat}
          </div>
        ))}
      </div>
    </div>
  )
}
