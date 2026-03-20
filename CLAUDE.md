# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Express + Vite HMR) on port 5000
npm run build        # Production build (Vite client + esbuild server)
npm run start        # Run production server
npm run check        # TypeScript type checking
npm run db:push      # Push Drizzle schema to PostgreSQL

# Playwright E2E tests
npx playwright test                      # Run all tests
npx playwright test tests/gameplay.spec.ts  # Run single test file
npx playwright test -g "test name"       # Run test by name
```

## Architecture

Single monorepo: Express server (port 5000) serves both the API and Vite-built React client.

**`client/`** — React 18 + TypeScript + Tailwind CSS frontend, bundled by Vite.
- `src/components/` — 13 game UI components, rendered by phase-based routing in `App.tsx`
- `src/game/` — Game engine, state management, data modules
- `src/pages/`, `src/hooks/`, `src/lib/` — Supporting code

**`server/`** — Express backend with Vite middleware (dev) or static serving (prod).
- `vite.ts` handles dev/prod Vite integration
- `storage.ts` — in-memory storage (Drizzle ORM + PostgreSQL configured but not active)

**`shared/`** — Shared types/schema between client and server (currently minimal).

**`tests/`** — 8 Playwright E2E test suites covering all game phases.

## Game State Flow

State management uses React Context + `useReducer` in `GameContext.tsx`. The `GameState` interface (in `types.ts`) is the single source of truth. Key dispatch actions: `NEW_GAME`, `SET_PHASE`, `UPDATE_STATE`, `END_TURN`, `SELECT_UNIT`, `SELECT_BASE`, `SET_RESEARCH`.

Game phases drive UI routing in `App.tsx`: `title` → `faction_select` → `landing` → `playing` (with sub-phases: `research`, `diplomacy`, `base_management`, `datalinks`) → `victory`.

Core game logic lives in `engine.ts`: `createNewGame()`, `processTurn()`, `moveUnit()`, `foundBase()`, `setResearch()`, `buildInBase()`.

## Key Data Modules

- `factions.ts` — 7 factions with leaders, personalities, bonuses, quotes
- `technologies.ts` — 40+ techs across 4 tiers and 4 categories (explore/discover/build/conquer)
- `mapgen.ts` — Procedural hex map generation
- `audio.ts` — Web Audio API procedural music engine with faction-specific themes and SFX

## Path Aliases

```
@/*       → client/src/*
@shared/* → shared/*
@assets/* → attached_assets/*
```

## Styling

Tailwind CSS with dark sci-fi theme. Custom CSS variables (HSL) for colors. No component library — all UI is custom-styled with inline styles + Tailwind classes. The visual aesthetic is a command-center interface with cyan glows and scanline effects.

## Testing

Playwright tests run against the dev server (`http://localhost:5000`). The `webServer` config in `playwright.config.ts` auto-starts `npm run dev`. Tests are headless Chromium with screenshots on failure and traces on first retry. Test suites cover: title screen, faction select, landing sequence, full game flow, gameplay, research/diplomacy, audio engine, and visual screenshots.
