# Underwriting Academy · STR Search

Frontend engineer assessment: a training app where a trainee analyst picks a short-term rental property, underwrites it, submits, and sees how close their **Mid revenue forecast** landed to a senior analyst's reference.

| Folder                  | What it is                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| [`frontend/`](frontend) | Next.js 16 app (this submission) — see [`frontend/README.md`](frontend/README.md) for structure and conventions |
| [`backend/`](backend)   | Provided FastAPI + Postgres API — see [`backend/README.md`](backend/README.md)                                  |

---

## Quick start

**Requirements:** Docker Desktop, Node.js 20.9+ (developed on Node 22).

**1. Start the API** (database, migrations and seed data run automatically):

```bash
cd backend
docker compose up -d --build
```

Check it: http://localhost:8000/api/dashboard should list six properties. Interactive docs: http://localhost:8000/docs.

**2. Start the frontend** in a second terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

**Reset to clean seed data** (removes all drafts and submissions):

```bash
cd backend
docker compose down -v && docker compose up -d --build
```

### Environment

| Variable              | Default                 | Purpose                      |
| --------------------- | ----------------------- | ---------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Base URL of the training API |

---

## The workflow

| Step                              | Screen                                                                                                                                                                                                | Route                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 1. Pick a property                | **Training dashboard** — progress stats, case cards with photo, status, latest score; filter by status, search, filter by market                                                                      | `/`                               |
| 2. Review property and market     | **Property page** — listing details, market context, what you'll calculate, scoring bands, attempt history; _Start underwriting_ / _Resume draft_ / _Start new attempt_                               | `/properties/[zpid]`              |
| 3–4. Underwrite and check outputs | **Workspace** — Financials (purchase & financing, optimization list, operating expenses, taxes), Analysis (Low/Mid/High revenue, assumptions, scenario table), Deal tags; live Deal summary; autosave | `/underwritings/[id]`             |
| 5. Submit                         | **Review & submit** — checklist of missing/invalid fields with _Go to field_, key assumptions, numbers calculated by the API, confirmation dialog                                                     | `/underwritings/[id]?step=review` |
| 6. See the score                  | **Evaluation result** — score, plain-language explanation, band chart, leaderboard position, attempts on the property                                                                                 | `/submissions/[id]`               |

The underwriting chain from the brief — **Total Out of Pocket → Annual Free Cash Flow → Cash-on-Cash** — is the backbone of the layout: the property page introduces it, the workspace's Deal summary tracks it live, and the confirmation dialog repeats it before submitting.

---

## Key decisions

**Data comes only from the API.** Every number on screen is returned by the API or derived from it with a documented formula (e.g. price per sq ft). Responses pass through one mapping layer (`src/services/*`) that converts decimal strings (`"85.00"`) to numbers and snake_case to typed app models, so components never see raw API shapes.

**Percentages.** The API uses fractions (`0.20`), the form uses whole numbers (`20`). The conversion lives in one file: `src/lib/underwriting/form-mapper.ts`. Values are sent as decimal strings so `6.99%` arrives as exactly `0.0699`.

**Live numbers in the browser.** The API only calculates once _every_ required section is complete, so the workspace computes a live preview with pure functions written from the brief's Calculations tab (`src/lib/underwriting/calculations.ts`). They were checked against the backend calculator on the same inputs and match to the cent. The Review step also shows the API's own calculated numbers from the last save.

**Autosave that works with partial input.** The API rejects half-filled purchase, tax and revenue sections, so autosave (≈1 s after typing stops) sends only complete, valid sections plus line items and tags. Partial input is kept in a per-draft browser backup that records which server version it builds on, so it is never restored over newer server data. Saves run one at a time; leaving with unsaved changes shows a browser warning. Autosave and the backup stop as soon as submit starts.

**One validation source.** A single zod schema (`src/lib/underwriting/schema.ts`) drives inline errors, step badges, the "required inputs" counter, which sections can be saved, and the Review checklist — they cannot disagree.

**State in the URL.** Dashboard filters (`?status=&market=&q=`) and the workspace step (`?step=analysis`) live in the URL, so refresh, back and shared links keep the view.

**Fetching in the browser with React Query.** Keeps loading/error/retry states consistent and lets Playwright mock any API response with `page.route()`. After submitting, the response's submission and dashboard go straight into the cache, so the result page and dashboard update without extra requests.

**Scoring stats use one rule** — the latest attempt per property — for Completed cases, Average score and the score pill on each card.

**Inputs only show real values.** No number is ever used as placeholder text, so what a trainee sees in a field is exactly what is saved and calculated. On a new draft the taxes start at the brief's training defaults (20 / 25 / 60 / 37) and the co-hosting fee and appreciation at 0%, all as real values; everything else starts empty, with guidance (e.g. "Usually 20–25%") in the help text below the field.

**Submit requires a complete underwriting.** The Submit button stays disabled until the Review checklist is empty. As a result the brief's "no forecast at all → Low (40)" case can't happen through the UI, and it can't happen through the API either: submitting without a revenue forecast returns `422 Missing required sections: forecasted_revenue`. The Low band is covered instead by a Mid forecast more than 25% from the reference.

**Guards.** `GET /api/underwritings/{id}` also serves the analyst's reference underwritings; the workspace refuses to show them so the answer can't leak. Submitted drafts open read-only. An open draft is always resumed, so starting never creates a duplicate.

---

## Assumptions and limitations

- **Leaderboard:** the API has a single trainee and no leaderboard endpoint. Ranking is derived from `GET /api/submissions` (score first, then the closer forecast). A multi-user endpoint would only change the data source.
- **User profile** is static: the API has no users or authentication, so there is no sign-in or sign-out.
- **Listing photos** come from the seed data (`img_src` on picsum.photos), which are random stock photos rather than the actual houses.
- **"View listing"** links to the seed's Zillow URLs, which point to fictional properties.
- **Light mode only**, by design.

## Status

| Area                                                              | Status                                                            |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| Dashboard, property page, workspace, review & submit, result page | Done                                                              |
| Submissions list and Leaderboard pages                            | Next — currently placeholder pages                                |
| Playwright end-to-end suite                                       | Next — `npm run test:e2e` is wired up; the suite is being written |
| Video walkthrough                                                 | To do                                                             |

## Scripts (frontend)

```bash
npm run dev            # development server on :3000
npm run build          # production build (also type-checks)
npm run lint           # ESLint (Next.js + React hooks rules)
npm run test:e2e       # Playwright tests
npm run test:e2e:report
```
