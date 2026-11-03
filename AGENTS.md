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
| `src/api/endpoints.js` | **Only** place where API paths are declared (scanned by the harness integration reviewer) |
| `src/api/client.js` | fetch wrapper, error mapping (`ApiError`, FastAPI 422 → field errors) |
| `src/api/customerApi.js` | Typed calls per contract endpoint (snake_case ↔ camelCase mapping) |
| `src/auth/` | Token storage (sessionStorage), `AuthProvider`, `ProtectedRoute` |
| `src/pages/` | Register, Login, Customer Details pages |
| `src/components/` | Reusable presentational components |
| `src/utils/validation.js` | Client-side validation mirroring backend rules (UX only) |

## Rules
1. Never hard-code API paths outside `src/api/endpoints.js`.
2. Request/response field names must match the contract exactly (snake_case on the wire).
3. Never log or persist passwords; tokens live only in `sessionStorage`.
4. Every new screen / behaviour needs a test in `src/__tests__/`.
5. Forms must be accessible (labels, `aria-invalid`, `role="alert"` for errors).

## Commands
- Setup: `npm install`
- Test: `npm test`
- Build: `npm run build`
- Dev: `npm run dev` (proxies `/api` to `http://127.0.0.1:8000`)
