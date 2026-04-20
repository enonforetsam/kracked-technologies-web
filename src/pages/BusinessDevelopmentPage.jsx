import { useMemo } from 'react'
import { Link } from 'react-router-dom'
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

const SUB_PAGES = [
  {
    id: 'defence-government',
    label: 'Defence & Government',
    blurb: 'Vertical strategy for MAF, MINDEF, local primes, and MIGHT. Anchor advisor: Major Surenthiran.',
  },
  {
    id: 'dsa-natsec-2026-major-surenthiran',
    label: 'DSA NatSec 2026 — Meeting Prep',
    blurb: 'Tactical prep for the Major Surenthiran meeting. Core message, the three offers, what NOT to ask.',
  },
]

export default function BusinessDevelopmentPage({ graph }) {
  const node = graph.nodes.find(n => n.id === 'business-development')
  const html = useMemo(() => node ? renderContent(node.content, graph.nodes) : '', [node, graph.nodes])

  return (
    <div className="competitors-page">
      <PageHeader
        eyebrow="FUNCTION · REVENUE RELATIONSHIPS"
        title="Business Development"
        subtitle="Three service lines (Talent, Delivery, Training). Multiple verticals. One mission. How Kracked Technologies generates revenue relationships across sectors."
        visual="partnerships"
      />

      <div className="mc-card glass mc-card-wide" style={{ marginBottom: 14 }}>
        <div style={{ padding: '16px 20px' }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--text-tertiary)', marginBottom: 10 }}>
            BD PLAYBOOKS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {SUB_PAGES.map(p => (
              <Link
                key={p.id}
                to={`/article/${p.id}`}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'color-mix(in srgb, var(--bg-elevated) 45%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                  borderRadius: 4,
                  textDecoration: 'none',
                  color: 'var(--text)',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.14em',
                  color: 'var(--blue)',
                  marginBottom: 6,
                }}>
                  → PLAYBOOK
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: 'var(--text-bright)' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {p.blurb}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {node ? (
        <div className="mc-card glass mc-card-wide competitors-panel">
          <div className="competitors-body article-body" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : (
        <div className="mc-card glass mc-card-wide" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Business Development overview not found in vault.</p>
        </div>
      )}
    </div>
  )
}
