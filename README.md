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
- **Schema-driven prediction form** — append to `parameterDefinitions` in
  `lib/mock-data/prediction.ts` to add process parameters.
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

## Getting Started

```bash
# install dependencies
npm install

# start the dev server (default port 3000)
npm run dev

# run on a specific port
npm run dev -- -p 3333
```

Open [http://localhost:3000](http://localhost:3333).

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Production build (runs type checking)|
| `npm run start`   | Serve the production build           |
| `npm run lint`    | Run ESLint                           |

## Architecture Notes

- The UI only talks to `lib/api/client.ts` (the `api` facade). It currently
  resolves to the mock client in `lib/api/mock.ts`. Set
  `NEXT_PUBLIC_API_BASE_URL` to switch to the real FastAPI client
  (`lib/api/live.ts`).
- Strong response types live in `lib/types`; the endpoint map lives in
  `lib/api/client.ts` (`API_ENDPOINTS`).
- The prediction form is schema-driven via `parameterDefinitions` in
  `lib/mock-data/prediction.ts`.
- All mock outputs are explicitly labelled (Demo / Mock / Awaiting…) and must
  never be presented as scientific results.

## Project Structure

```
app/                  # App Router pages and layout
├── (shell)/          # Shell layout + dashboard, dataset, literature,
│                     # materials, microstructure, model, prediction, settings
└── globals.css       # Dark theme tokens, fonts, keyframes, utilities
components/
├── interactive/      # ParticleCanvas, Crystal3D, StatCounter, TiltCard
├── shell/            # AppShell
├── sidebar/          # Sidebar navigation
├── topbar/           # Glassmorphism navbar
├── cards/            # KPI cards
├── charts/           # Recharts wrappers + placeholders
├── material/         # Crystal viewer, microstructure upload zone
├── literature/       # Literature index + research assistant
├── prediction/       # Prediction form + results
└── ui/               # Badge, Button, Card, Tabs, EmptyState, etc.
lib/                  # API client, types, mock data, navigation
```

## Deployment

The app is deployed via [Vercel](https://vercel.com). Push to the `master`
branch and Vercel will build the latest commit — or trigger a redeploy from the
project dashboard.

## License

Private project.
