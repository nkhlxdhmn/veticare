# VetiCare Deployment Checklist

This document is a comprehensive pre-flight checklist for deploying the VetiCare stack to a production environment.

## 1. Infrastructure & Environment
- [ ] **Database Setup:** Provision a managed PostgreSQL instance (e.g., AWS RDS, Supabase) or configure a persistent volume if self-hosting via Docker.
- [ ] **Environment Variables:** Verify `.env` file on the production server contains:
  - `ENVIRONMENT=production`
  - Strong, securely generated `SECRET_KEY`
  - Valid `DATABASE_URL`
  - `CORS_ORIGINS` strictly limited to the actual production frontend domain (e.g., `["https://app.veticare.com"]`)
- [ ] **SSL/TLS Certificate:** Ensure Nginx or your load balancer is configured with a valid SSL certificate (e.g., Let's Encrypt).

## 2. Backend (FastAPI) Verification
- [ ] **Migrations:** Ensure all database migrations have been applied: `alembic upgrade head`.
- [ ] **Performance (Gunicorn/Uvicorn):** Deploy the backend using a process manager like Gunicorn with Uvicorn workers (e.g., `gunicorn -k uvicorn.workers.UvicornWorker -c gunicorn_conf.py app.main:app`) instead of raw Uvicorn.
- [ ] **Security Headers:** Verify the `SecurityHeadersMiddleware` is active and passing strict `Content-Security-Policy` and `Strict-Transport-Security` headers.
- [ ] **Logging:** Configure centralized logging. Ensure sensitive data (passwords, tokens) are stripped from logs.

## 3. Frontend (React/Vite) Verification
- [ ] **Environment Variables:** Ensure `VITE_API_URL` points to the production backend URL during the build step.
- [ ] **Build:** Run `npm run build` and ensure no TypeScript errors or missing imports occur.
- [ ] **Static Serving:** Ensure Nginx is configured to serve the built static files and properly handle SPA routing (fallback to `index.html` for 404s).
- [ ] **Asset Caching:** Verify Nginx adds appropriate `Cache-Control` headers for static assets (`.js`, `.css`, images).

## 4. Security & Access
- [ ] **Database Access:** Restrict database port (5432) access strictly to the backend server/container.
- [ ] **Rate Limiting:** Ensure the backend rate limiter is active and properly scaled for expected traffic.
- [ ] **Backups:** Configure automated daily backups for the PostgreSQL database.

## 5. Post-Deployment Smoke Test
- [ ] Register a test account.
- [ ] Add a pet profile.
- [ ] Book an appointment.
- [ ] Check console for unexpected warnings or errors.
- [ ] Monitor server memory usage during prediction requests (AI module).
