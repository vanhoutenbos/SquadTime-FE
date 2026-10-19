# SquadTime — frontend (MIT)

React + Vite + TypeScript (strict). Public repo; backend lives separately.

## Commands

- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint flat config
- `npm run typecheck` — TypeScript `noEmit`
- `npm test` — Vitest (jsdom, `src/**/*.test.{ts,tsx}`)
- `npm run format` / `format:check` — Prettier

## Env

`VITE_API_URL` (see `.env.example`). No secrets in this repo.

## Stack notes

- Dark theme, dark-only. Design reference in `design/`; docs in `docs/design.md`.
- All UI strings in `src/strings/`.
- API contract is HTTP `/api/*`; backend URL is env-driven.
