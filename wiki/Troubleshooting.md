# Troubleshooting

## Backend Issues

### "Missing required environment variables"

**Cause**: `VETICARE_SUPABASE_URL` or `VETICARE_SUPABASE_KEY` not set.

**Solution**: Create `backend/.env` from `.env.example` and fill in your Supabase credentials.

### "Supabase connection failed"

**Cause**: Invalid Supabase URL or key.

**Solution**: Verify your Supabase project is active and the `service_role` key is correct.

### "ML model not found"

**Cause**: `dataset/Random1.joblib` is missing.

**Solution**: Ensure the trained model file exists at `veticare/backend/dataset/Random1.joblib`. If missing, re-run the training notebook.

### Port already in use

**Solution**: Kill the existing process or use a different port:
```bash
uvicorn app.main:app --reload --port 8001
```

## Frontend Issues

### "Module not found" errors

**Solution**:
```bash
cd frontend && npm install
```

### CORS errors in browser

**Solution**: Ensure `VITE_API_URL` in `frontend/.env` matches the backend URL, and the backend's `CORS_ORIGINS` includes the frontend URL.

### Auth not persisting after refresh

**Cause**: Expired token or backend unreachable.

**Solution**: Check the browser's Application tab → Local Storage for `veticare_token`. Verify the backend is running. The app should automatically redirect to login with a "session expired" toast.

## Database Issues

### Migration fails

**Solution**: Run `supabase_migration.sql` statements individually in the Supabase SQL editor to identify the failing statement.

### Foreign key violations

**Cause**: Deleting a pet that has vaccination records.

**Solution**: Delete vaccination records first, then delete the pet.

## Build Issues

### TypeScript compilation errors

```bash
cd frontend && npx tsc --noEmit
```
Fix reported type errors before building.

### Vite build fails

```bash
cd frontend && npm run build
```
Check for syntax errors or missing imports in the console output.
