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

const VAULT_DIR = path.resolve(process.cwd(), '..', 'Kracked Technologies')
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

function getCategoryFromPath(relPath) {
  const parts = relPath.split(path.sep)
  return parts.length > 1 ? parts[0] : 'Root'
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

  const graph = {
    nodes,
    edges,
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
