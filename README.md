# Playground Keyword Research App

A premium keyword research dashboard built inside `maximoseo/playground` using Next.js, TypeScript, Tailwind, TanStack Query/Table, Recharts, and a secure server-side Keywords Everywhere adapter.

## Setup

```bash
npm install
cp .env.example .env.local
# add KEYWORDS_EVERYWHERE_API_KEY to .env.local
npm run dev
```

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:e2e
```

## Notes
- All Keywords Everywhere requests go through server-side code only.
- Identical requests are cached server-side with a 24h TTL.
- Favorites and saved lists persist locally in `src/data/*.json` for this repo.
- Long-tail, questions, clustering, relevance, and opportunity are derived fields and labeled as such in code/UI.
