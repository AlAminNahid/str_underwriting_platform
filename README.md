# Underwriting Academy · STR Search

A training platform where trainee analysts practise underwriting short-term rental properties. A trainee picks a property, works through the financials, revenue scenarios and deal tags, submits, and is scored on how close their **Mid revenue forecast** lands to a senior analyst's reference. The result explains the score instead of just showing it.

Built for the STR Search Frontend Engineer Assessment with **Next.js 16, React 19, TypeScript, shadcn/ui and Tailwind CSS 4**, on top of the provided FastAPI training API.

| Folder                  | Contents                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`frontend/`](frontend) | The Next.js application (this submission). Code structure and conventions: [`frontend/README.md`](frontend/README.md) |
| [`backend/`](backend)   | The provided FastAPI + Postgres API, unchanged. See [`backend/README.md`](backend/README.md)                          |

**Contents:** [Quick start](#quick-start) · [Workflow](#workflow) · [Design rationale](#design-rationale) · [Technical decisions](#technical-decisions) · [Assumptions and limitations](#assumptions-and-limitations) · [Project status](#project-status) · [Scripts](#scripts)

---

## Quick start

**Requirements:** Docker Desktop and Node.js 20.9 or later (developed on Node 22).

**1. Start the API.** Docker builds the API, starts Postgres, runs migrations and loads the seed data (4 markets, 6 properties and the analyst references).

```bash
cd backend
docker compose up -d --build
```

Verify it at http://localhost:8000/api/dashboard (six properties). Interactive API docs: http://localhost:8000/docs.

**2. Start the frontend** in a second terminal.

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

**Reset to clean seed data** (removes every draft and submission):

```bash
cd backend
docker compose down -v && docker compose up -d --build
```

### Environment

| Variable              | Default                 | Purpose                      |
| --------------------- | ----------------------- | ---------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Base URL of the training API |

---

## Workflow

The app follows the seven steps in the brief. Each screen has one clear job and hands off to the next.

| Step                              | Screen                                                                                                                                                                                                                    | Route                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 1. Pick a property                | **Training dashboard**: progress stats, case cards with photo, status and score (latest, plus best when there are several attempts); filter by status, search by address, filter by market                                | `/`                               |
| 2. Review property and market     | **Property page**: listing details, market description, the three-step underwriting chain, scoring bands and attempt history; one primary action that adapts: _Start underwriting_, _Resume draft_ or _Start new attempt_ | `/properties/[zpid]`              |
| 3–4. Underwrite and check outputs | **Workspace**: Financials (purchase and financing, optimization list, operating expenses, taxes), Analysis (Low / Mid / High revenue, assumptions, scenario table) and Deal tags, with a live Deal summary and autosave   | `/underwritings/[id]`             |
| 5. Submit                         | **Review & submit**: checklist of missing and invalid fields with _Go to field_, key assumptions, the API's calculated numbers, and a confirmation dialog that flags extreme inputs                                       | `/underwritings/[id]?step=review` |
| 6. See the score                  | **Evaluation result**: score and plain-language explanation, band chart, feedback tied to the property's market, and rank among your attempts                                                                             | `/submissions/[id]`               |
| 6. Track progress                 | **Submissions**: every graded attempt, newest first, filterable by property. **Leaderboard**: attempts ranked by score, then by how close the forecast was                                               | `/submissions`, `/leaderboard`    |
| 7. Automated tests                | Playwright end-to-end suite, run from the command line (see [Project status](#project-status))                                                                                                                          | —                                 |

---

## Design rationale

**The underwriting chain organises the interface.** The brief describes underwriting as three questions: what the deal costs up front (Total Out of Pocket), what it earns each year (Annual Free Cash Flow) and how good the return is (Cash-on-Cash). The property page introduces this chain, the workspace's Deal summary tracks it live as the trainee types, and the confirmation dialog repeats it before submitting. Every input sits in the section that feeds one of those three numbers.

**The graded number is always visible.** Only the Mid revenue forecast is scored, so it is highlighted in the workspace, the Deal summary, the confirmation dialog and the result. The scoring bands are shown on the property page before any input, so the trainee knows the rules before starting.

**Steps, not one long form.** The workspace is split into Financials, Analysis, Deal tags and Review. Each step tab shows how many items are still open, and a sticky action bar keeps save status and navigation in the same place on every step. Trainees can move freely between steps; nothing is lost because every change is autosaved.

**Errors are guided, not just reported.** Inline errors appear once a field is touched. The Review step lists everything still missing or invalid, grouped by section, and _Go to field_ opens the right step and focuses the input. Submit stays disabled until the list is empty.

**Feedback explains the score.** The result states how far the forecast was from the reference and in which direction ("84.0% below the analyst's $125,000"), and how much closer it needed to be for a higher band. The band chart shows where the forecast landed against the Best, Medium and Low zones. When the forecast missed, the tip quotes the property's own market description from the API (for example, that views and hot tubs drive revenue in the Smokies), so the advice is specific rather than generic.

**A safety net that doesn't give away the answer.** Before submitting, the confirmation dialog warns about extreme inputs, such as a price-to-revenue ratio below 8% or negative cash flow in every scenario. The check uses only the trainee's own numbers, never the reference.

**Honest labels.** The API has one trainee, so the leaderboard ranks the trainee's own attempts and says so, instead of implying a competition that doesn't exist.

**Calm failure states.** Every page has loading, empty and error states. If the API is unreachable, the trainee sees a plain-language message with a retry button rather than technical details.

---

## Technical decisions

**Data comes only from the API.** Every number on screen is returned by the API or derived from it with a documented formula (for example, price per sq ft). Responses pass through one mapping layer (`src/services/*`) that converts decimal strings (`"85.00"`) to numbers and snake_case to typed app models, so components never see raw API shapes.

**Percentages.** The API uses fractions (`0.20`); the form uses whole numbers (`20`). The conversion lives in one file, `src/lib/underwriting/form-mapper.ts`. Values are sent as decimal strings so `6.99%` arrives as exactly `0.0699`.

**Live numbers in the browser.** The API only calculates once every required section is complete, so the workspace computes a live preview with pure functions written from the brief's Calculations tab (`src/lib/underwriting/calculations.ts`). They were checked against the backend calculator on the same inputs and match to the cent. The Review step also shows the API's own calculated numbers from the last save.

**Autosave that works with partial input.** The API rejects half-filled purchase, tax and revenue sections, so autosave (about one second after typing stops) sends only complete, valid sections plus line items and tags. Partial input is kept in a per-draft browser backup that records which server version it builds on, so it is never restored over newer server data. Saves run one at a time, leaving with unsaved changes shows a browser warning, and autosave stops as soon as submit starts.

**One validation source.** A single zod schema (`src/lib/underwriting/schema.ts`) drives inline errors, step badges, the required-inputs counter, which sections can be saved, and the Review checklist, so they can never disagree.

**State in the URL.** Dashboard filters (`?status=&market=&q=`), the Submissions property filter (`?property=`) and the workspace step (`?step=analysis`) live in the URL, so refresh, back and shared links keep the view.

**Server state with React Query.** Loading, error and retry behaviour is consistent across pages, and Playwright can mock any API response with `page.route()`. After submitting, the response's submission and dashboard data go straight into the cache, so the result page and dashboard update without extra requests. Submissions and Leaderboard share one cached request.

**One rule for dashboard stats.** Completed cases, Average score and the score pill on each card all use the latest attempt per property. Cards with several attempts also show the best score.

**Inputs only show real values.** No number is used as placeholder text, so what a trainee sees in a field is exactly what is saved and calculated. New drafts start with the brief's training defaults for taxes (20 / 25 / 60 / 37) and 0% co-hosting fee and appreciation, as real values. Everything else starts empty, with guidance such as "Usually 20–25%" in the help text.

**Submit requires a complete underwriting.** The brief's "no forecast at all → Low (40)" case can't happen through the UI, and it can't happen through the API either: submitting without a revenue forecast returns `422 Missing required sections: forecasted_revenue`. The Low band is reached instead with a Mid forecast more than 25% from the reference.

**Guards.** `GET /api/underwritings/{id}` also serves the analyst's reference underwritings; the workspace refuses to show them so the answer can't leak. Submitted drafts open read-only. An open draft is always resumed, so starting never creates a duplicate.

---

## Assumptions and limitations

- **Leaderboard.** The API has a single trainee and no leaderboard endpoint. Ranking is derived from `GET /api/submissions` (score first, then the closer forecast, then the earlier submission). A multi-user endpoint would only change the data source.
- **Pre-submit warning thresholds** (PRR below 8% or above 50%) are general short-term rental rules of thumb, not values from the API. They only warn; they never block a submission.
- **User profile** is static. The API has no users or authentication, so there is no sign-in or sign-out.
- **Listing photos** come from the seed data (`img_src` on picsum.photos) and are random stock photos rather than the actual houses.
- **"View listing"** links to the seed's Zillow URLs, which point to fictional properties.
- **Light mode only**, by design.
- **The backend is unchanged.** All behaviour is built on the provided API as-is.

---

## Project status

| Area                                                              | Status   |
| ----------------------------------------------------------------- | -------- |
| Dashboard, property page, workspace, review & submit, result page | Complete |
| Submissions and Leaderboard pages                                 | Complete |
| Playwright end-to-end suite                                       | In progress. `npm run test:e2e` is wired up |
| Video walkthrough                                                 | To do    |

---

## Scripts

Run from `frontend/`:

```bash
npm run dev               # development server on http://localhost:3000
npm run build             # production build (includes type checking)
npm run lint              # ESLint (Next.js and React hooks rules)
npm run test:e2e          # Playwright end-to-end tests
npm run test:e2e:report   # open the last Playwright HTML report
```
