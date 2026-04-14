import { useState, useEffect } from 'react'
import GraphPage from './pages/GraphPage'

const CATEGORY_COLORS = {
  Ecosystem: '#00f0ff',
  Platform: '#ff6b2d',
  Ventures: '#b44dff',
  Projects: '#ff2d7b',
  Team: '#39ff14',
  Root: '#ffe600',
}

export { CATEGORY_COLORS }

export default function App() {
  const [graph, setGraph] = useState(null)

  useEffect(() => {
    fetch('/graph.json')
      .then(r => r.json())
      .then(setGraph)
  }, [])

  if (!graph) return null

  return (
    <div className="app">
      <GraphPage graph={graph} />
    </div>
  )
}
