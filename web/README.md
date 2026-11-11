# Customer Portal – Frontend (React)

UI for **Customer Registration**, **Login** and **View Customer Details**. Business logic lives in `../backend`.

## Run
```bash
npm install
npm run dev     # http://localhost:5173 (proxies /api → http://127.0.0.1:8000)
npm test
npm run build
```

## Screens
| Route | Page | Backend endpoint |
|-------|------|------------------|
| `/register` | Registration form with client-side validation | `POST /api/customers/register` |
| `/login` | Login form; stores bearer token in `sessionStorage` | `POST /api/auth/login` |
| `/customer` | Protected customer details view | `GET /api/customers/me` |

Configure via `.env.local` (see `.env.example`).
