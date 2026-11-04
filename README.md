# CoatLab — Materials Intelligence Platform

AI-assisted prediction and analysis of coating (Mg) process–property relationships.

Interactive dark-navy dashboard for exploring materials data, predicting coating
properties, analyzing microstructure, and reviewing literature — built with
Next.js, React, Tailwind CSS, and Framer Motion.

![Status](https://img.shields.io/badge/status-demo-brightgreen)

## Features

- **Interactive 3D crystal scene** — drag-to-rotate Mg HCP crystal with inertia
  and hover-follow, rendered on canvas with no external dependencies.
- **Particle repulsion field** — animated teal particles in the dashboard hero.
- **Glassmorphism navbar** — sticky header that blurs and darkens as you scroll,
  with live search, notifications, and a user menu.
- **Animated stat counters** — Framer Motion counters that count up on scroll
  into view.
- **3D tilt cards** — quick-action cards with perspective tilt and a shine
  highlight.
- **Schema-driven prediction form** — append to
  `frontend/lib/mock-data/prediction.ts` to add process parameters.
- **Dark navy theme** — full light→dark conversion of pages, feature
  components, and UI primitives.

## Tech Stack

- [Next.js](https://nextjs.org) 16 (Turbopack, App Router)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) v4
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Recharts](https://recharts.org) — charts
- [lucide-react](https://lucide.dev) — icons
- [TypeScript](https://www.typescriptlang.org)

## Repository Structure

```text
CoatLab/
├── frontend/             # Next.js application
│   ├── app/              # App Router pages and layouts
│   ├── components/       # UI and feature components
│   ├── lib/              # API client, types, and mock data
│   ├── public/           # Static assets
│   ├── package.json
│   └── .env.example
├── backend/              # FastAPI application, ML models, and data
├── AGENTS.md
└── README.md
```

## Getting Started

Run the frontend from its own directory:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3333](http://localhost:3333) when using the configured
port, or the URL printed by Next.js.

To run on port 3333 explicitly:

```bash
npm run dev -- -p 3333
```

Copy `frontend/.env.example` to `frontend/.env.local` and set the required
environment variables. Never commit real environment files or credentials.

## Frontend Scripts

Run these commands from `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Architecture Notes

- The UI only talks to `frontend/lib/api/client.ts` (the `api` facade). It
  currently resolves to the mock client in `frontend/lib/api/mock.ts`. Set
  `NEXT_PUBLIC_API_BASE_URL` to switch to the real FastAPI client in
  `frontend/lib/api/live.ts`.
- Strong response types live in `frontend/lib/types`; the endpoint map lives
  in `frontend/lib/api/client.ts` (`API_ENDPOINTS`).
- The prediction form is schema-driven via
  `frontend/lib/mock-data/prediction.ts`.
- All mock outputs are explicitly labelled (Demo / Mock / Awaiting…) and must
  never be presented as scientific results.

## Deployment

The frontend is deployed via [Vercel](https://vercel.com). Set the Vercel
project's **Root Directory** to `frontend`, then configure the frontend
environment variables in the Vercel project settings. Push to `master` to
trigger a deployment, or redeploy from the Vercel dashboard.

Deploy the FastAPI backend separately from the `backend/` directory.

## License

Private project.
