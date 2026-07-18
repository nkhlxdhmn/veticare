# API Reference

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8000` |
| Production | `https://veticare-backend.onrender.com` |

## Authentication

Most endpoints require a Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Endpoints

### System

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api/v1/status` | No | API status |
| GET | `/api/v1/status` | No | API status |

### Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/v1/auth/register` | No | Create account |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/token` | No | OAuth2 token |
| GET | `/api/v1/auth/me` | Yes | Current user |
| POST | `/api/v1/auth/resend-verification` | No | Resend verification email |

### Profile

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/v1/profile/{id}` | Yes | Get profile |
| PATCH | `/api/v1/profile/{id}` | Yes | Update profile |
| PUT | `/api/v1/profile/password` | Yes | Change password |

### Pets

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/v1/pets` | Yes | List pets |
| POST | `/api/v1/pets` | Yes | Create pet |
| GET | `/api/v1/pets/{id}` | Yes | Get pet |
| PATCH | `/api/v1/pets/{id}` | Yes | Update pet |
| DELETE | `/api/v1/pets/{id}` | Yes | Delete pet |

### Vaccinations

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/v1/vaccinations/pet/{id}` | Yes | List vaccinations |
| POST | `/api/v1/vaccinations` | Yes | Add vaccination |
| PATCH | `/api/v1/vaccinations/{id}` | Yes | Update vaccination |
| DELETE | `/api/v1/vaccinations/{id}` | Yes | Delete vaccination |

### Disease Prediction

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/v1/ml/species` | Yes | Supported species |
| GET | `/api/v1/ml/symptoms?species=Dog` | Yes | Species symptoms |
| POST | `/api/v1/prediction` | Yes | Run prediction |
| GET | `/api/v1/prediction/history` | Yes | Prediction history |

### Animals & Care

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/v1/animals` | Yes | List species |
| GET | `/api/v1/animals/{id}` | Yes | Species details |
| GET | `/api/v1/animals/{id}/diseases` | Yes | Species diseases |
| GET | `/api/v1/animals/{id}/care-guides` | Yes | Care guides |
| GET | `/api/v1/care-guides` | Yes | All care guides |

### Services

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/v1/nearby-services` | Yes | Nearby vets |
| POST | `/api/v1/contact` | No | Contact form |

## Response Format

### Success
```json
{
  "id": "uuid",
  "name": "Buddy",
  "species": "Dog"
}
```

### Error
```json
{
  "detail": "Error description"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "trace_id": "uuid-for-debugging"
}
```
