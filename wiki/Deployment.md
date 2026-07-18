# Deployment

## Architecture

| Component | Provider | URL |
|-----------|----------|-----|
| Frontend | Vercel | `https://veticare-seven.vercel.app` |
| Backend | Render | `https://veticare-backend.onrender.com` |
| Database | Supabase | Project-specific URL |
| AI Service | Render / Docker | Configurable |

## Frontend (Vercel)

Configuration in `veticare/frontend/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Environment variables:
- `VITE_API_URL`: Backend URL
- `VITE_AI_API_URL`: AI service URL

## Backend (Render)

Start script in `veticare/backend/start.sh`:

```bash
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment variables:
- `VETICARE_SUPABASE_URL`
- `VETICARE_SUPABASE_KEY`
- `JWT_SECRET_KEY` (required in production)
- `ENVIRONMENT=production`
- `DEBUG=false`

## Docker

```bash
docker-compose up --build
```

## Database Migration

Run `veticare/backend/supabase_migration.sql` in the Supabase SQL editor.

## Production Checklist

- [ ] Change JWT_SECRET_KEY to a secure random value
- [ ] Set ENVIRONMENT=production
- [ ] Set DEBUG=false
- [ ] Verify CORS_ORIGINS includes Vercel URL
- [ ] Run database migrations
- [ ] Verify ML model file (Random1.joblib) is deployed
