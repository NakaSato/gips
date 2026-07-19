# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`eip.tools` — Next.js 16 (App Router) + React 19 + TypeScript + Chakra UI app for browsing and cross-referencing Ethereum proposals: **EIPs, ERCs, RIPs, CAIPs**. Renders proposal markdown, an interactive dependency graph (react-force-graph / three.js), AI summaries, an author directory, and Farcaster frames.

> This repo is a **git submodule of the `gridtokenx-coresystem` superproject** but is otherwise an unrelated standalone app. Ignore the parent `../CLAUDE.md` (gridtokenx/Rust) — it does not apply here.

## Commands

```bash
bun i                 # install (repo declares packageManager pnpm@9, but bun is used here)
bun run dev           # dev server → http://localhost:3000
bun run build         # next build (API routes are force-dynamic; needs data JSON present)
bun run lint          # eslint . (ESLint 9 flat config, eslint-config-next)
bun run gen-graph     # regenerate data/eip-graph-data.json from data/validEIPs
bun run eip           # full data-refresh pipeline (see below)
```

No test suite exists. `bun run eip` runs, in order: `getWIPEIPsFromPRs.ts` (scrape open PRs) → `git submodule update --remote` → `fetchValidEIPs.ts` → `genEIPDependencyGraph.ts`. The recurring `chore: update EIP data` commits are this pipeline's output.

## Architecture

**Data is precomputed and committed — it is the runtime source of truth.** The app reads `data/valid-{eips,rips,caips}.json` and `data/eip-graph-data.json` directly (imported via `data/valid*.ts` wrappers, e.g. `@/data/validEIPs`). It does **not** read the `submodules/` at runtime.

- `submodules/{EIPs,ERCs,RIPs,CAIPs}` (git submodules of the upstream repos) are inputs to the offline `fetchValidEIPs.ts` script only. They are currently **uninitialized** — dev/build work without them; only `bun run eip` needs `git submodule update --init`.
- Proposal **body markdown is fetched client-side** from `raw.githubusercontent.com` (the `markdownPath` in each entry), not stored locally.
- ERCs live under the EIP namespace: they carry `isERC: true` and are served on the `/eip/*` route. In `fetchValidEIPs.ts`, ERC dir is checked **before** EIP dir because the EIPs repo keeps stub duplicates without content.

**Routing.** `proxy.ts` (Next 16's renamed middleware — `export function proxy`, not `middleware`) redirects a bare numeric path `/1234` to `/eip/1234`, `/rip/1234`, or `/caip/1234` depending on which valid-array contains the id. Dynamic proposal pages: `app/{eip,rip,caip}/[eipOrNo]/page.tsx` — `[eipOrNo]` accepts `1234`, `eip-1234`, or `eip-1234.md` (parsed by `extractEipNumber` / `extractMetadata` in `utils/index.ts`).

**Persistence (optional).** MongoDB via Mongoose, used only by two API routes:
- `POST /api/aiSummary` — returns a cached OpenAI `gpt-4o` summary of a proposal, generating + caching it on miss (`models/aiSummary.ts`).
- `POST /api/logPageVisit` — records a visit (`models/pageVisit.ts`).

Models use the `try { model(name) } catch { model(name, schema) }` pattern to survive Next hot-reload. API routes set `export const dynamic = "force-dynamic"`. **Missing `MONGODB_URL` degrades gracefully** (logPageVisit returns 204) — the app runs without a DB or any keys; only summaries/analytics/frames need them.

**Farcaster.** `app/api/frame/*`, `app/api/webhook`, `app/lib/neynar.ts` integrate Neynar for Farcaster frames/casts.

**Key utils** (`utils/`):
- `index.ts` — frontmatter parsing (`extractMetadata` handles dash-decorated `---` fences, `convertMetadataToJson`), the `EIPStatus`/`STATUS_COLORS` maps (drive badges + OG images), `getReferencedByEIPs` (reverse-graph lookup), and an **author directory** built at module load from `data/authors/authors.json` + `custom-authors.json` (alias dedup, github/twitter/avatar resolution).
- `proposals.ts` — builds/sorts proposal list items, dedups by number, constructs the correct GitHub PR URL per repo (EIPs/ERCs/RIPs/CAIPs).

## Conventions

- Path alias `@/*` → repo root (`tsconfig.json`). `submodules` is excluded from tsconfig.
- `strict: true` TypeScript. `reactStrictMode: false` (Next config) — force-graph libs misbehave under double-invoke.
- Env: see `.env.sample` → `.env.local`. `GITHUB_TOKEN` (PR scraping), `MONGODB_URL`, `OPENAI_API_KEY`/`OPENAI_ORG_ID`, `NEYNAR_*`, `NEXT_PUBLIC_VERCEL_URL` (base URL via `getBaseUrl()`).
- Shared types in root `types.ts`; Zod request schemas in `data/schemas.ts`.
- **OG image routes run on `runtime = "nodejs"`, not edge.** next/og's satori/resvg wasm plus the Next edge runtime sit at a ~1MB floor that breaches Vercel's 1MB edge-function cap regardless of data, so all five OG routes (four list `app/{eips,ercs,rips,caips}/opengraph-image.tsx` + per-proposal `app/api/og/route.tsx`) are Node functions (no size cap). Because Node's `fetch` rejects `file://` URLs, they load the font + base PNG with `fs/promises` `readFile(new URL(..., import.meta.url))` — Vercel's nft traces those URLs so the assets ship. **Don't flip these back to edge.**
- **These routes still read slim precomputed data** (an optimization now, not a hard requirement), both regenerated from `getProposalListItems`/the valid-* arrays so they can't drift, and chained into `bun run eip`:
  - **List images** render only a count → `utils/proposalListOgImage.tsx` reads `data/proposal-counts.json` via `@/data/proposalCounts`. Regenerate: `bun run gen-counts` (`scripts/genProposalCounts.ts`).
  - **Per-proposal image** needs title/status/isERC → reads slim `data/og-index.json` (~117KB) via `@/data/ogIndex`. Regenerate: `bun run gen-og-index` (`scripts/genOgIndex.ts`).
