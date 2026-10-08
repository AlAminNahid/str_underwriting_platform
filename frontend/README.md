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

`npm run build` · `npm run lint` · `npm test`

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
npm test                   # unit + end-to-end, headless and unattended
npm run test:unit          # unit tests only
npm run test:e2e           # end-to-end tests only
npm run test:e2e:report    # opens the last HTML report
```

Both suites run on the Playwright test runner, configured as two projects in `playwright.config.ts` (`unit` and `e2e`), so there is one tool and one report.

### Fixture strategy

The suite never talks to the real FastAPI backend. Every end-to-end spec calls `mockBackend()` from `tests/fixtures/mock-api.ts` before navigating. It intercepts every `/api/*` call (`page.route`) and serves in-memory data that follows the API's contract:

- **Determinism.** Outcomes are fixed by fixtures, not by whatever is in the seeded Docker database at run time.
- **No pollution.** The real backend has no per-user separation, so tests that started or submitted real underwritings would create real drafts and skew attempt counts. Every write stays in memory, local to one test.
- **Runs unattended.** Only the Next.js dev server is needed, and `playwright.config.ts` starts it.
- **Behaves like the API, not a canned reply.** Saves update the in-memory draft. Submit applies the payload, returns `422 Missing required sections` when a section is absent (as the API does), and grades the submitted Mid forecast with the API's rule (`|mid − reference| ÷ reference`, with ≤ 10% scoring Best and ≤ 25% Medium, both limits inclusive). Options such as `failSaves`, `failSubmits` and `saveDelayMs` inject server errors and slow saves for edge-state tests.
- **Scoring cases come from the brief.** `tests/fixtures/brief-cases.ts` holds the brief's reference table: six properties with their reference Mid and their Best and Medium ranges. `SCORING_CASES` turns each row into three cases at the band edges (Best, Medium, and $1 outside Medium), alternating the lower and upper edges between properties. Adding a row adds three tests.
- **Every call is recorded.** `mockBackend()` returns a call log (`startUnderwritingCalls`, `saveCalls`, `submitCalls`, `submitPayloads`, and an ordered `events` list), so tests can check what the app sent as well as what it shows.

### Coverage

| File                                                                          | Covers                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primary-path.spec.ts`                                                        | Full path: dashboard → property → start → every section → submit → Best result with leaderboard. Checks the submit payload, including percentages sent as fractions (`25` → `"0.25"`, `6.99` → `"0.0699"`)  |
| `scoring-outcomes.spec.ts`                                                    | 18 data-driven cases from the brief's table: each property at a Best edge, a Medium edge and just outside Medium. Checks the forecast sent, the score, the band and the explanation text                       |
| `validation.spec.ts`                                                          | Submit is blocked until the checklist is clear, Go to field lands on the right input, out-of-range values are flagged immediately, untouched fields aren't flagged just because the trainee navigated away, and the API's numbers are hidden while the checklist has open items |
| `resume-draft.spec.ts`                                                        | Resuming an in-progress draft loads its saved values and never creates a second underwriting. Opening a draft without editing it sends no save                                                            |
| `failure-states.spec.ts`                                                      | A failed autosave shows an error, pauses autosave and recovers with Retry. A failed submission keeps the trainee on the draft with an error, and a second attempt succeeds. Submitting during an in-flight save waits for it, and no save is sent after submit |
| `unit/calculations.spec.ts`                                                   | Live-preview formulas against numbers produced by the backend calculator for the same inputs (to the cent), plus 0% interest, $0 out of pocket and missing inputs                                          |
| `unit/schema.spec.ts`                                                         | The required-inputs counter, including an incomplete expense line counting as open                                                                                                                         |
| `unit/form-mapper.spec.ts`                                                    | Percentage-to-fraction conversion, leaving out incomplete sections, and how half-filled line items are sent                                                                                                 |

**Debugging a failure:** the config captures a screenshot and video on failure and a full trace on retry (`trace: "on-first-retry"`). `npm run test:e2e:report` opens the HTML report with those artifacts, and `npx playwright test --trace on` forces a trace on the very first run for local debugging.

## Where to start reading

1. `services/dashboard.service.ts` → `lib/dashboard.ts` → `components/features/dashboard/dashboard-view.tsx`
2. `lib/underwriting/calculations.ts`, `schema.ts`, `form-mapper.ts`
3. `components/features/underwriting/workspace-form.tsx` (form state, autosave, review, submit)
4. `components/features/result/result-view.tsx` and `lib/score-explanation.ts`
