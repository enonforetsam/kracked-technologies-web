import { useMemo, useCallback, useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import ForceGraph2D from 'react-force-graph-2d'
import { CATEGORY_COLORS } from '../App'

function renderContent(content, nodes) {
  let html = content.replace(/^#[^\n]*\n/, '')
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const slug = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const exists = nodes.some(n => n.id === slug)
    if (exists) {
      return `<a href="#/article/${slug}">${label || target}</a>`
    }
    return label || target
  })
  return marked(html)
}

function extractHeadings(content) {
  const lines = content.split('\n')
  return lines
    .filter(l => /^#{2,3}\s/.test(l))
    .map(l => {
      const level = l.match(/^(#+)/)[1].length
      const text = l.replace(/^#+\s*/, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return { level, text, id }
    })
}

export default function ArticlePage({ graph }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const node = graph.nodes.find(n => n.id === id)
  const [visible, setVisible] = useState(false)
  const pageRef = useRef(null)

  useEffect(() => {
    setVisible(false)
    const frame = requestAnimationFrame(() => setVisible(true))
    if (pageRef.current) pageRef.current.scrollTop = 0
    window.scrollTo(0, 0)
    return () => cancelAnimationFrame(frame)
  }, [id])

  const neighbors = useMemo(() => {
    if (!node) return []
    const connectedIds = new Set()
    for (const edge of graph.edges) {
      if (edge.source === node.id) connectedIds.add(edge.target)
      if (edge.target === node.id) connectedIds.add(edge.source)
    }
    return graph.nodes.filter(n => connectedIds.has(n.id))
  }, [node, graph])

  const miniGraphData = useMemo(() => {
    if (!node) return { nodes: [], links: [] }
    const ids = new Set([node.id, ...neighbors.map(n => n.id)])
    return {
      nodes: graph.nodes
        .filter(n => ids.has(n.id))
        .map(n => ({
          ...n,
          val: n.id === node.id ? 8 : 4,
        })),
      links: graph.edges
        .filter(e => ids.has(e.source) && ids.has(e.target))
        .map(e => ({ source: e.source, target: e.target })),
    }
  }, [node, neighbors, graph])

  const headings = node ? extractHeadings(node.content) : []
  const html = node ? renderContent(node.content, graph.nodes) : ''

  const miniNodeCanvas = useCallback((n, ctx) => {
    const color = CATEGORY_COLORS[n.category] || '#5b76fe'
    const size = n.val
    ctx.beginPath()
    ctx.arc(n.x, n.y, size, 0, 2 * Math.PI)
    ctx.fillStyle = n.id === id ? color : color + '66'
    ctx.fill()
  }, [id])

  if (!node) {
    return (
      <div className="home" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>Concept not found</h2>
        <Link to="/">Back to wiki</Link>
      </div>
    )
  }

  return (
    <div ref={pageRef} className={`article-page ${visible ? 'article-slide-in' : 'article-slide-start'}`}>
      <div className="article-content">
        <nav className="article-breadcrumb">
          <Link to="/" className="breadcrumb-link">Wiki</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-link breadcrumb-category">{node.category}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{node.name}</span>
        </nav>
        <h1>{node.name}</h1>
        <div className="article-meta">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              background: (CATEGORY_COLORS[node.category] || '#5b76fe') + '1a',
              color: CATEGORY_COLORS[node.category] || '#5b76fe',
            }}
          >
            {node.category}
          </span>
          <span>{node.connections} connections</span>
          <span>{node.wordCount}w</span>
        </div>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <aside className="article-sidebar">
        {headings.length > 0 && (
          <div className="sidebar-section">
            <h3>Table of Contents</h3>
            <div className="sidebar-toc">
              {headings.map((h, i) => (
                <a
                  key={i}
                  href={`#${h.id}`}
                  style={{ paddingLeft: h.level === 3 ? 16 : 0 }}
                >
                  {h.text}
                </a>
              ))}
            </div>
          </div>
        )}

        {neighbors.length > 0 && (
          <div className="sidebar-section">
            <h3>Connections ({neighbors.length})</h3>
            <ul className="sidebar-connections">
              {neighbors.map(n => (
                <li key={n.id}>
                  <Link to={`/article/${n.id}`}>{n.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {neighbors.length > 0 && (
          <div className="sidebar-section">
            <h3>Neighborhood</h3>
            <div className="mini-graph-container">
              <ForceGraph2D
                graphData={miniGraphData}
                nodeCanvasObject={miniNodeCanvas}
                linkColor={() => 'rgba(91, 118, 254, 0.2)'}
                linkWidth={1}
                backgroundColor="#ffffff"
                width={288}
                height={200}
                enableZoomInteraction={false}
                enablePanInteraction={false}
                onNodeClick={(n) => navigate(`/article/${n.id}`)}
                cooldownTicks={50}
                nodePointerAreaPaint={(n, color, ctx) => {
                  ctx.beginPath()
                  ctx.arc(n.x, n.y, n.val, 0, 2 * Math.PI)
                  ctx.fillStyle = color
                  ctx.fill()
                }}
              />
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
