# CoatLab — Materials Intelligence Platform

## Frontend commands

Run frontend commands from `frontend/`:

- `npm install` — install frontend dependencies
- `npm run dev` — start the Next.js development server
- `npm run build` — create a production build
- `npm run lint` — run ESLint
- `npm run start` — serve the production build

## Architecture notes

- The Next.js application lives in `frontend/`; the FastAPI application lives
  in `backend/`.
- The UI only talks to `frontend/lib/api/client.ts` (the `api` facade). It
  currently resolves to the mock client in
  `frontend/lib/api/mock.ts`. Set `NEXT_PUBLIC_API_BASE_URL` to switch to
  the real FastAPI client in `frontend/lib/api/live.ts`.
- Strong response types live in `frontend/lib/types`; endpoint map in
  `frontend/lib/api/client.ts`.
- The prediction form is schema-driven: append to
  `frontend/lib/mock-data/prediction.ts` to add process parameters.
- All mock outputs are explicitly labelled (Demo / Mock / Awaiting …) and must
  never be presented as scientific results.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `frontend/node_modules/next/dist/server/lib/generate-agent-files.js`. In this monorepo, resolve the Next.js package from the frontend directory.

<!-- END:nextjs-agent-rules -->
