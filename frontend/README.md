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
│       ├── submissions/         # /submissions           all graded attempts
│       └── submissions/[id]/    # /submissions/:id       evaluation result
├── components/
│   ├── ui/                      # shadcn primitives + empty-state
│   ├── layouts/                 # app shell, sidebar, header, breadcrumbs, page header, profile
│   └── features/
│       ├── dashboard/           # stats, case toolbar, case cards, empty states
│       ├── property/            # details, market, framework, attempt history, start/resume button
│       ├── underwriting/        # workspace: steps, fields, line items, deal summary, review, submit dialog
│       ├── result/              # score hero, band chart, leaderboard card
│       ├── submissions/         # submissions table with property filter
│       └── shared/              # score/status badges, property image and cell, scoring bands, load error
├── hooks/                       # React Query hooks, autosave, URL-state hooks
├── services/                    # API client + one service per resource (fetch + map to app types)
├── lib/                         # pure logic: formatting, stats, leaderboard, score explanation
│   └── underwriting/            # calculations, validation schema, form ⇄ API mapper, draft backup, pre-submit check
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

## Testing

```bash
npm run test:e2e           # runs the whole suite headless, unattended
npm run test:e2e:report    # opens the last HTML report
```

The suite (`tests/`) never talks to the real FastAPI backend. Every spec calls `mockBackend()` from `tests/fixtures/mock-api.ts` before navigating, which intercepts every `/api/*` call the app makes (`page.route`) and serves deterministic, in-memory fixture data for two fictional training cases (`PROPERTIES.A` / `PROPERTIES.B`). This is a deliberate choice, not just a convenience:

- **Determinism.** Outcomes (Best/Medium/Low, validation state, draft contents) are fixed by the fixture, not by whatever happens to be in the seeded Docker database at run time.
- **No pollution.** The real backend has no auth/multi-user separation, so tests that actually started or submitted real underwritings would create real drafts and skew real attempt counts. Mocking keeps the suite's writes entirely in-memory and local to each test.
- **Runs unattended.** The suite never requires Docker/the backend to be up at all — only the Next.js dev server (started automatically by `playwright.config.ts`'s `webServer`).
- **Multiple cases.** Each mocked dashboard always carries both fixture properties — the one the test is actively driving (`activeProperty: "A" | "B"`), plus the other left untouched (`not_started`). `scoring-outcomes.spec.ts`'s Low case and `resume-draft.spec.ts` exercise property B and A respectively, so the suite isn't just one property tested six different ways.

Coverage (`tests/*.spec.ts`):

| File                       | Covers                                                                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primary-path.spec.ts`     | The full primary user path: dashboard → property → start → fill every section → submit → Best result, including the leaderboard card                                                                           |
| `scoring-outcomes.spec.ts` | Evaluation behavior for the Medium and Low bands (the PDF's "write Playwright cases for all three outcomes"), Low on a second property                                                                        |
| `validation.spec.ts`       | Submission is blocked until the checklist is clear, "Go to field" lands on the right input, and out-of-range values are flagged immediately while merely-empty fields aren't flagged just from navigating away |
| `resume-draft.spec.ts`     | Edge state: resuming an in-progress draft loads its saved values and never creates a second underwriting, alongside a second untouched case on the dashboard                                                   |

**Debugging a failure:** the config captures a screenshot and video on failure and a full trace on retry (`trace: "on-first-retry"`). `npm run test:e2e:report` opens the HTML report with those artifacts, and `npx playwright test --trace on` forces a trace on the very first run for local debugging.

## Where to start reading

1. `services/dashboard.service.ts` → `lib/dashboard.ts` → `components/features/dashboard/dashboard-view.tsx`
2. `lib/underwriting/calculations.ts`, `schema.ts`, `form-mapper.ts`
3. `components/features/underwriting/workspace-form.tsx` (form state, autosave, review, submit)
4. `components/features/result/result-view.tsx` and `lib/score-explanation.ts`
