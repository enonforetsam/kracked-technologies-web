import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import matter from 'gray-matter'
import { put } from '@vercel/blob'

// Load .env.local for BLOB_READ_WRITE_TOKEN
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/)
    if (match) process.env[match[1]] = match[2]
  }
}

const VAULT_DIR = path.resolve(process.cwd(), '..', 'Danials Lab')
const RESEARCH_DIR = path.resolve(process.cwd(), '..', 'Obsidian Gov', 'Gov Malaysia', 'wiki', 'ecosystem')
const OUT_FILE = path.resolve(process.cwd(), 'public', 'graph.json')

const IGNORE = ['node_modules', '.obsidian']

function extractWikilinks(content) {
  const matches = content.match(/\[\[([^\]]+)\]\]/g) || []
  return matches.map(m => m.slice(2, -2).split('|')[0].trim())
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Known project-folder wrappers (inside /Projects/). When a file lives deeper
// than the project root, use the sub-folder as its category so the graph keeps
// colouring by type (Strategy, Ventures, Ecosystem…) rather than collapsing
// everything under one project.
const PROJECT_WRAPPERS = new Set(['Kracked Technologies', 'Kracked Kampung', 'Founder OS', 'Kampung Economics'])
function getCategoryFromPath(relPath) {
  const parts = relPath.split(path.sep).filter(Boolean)
  if (parts[0] === 'Projects') parts.shift() // strip /Projects/ prefix
  if (parts.length <= 1) return 'Root'
  if (PROJECT_WRAPPERS.has(parts[0]) && parts.length > 2) return parts[1]
  return parts[0]
}

