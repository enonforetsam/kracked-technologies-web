import { useMemo } from 'react'
import { marked } from 'marked'
import PageHeader from '../components/PageHeader'

function renderContent(content, nodes) {
  let html = content
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/^#[^\n]*\n+/, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
      const slug = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const exists = nodes.some(n => n.id === slug)
      if (exists) return `<a href="#/article/${slug}">${label || target}</a>`
      return label || target
    })
  let out = marked(html)
  out = out.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
  return out
}

export default function CompetitorsPage({ graph }) {
  const node = graph.nodes.find(n => n.id === 'competitors')
  const html = useMemo(() => node ? renderContent(node.content, graph.nodes) : '', [node, graph.nodes])

  return (
    <div className="competitors-page">
      <PageHeader
        eyebrow="LANDSCAPE · MALAYSIA"
        title="Competition & Operators"
        subtitle="A map of every organisation in Malaysia doing something adjacent to Kracked. No single operator owns the full stack."
        visual="competitors"
      />

      {node ? (
        <div className="mc-card glass mc-card-wide competitors-panel">
          <div className="competitors-body article-body" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : (
        <div className="mc-card glass mc-card-wide" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Competitors document not found in vault.</p>
        </div>
      )}
    </div>
  )
}
