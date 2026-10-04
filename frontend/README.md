# Frontend · Underwriting Academy

Next.js app for the STR Search underwriting training assessment. Setup, the workflow and the main design decisions are in the [root README](../README.md); this file covers how the code is organised.

## Stack

|           |                                                                        |
| --------- | ---------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)      |
| UI        | shadcn/ui (`base-nova` style on Base UI), Tailwind CSS 4, lucide icons |
| Data      | TanStack React Query 5                                                 |
| Forms     | react-hook-form 7 + zod 4                                              |
| Tests     | Playwright                                                             |

## Run

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                  # http://localhost:3000 (the API must be running)
```

`npm run build` · `npm run lint` · `npm run test:e2e`

## Folder structure

```
src/
├── app/                         # Routes (App Router)
│   ├── layout.tsx               # fonts, metadata, providers
│   ├── providers.tsx            # React Query client + toaster
│   ├── icon.png                 # favicon (STR Search mark)
│   └── (app)/                   # pages inside the app shell
│       ├── page.tsx             # /                      dashboard
│       ├── properties/[zpid]/   # /properties/:zpid      property page
│       ├── underwritings/[id]/  # /underwritings/:id     workspace + review & submit
│       ├── submissions/[id]/    # /submissions/:id       evaluation result
│       ├── submissions/         # placeholder (next step)
│       └── leaderboard/         # placeholder (next step)
├── components/
│   ├── ui/                      # shadcn primitives + empty-state
│   ├── layouts/                 # app shell, sidebar, header, breadcrumbs, page header, profile
│   └── features/
│       ├── dashboard/           # stats, case toolbar, case cards, empty states
│       ├── property/            # details, market, framework, attempt history, start/resume button
│       ├── underwriting/        # workspace: steps, fields, line items, deal summary, review, submit dialog
│       ├── result/              # score hero, band chart, leaderboard card
│       └── shared/              # score/status badges, property image, scoring bands
├── hooks/                       # React Query hooks, autosave, URL-state hooks
├── services/                    # API client + one service per resource (fetch + map to app types)
├── lib/                         # pure logic: formatting, stats, leaderboard, score explanation
│   └── underwriting/            # calculations, validation schema, form ⇄ API mapper, draft backup
├── types/                       # api.ts (raw API shapes) · training.ts · underwriting.ts (app types)
├── constants/                   # routes, query keys, navigation, scoring bands, statuses, workspace config
└── config/                      # validated env, site metadata
```

## Conventions

- **API boundary.** Components never call `fetch` or read raw API shapes. `services/api-client.ts` handles the base URL, JSON, timeouts and turns failures into an `ApiError` with a readable message; each `services/*.service.ts` maps responses into the types in `types/training.ts` / `types/underwriting.ts`.
- **Pure logic lives in `lib/`** (no React), so stats, scoring explanations, calculations and validation can be read — and tested — on their own.
- **Routes and query keys** come from `constants/routes.ts` and `constants/query-keys.ts`; no hard-coded paths or keys in components.
- **Pages are thin.** Each `page.tsx` reads params and renders one `*-view.tsx` client component that owns loading, error and empty states.
- **Test hooks.** Interactive elements and key regions carry `data-testid`s (e.g. `case-card`, `property-cta`, `field-purchase.price`, `submit-underwriting`, `score-value`) for the Playwright suite.
- **Light mode only.** Brand tokens (pine `#0A4B39`, gold `#E9A753`, band colours) are defined in `app/globals.css` and used through Tailwind classes such as `bg-primary`, `bg-gold`, `text-success`.

## Where to start reading

1. `services/dashboard.service.ts` → `lib/dashboard.ts` → `components/features/dashboard/dashboard-view.tsx`
2. `lib/underwriting/calculations.ts`, `schema.ts`, `form-mapper.ts`
3. `components/features/underwriting/workspace-form.tsx` (form state, autosave, review, submit)
4. `components/features/result/result-view.tsx` and `lib/score-explanation.ts`
