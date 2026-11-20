# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep React rendering and interaction in the frontend; use the shared API client for all server requests, and expose loading, empty, and error states accessibly.
- Logic tier decision: Keep validation and application behavior in Express routes/services. Validate request data and referenced records, return deliberate 4xx responses for invalid or missing resources, and avoid leaking Mongoose cast errors as 500s.
- Data tier decision: Keep persistence rules and relationships in Mongoose models. Require the contract fields, use references for users, teams, and activities, and avoid defaults that make missing required input appear valid.
- Activity tracking approach: Validate `userId` and `teamId` as well-formed IDs for existing records, validate activity input, and persist the resolved user/team, submitted type and minutes, computed points, and occurrence time.
- Team management approach: Create and list teams while preserving their name and mascot and resolving member references; reject a missing name with `400`.
- Leaderboard approach: Sum activity points by team, sort by total points descending, and return each team name, total, and 1-based rank.
- Workout suggestions approach: Find the user by email and base recommendations on that user's goal and recent activity patterns. Make the first suggestion relevant and include a reason; return a deliberate 4xx when no user matches.

## Test plan

Baseline run before implementation:

- `npm ci --prefix octofit-tracker/backend` and `npm ci --prefix octofit-tracker/frontend` completed.
- `npm test --prefix octofit-tracker/backend`: 8 failed and 1 passed. Failures cover required model validation, invalid activity/team input responses, leaderboard results, and activity-matched workout suggestions.
- `npm test --prefix octofit-tracker/frontend`: 15 failed. Failures cover expected activity/team content, user-specific workout requests, and accessible loading, empty, and error states.

Run focused tests in dependency order; a failure points to a contract or behavior in that tier:

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — model field requirements, types, or relationships are incorrect.
- API command: `npm run test:api --prefix octofit-tracker/backend` — endpoint validation, status codes, response shape, or business behavior is incorrect.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — API integration, rendered content, or accessible async/empty/error states are incorrect.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — backend TypeScript compilation or build configuration is incorrect.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — frontend compilation or bundling is incorrect.
