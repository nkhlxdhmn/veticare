# VetiCare Frontend

VetiCare is a responsive React application for pet health education, disease-prediction workflows, pet records, vaccination tracking, care guidance, and nearby-service discovery. It communicates with a FastAPI backend connected to Supabase (PostgreSQL).

## Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS and Lucide React
- React Router with route-level code splitting
- TanStack Query for server state management
- Leaflet + OpenStreetMap for maps

## Project structure

```text
src/
  components/     Shared UI, layout, animal, and auth components
  context/        Auth state management (AuthContext)
  hooks/          Custom React hooks (useReducedMotion, etc.)
  lib/            API client (api.ts with 401 auto-refresh), utils, constants
  pages/          Route-level screens (24+ pages, lazy-loaded)
  services/       API service modules (auth.ts, services.ts)
```

## Installation and commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

The development server runs at `http://localhost:5173` by default.

## Authentication

- Real JWT-based auth with a FastAPI backend
- Access tokens (30-min) + refresh tokens (7-day) stored in localStorage
- Automatic token refresh on 401 responses
- Email OTP verification required after registration
- Password reset via email link
- Session restored on app startup

## Configuration

Copy `frontend/.env.example` to `frontend/.env` and set:
- `VITE_API_URL` — Backend API base URL (default `http://localhost:8000`)
- `VITE_AI_API_URL` — AI Assistant backend URL (default `http://localhost:8000`)

## Notes

Disease predictions and health recommendations are not veterinary diagnosis or medical advice.