function extractStatus(content) {
  const match = content.match(/##\s*Status[:\s]*(.+)/i)
  if (!match) return null
  return match[1].trim().replace(/^-\s*Stage:\s*/i, '').trim() || null
}

function buildDashboard(nodes) {
  // Deals
  const deals = nodes
    .filter(n => n.category === 'Deals')
    .map(n => ({
      name: n.name,
      status: extractStatus(n.content) || 'Unknown',
      id: n.id,
    }))

  // Ventures — only actual products, not meta pages
  const META_VENTURE_IDS = ['venture-playbook', 'revenue-model', 'portfolio', 'pipeline', 'market-landscape', 'growth-marketing', 'competitors']
  const ventureNodes = nodes.filter(n => n.category === 'Ventures' && !META_VENTURE_IDS.includes(n.id))
  const ventures = ventureNodes.map(n => ({
    name: n.name,
    status: extractStatus(n.content) || 'Unknown',
    id: n.id,
  }))

  // Team stats
  const teamNode = nodes.find(n => n.id === 'team')
  const teamCount = teamNode
    ? (teamNode.content.match(/\|[^|]+\|[^|]+\|/g) || []).filter(r => !r.includes('Name') && !r.includes('---') && !r.includes('Member') && !r.includes('Builder') && !r.includes('Region')).length
    : 0

  // Roadmap
  const roadmapNode = nodes.find(n => n.id === 'roadmap')
  const roadmap = { now: [], next: [], later: [] }
  if (roadmapNode) {
    let section = null
    for (const line of roadmapNode.content.split('\n')) {
      if (/now/i.test(line) && /^##/.test(line)) section = 'now'
      else if (/next/i.test(line) && /^##/.test(line)) section = 'next'
      else if (/later/i.test(line) && /^##/.test(line)) section = 'later'
      else if (section && /^-\s+/.test(line)) {
        roadmap[section].push(line.replace(/^-\s+/, '').replace(/\[\[([^\]]+)\]\]/g, '$1'))
      }
    }
  }

  // Advisors
  const advisorNode = nodes.find(n => n.id === 'advisory-board')
  const advisors = []
  if (advisorNode) {
    const rows = advisorNode.content.match(/\|\s*\*\*(.+?)\*\*\s*\|(.+?)\|(.+?)\|/g) || []
    for (const row of rows) {
      const cols = row.split('|').filter(Boolean).map(s => s.trim())
      if (cols.length >= 2) {
        advisors.push({ name: cols[0].replace(/\*\*/g, ''), domain: cols[1] })
      }
    }
  }

  // KD Academy — pull operational snapshot key/value rows from the note
  const kdaNode = nodes.find(n => n.id === 'kd-academy')
  const academyOps = {}
  if (kdaNode) {
    const opsSection = kdaNode.content.split(/##\s+Operational snapshot/i)[1]?.split(/##\s+/)[0] || ''
    const rowRe = /\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/g
    let m
    while ((m = rowRe.exec(opsSection)) !== null) {
      const k = m[1].trim()
      const v = m[2].trim()
      if (!k || !v || k === '---' || /^Field$/i.test(k) || /^-+$/.test(v)) continue
      academyOps[k] = v
    }
  }

  // Revenue Model — pull next milestone from frontmatter
  const revenueNode = nodes.find(n => n.id === 'revenue-model')
  const revenue = revenueNode ? {
    nextMilestone: revenueNode.next_milestone || 'Marketplace',
    nextMilestoneDetail: revenueNode.next_milestone_detail || null,
  } : null

  // This Week — free-form markdown from `This Week.md`, minus the H1
  const thisWeekNode = nodes.find(n => n.id === 'this-week')
  const thisWeek = thisWeekNode ? thisWeekNode.content.replace(/^#[^\n]*\n/, '').trim() : null

  // What If — speculative thesis, rendered at the bottom of Mission Control
  const whatIfNode = nodes.find(n => n.id === 'what-if')
  const whatIf = whatIfNode ? whatIfNode.content.replace(/^#[^\n]*\n/, '').trim() : null

  // Agents — files in the Agents/ folder (excluding README)
  const agents = nodes
    .filter(n => n.category === 'Agents' && n.id !== 'readme')
    .map(n => {
      const firstPara = n.content
        .replace(/^---[\s\S]*?---\s*/m, '')
        .trim()
        .replace(/^#[^\n]*\n+/, '')
        .trim()
        .split(/\n\n/)[0]
        .replace(/\*\*/g, '')
        .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, l) => l || t)
      return {
        id: n.id,
        name: n.name,
        status: (n.status || 'planning'),
        blurb: firstPara.slice(0, 180),
      }
    })

  // Lab projects — each manifest in Lab/projects/ becomes a queryable lens over the vault
  const globToRegex = (g) => {
    const escaped = g.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    const re = escaped.replace(/\*\*/g, '§§').replace(/\*/g, '[^/]*').replace(/§§/g, '.*')
    return new RegExp('^' + re + '$')
  }
  const labProjectNodes = nodes.filter(n => n.path && n.path.startsWith('Lab/projects/') && !n.path.endsWith('README.md'))
  const labProjects = labProjectNodes.map(n => {
    const inc = Array.isArray(n.includes) ? n.includes : []
    const exc = Array.isArray(n.excludes) ? n.excludes : []
    const includeRes = inc.map(globToRegex)
    const excludeRes = exc.map(globToRegex)
    const fileIds = nodes
      .filter(fn => fn.path)
      .filter(fn => includeRes.some(r => r.test(fn.path)))
      .filter(fn => !excludeRes.some(r => r.test(fn.path)))
      .filter(fn => fn.private !== true)
      .map(fn => fn.id)
    return {
      id: n.id,
      name: n.name || n.id,
      status: n.status || 'active',
      accent: n.accent || '#a855f7',
      cover: n.cover || null,
      agents: Array.isArray(n.agents) ? n.agents : [],
      includes: inc,
      excludes: exc,
      fileCount: fileIds.length,
      fileIds,
    }
  })

  // Graph stats
  const missionNodes = nodes.filter(n => n.dataset === 'mission')
  const researchNodes = nodes.filter(n => n.dataset === 'research')

  return {
    deals,
    ventures,
    team: { count: teamCount },
    roadmap,
    advisors,
    academy: kdaNode ? { status: extractStatus(kdaNode.content) || 'In development', website: 'academy.krackeddevs.com', ops: academyOps } : null,
    revenue,
    thisWeek,
    whatIf,
    agents,
    labProjects,
    strategies: nodes
      .filter(n => n.category === 'Strategy')
      .map(n => {
        const body = n.content.replace(/^---[\s\S]*?---\s*/m, '').replace(/^#[^\n]*\n+/, '').trim()
        const blurb = body.split(/\n\n/)[0].replace(/\*\*/g, '').replace(/>\s*/g, '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, l) => l || t).slice(0, 200)
        return {
          id: n.id,
          name: n.name,
          status: n.status || 'draft',
          period: n.period || null,
          blurb,
        }
      }),
    graph: { mission: missionNodes.length, research: researchNodes.length, total: nodes.length },
  }
}

async function sync() {
  // On CI/Vercel the vault isn't available — keep the committed graph.json
  if (!fs.existsSync(VAULT_DIR)) {
    console.log('Vault not found, skipping sync (using committed graph.json)')
    return
  }

  const files = await glob('**/*.md', {
    cwd: VAULT_DIR,
    ignore: IGNORE.map(d => `${d}/**`),
  })

  const nodes = []
  const nodeMap = new Map()
  const edges = []

  // Read mission nodes from KD vault
  for (const file of files) {
    const fullPath = path.join(VAULT_DIR, file)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { data: frontmatter, content } = matter(raw)

    const name = path.basename(file, '.md')
    const slug = slugify(name)
    const category = getCategoryFromPath(file)
    const links = extractWikilinks(content)
    const wordCount = content.split(/\s+/).filter(Boolean).length

    const node = {
      id: slug,
      name,
      category,
      dataset: 'mission',
      content,
      wordCount,
      links: links.map(l => slugify(l)),
      linkNames: links,
      path: file,
      ...frontmatter,
    }

    nodes.push(node)
    nodeMap.set(slug, node)
    nodeMap.set(name.toLowerCase(), node)
  }

  // Read research nodes from Obsidian Gov ecosystem folder
  if (fs.existsSync(RESEARCH_DIR)) {
    const RESEARCH_CATEGORIES = {
      'ecosystem': 'Research',
      'venture-capital': 'Venture Capital',
      'venture-builder': 'Venture Builder',
      'accelerator': 'Accelerator',
      'startup': 'Startup',
      'gov-funding': 'Gov Funding',
    }

    const researchFiles = await glob('*.md', { cwd: RESEARCH_DIR })
    for (const file of researchFiles) {
      const fullPath = path.join(RESEARCH_DIR, file)
      const raw = fs.readFileSync(fullPath, 'utf-8')
      const { data: frontmatter, content } = matter(raw)

      const name = frontmatter.title || path.basename(file, '.md')
      const slug = slugify(path.basename(file, '.md'))
      const category = RESEARCH_CATEGORIES[frontmatter.category] || 'Research'
      const links = extractWikilinks(content)
      const wordCount = content.split(/\s+/).filter(Boolean).length

      if (nodeMap.has(slug)) continue // skip duplicates

      const node = {
        id: slug,
        name,
        category,
        dataset: 'research',
        content,
        wordCount,
        links: links.map(l => slugify(l)),
        linkNames: links,
        path: `research/${file}`,
      }

      nodes.push(node)
      nodeMap.set(slug, node)
      nodeMap.set(name.toLowerCase(), node)
    }
    console.log(`Research: ${researchFiles.length} files from ${RESEARCH_DIR}`)
  } else {
    console.log('Research vault not found, skipping research nodes')
  }

  const nodeIds = new Set(nodes.map(n => n.id))

  for (const node of nodes) {
    for (const linkSlug of node.links) {
      if (nodeIds.has(linkSlug)) {
        edges.push({ source: node.id, target: linkSlug })
      }
    }
  }

  const connectionCounts = {}
  for (const edge of edges) {
    connectionCounts[edge.source] = (connectionCounts[edge.source] || 0) + 1
    connectionCounts[edge.target] = (connectionCounts[edge.target] || 0) + 1
  }

  for (const node of nodes) {
    node.connections = connectionCounts[node.id] || 0
  }

  // Build dashboard data from vault content
  const dashboard = buildDashboard(nodes)

  const graph = {
    nodes,
    edges,
    dashboard,
    meta: {
      totalConcepts: nodes.length,
      totalConnections: edges.length,
      categories: [...new Set(nodes.map(n => n.category))],
      syncedAt: new Date().toISOString(),
    },
  }

  const json = JSON.stringify(graph, null, 2)

  // Save locally
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, json)

  // Upload to Vercel Blob if token is available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put('graph.json', json, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })
    console.log(`Uploaded to Vercel Blob: ${blob.url}`)
  } else {
    console.log('No BLOB_READ_WRITE_TOKEN found, skipping upload (set it in .env.local)')
  }

  console.log(`Synced: ${nodes.length} concepts, ${edges.length} connections`)
  console.log(`Categories: ${graph.meta.categories.join(', ')}`)
  console.log(`Output: ${OUT_FILE}`)
}

sync().catch(console.error)
