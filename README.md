# SquadTime frontend — MIT licensed

Public frontend repo for SquadTime, the gaming-friend availability planner. The backend (Cloudflare Workers, D1 database, migrations, secrets) stays private; only the React + Vite frontend lives here.

## Build

```bash
npm install
npm run build
```

The build writes to `dist/`.

## Development

```bash
npm run dev
npm run lint
npm run typecheck
npm test
```

## API base URL

Point the frontend at a backend instance via `VITE_API_URL` (default: `http://localhost:8787`). See `.env.example`.

## License

MIT — see `LICENSE`.
