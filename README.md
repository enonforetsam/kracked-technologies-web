# Founder OS

*A system and digital brain for founders. Local-first, AI-native, open source.*

## What this is

Founder OS is the open-source user interface for your own local knowledge vault. Point it at a folder of markdown files (yours, or a fresh one), connect your AI of choice, and it becomes a personal operating system for running early-stage work — ideas, strategies, ventures, deals, and the people around them.

The first working instance of Founder OS was built at Kracked Technologies and is used to run the company. This repository will be extracted from that private instance and published as a neutral, generic app anyone can clone.

**Internal note:** this repository is currently the live Kracked instance (*Danial's Lab*). The public **Founder OS** release will be a stripped, neutral fork. See [this walkthrough](#walkthrough) for the plan.

## The core idea

A knowledge vault is only useful if you can see the right subset for the job. Founder OS introduces **projects as lenses** — a manifest file declares which parts of the vault each project sees. Agents run scoped to a project, not the whole vault. Your data never leaves your machine. The vault is canonical; projects are views.

Read the full thinking in [My Lab - Whitepaper](../Danials%20Lab/Lab/My%20Lab%20-%20Whitepaper.md) and the product framing in [Founder OS - Positioning](../Danials%20Lab/Lab/Founder%20OS%20-%20Positioning.md).

## Five-minute quick start (future public version)

Once published:

```bash
git clone https://github.com/kracked/founder-os
cd founder-os
pnpm install
VAULT_PATH=/absolute/path/to/your/vault pnpm dev
```

Then open http://localhost:5173 and run the onboarding conversation.

## Walkthrough

### 1. Clone
You clone Founder OS to your machine.

### 2. Point at a vault
A folder of markdown files. It can be a brand-new empty folder (the onboarding skill will populate it), an existing Obsidian vault, or any git-tracked notes directory. You set `VAULT_PATH` once and forget.

### 3. Connect an AI
Paste a Claude or OpenAI API key into settings. Your LLM calls go directly from your machine to the provider. Founder OS never proxies or stores them.

### 4. Run `/onboard`
The AI asks you five questions — your name, what you're building, your 90-day goal, your team, and the thing you're worst at tracking. Five minutes. The AI proposes your initial file layout. You approve.

### 5. Work
Every change an agent proposes goes through the **Pending Approvals** queue. You stay in the loop. Your vault never grows without your sign-off.

### 6. Extend
Add new projects as manifests in `Lab/projects/`. Add new agents as markdown specs in `Agents/`. Add new skills as markdown files in `Lab/skills/`. Everything is plain text. Everything is yours.

## What's inside

```
src/               React UI (Vite)
scripts/sync.mjs   Reads the vault → emits graph.json + Lab project lists
public/            Static assets
```

The UI reads `graph.json`, which is regenerated every time the sync script runs. `graph.json` is the bridge between your markdown vault and everything the UI displays.

## Architecture at a glance

- **Vault** — your folder of markdown files. Not in this repo. Never uploaded.
- **Sync script** — a Node script that walks the vault, parses frontmatter and wikilinks, and produces a single `graph.json`.
- **UI** — a React app that reads `graph.json` and renders Mission Control, Strategy, Graph, Wiki, Vision, and the Lab gallery.
- **Agents** — markdown specs in the vault. The UI knows how to invoke them via your connected LLM.
- **Skills** — markdown procedures agents can run on demand (onboard, weekly review, capture, etc.).

## Open-source extraction plan

Before publishing `founder-os` publicly:

1. Strip Kracked-specific strings, agent names, pillar content, and proprietary positioning.
2. Replace with generic placeholders and a small demo vault (3 sample projects, 2 sample agents).
3. Add MIT `LICENSE`.
4. Add one-click Vercel deploy button.
5. Publish. Post to Threads, X, Hacker News, Product Hunt.

## License

Not yet licensed. Will be MIT at public release.

## Credits

Built at [Kracked Technologies](https://krackeddevs.com) as part of [The Kracked Digital Kampung](../Danials%20Lab/Vision/The%20Kracked%20Vision.md).
