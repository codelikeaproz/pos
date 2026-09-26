# University HomeStay POS

Windows desktop POS modernization.

## Layout

| Path | Role |
|---|---|
| `frontend/` | Electron + React + TypeScript + Vite |
| `backend/` | Laravel 12 API |
| `POS Memory/` | Obsidian project docs |

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env` if needed. API base URL:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The Dashboard **Backend Status** panel calls `GET /api/health` over HTTP.

During development the renderer uses the Vite HTTP origin. Packaged builds use the registered secure `pos://app` origin so Laravel API requests work without allowing broad `file://` / `null` origins.

## Backend

```powershell
cd backend
composer install
php artisan serve
```

Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

Local database: MariaDB/MySQL database `pos_homestay` (credentials in `backend/.env`, not committed).

## Communication

- **HTTP** — React → Laravel 12 API → MySQL (application data)
- **IPC** — React → Electron Main → hardware (desktop/native; separate)

## Stack notes

- Backend is **Laravel 12** (locked). Do not use Laravel 13 for this project.
- Authentication and POS domain APIs beyond login are not fully implemented yet (later phases).
- Development login users (local only): `admin@example.com` / `password`, `operator@example.com` / `password`.
