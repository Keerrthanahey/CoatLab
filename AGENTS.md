# CoatLab — Materials Intelligence Platform

AI-assisted prediction and analysis of coating (Mg) process–property relationships.

## Commands

- `npm run dev` — start the development server
- `npm run build` — production build (runs TypeScript type checking)
- `npm run lint` — run ESLint
- `npm run start` — serve the production build

## Architecture notes

- The UI only talks to `lib/api/client.ts` (`api` facade). It currently resolves
  to the mock client in `lib/api/mock.ts`. Set `NEXT_PUBLIC_API_BASE_URL` to
  switch to the real FastAPI client (`lib/api/live.ts`).
- Strong response types live in `lib/types`; endpoint map in
  `lib/api/client.ts` (`API_ENDPOINTS`).
- The prediction form is schema-driven: append to `parameterDefinitions` in
  `lib/mock-data/prediction.ts` to add process parameters.
- All mock outputs are explicitly labelled (Demo / Mock / Awaiting …) and must
  never be presented as scientific results.
