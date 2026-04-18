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

export default function KrackedOSPage({ graph }) {
  const node = graph.nodes.find(n => n.id === 'kracked-os')
  const html = useMemo(() => node ? renderContent(node.content, graph.nodes) : '', [node, graph.nodes])

  return (
    <div className="competitors-page">
      <PageHeader
        eyebrow="PRODUCT · BOUTIQUE SERVICE · IN DEVELOPMENT"
        title="Kracked OS"
        subtitle="An AI company brain for small teams. Agents at every function, each paired with a human who stays in control. We run it. Now we sell it."
        visual="krackedos"
      />

      {node ? (
        <div className="mc-card glass mc-card-wide competitors-panel">
          <div className="competitors-body article-body" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : (
        <div className="mc-card glass mc-card-wide" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Kracked OS document not found in vault.</p>
        </div>
      )}
    </div>
  )
}
