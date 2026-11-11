# Frontend repository – agent instructions

You are the **frontend repository agent**. This repo owns **UI logic only** (pages, forms, client-side
validation, routing, session handling). It is a **consumer** of the `customer-api` contract
(`../../contracts/customer-api.contract.json`). Business rules are enforced by the backend.

## Stack
- React 18 + Vite 5, React Router 6
- Tests: Vitest + Testing Library (jsdom)

## Layout
| Path | Responsibility |
|------|----------------|
| `web/src` | **Only** place where API paths are declared (scanned by the harness integration reviewer) |
| `web/src` | fetch wrapper, error mapping (`ApiError`, FastAPI 422 → field errors) |
| `web/src` | Typed calls per contract endpoint (snake_case ↔ camelCase mapping) |
| `web/src` | Token storage (sessionStorage), `AuthProvider`, `ProtectedRoute` |
| `web/src` | Register, Login, Customer Details pages |
| `web/src` | Reusable presentational components |
| `web/src` | Client-side validation mirroring backend rules (UX only) |

## Rules
1. Never hard-code API paths outside `web/src`.
2. Request/response field names must match the contract exactly (snake_case on the wire).
3. Never log or persist passwords; tokens live only in `sessionStorage`.
4. Every new screen / behaviour needs a test in `web/src`.
5. Forms must be accessible (labels, `aria-invalid`, `role="alert"` for errors).

## Commands
- Setup: `npm install`
- Test: `npm test`
- Build: `npm run build`
- Dev: `npm run dev` (proxies `/api` to `http://127.0.0.1:8000`)
