# VetiCare Authentication Flow

## Overview

VetiCare implements a **stateless JWT authentication** system. The backend issues signed tokens on login/registration, and the frontend validates sessions on every application startup by calling `/auth/me`. The backend is the **single source of truth** for authentication state.

---

## Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant User as User
    participant Browser as Browser
    participant FE as React Frontend
    participant BE as FastAPI Backend
    participant DB as Supabase DB

    Note over User,DB: Registration
    User->>FE: Fill registration form
    FE->>BE: POST /api/v1/auth/register
    BE->>BE: Validate email (unique check)
    BE->>BE: Hash password (bcrypt)
    BE->>DB: INSERT into profiles
    BE->>BE: Create access_token (HS256, 30min)
    BE-->>FE: { access_token }
    FE->>FE: Store token in localStorage
    FE->>BE: GET /api/v1/auth/me
    BE-->>FE: ProfileResponse
    FE->>FE: Cache user in localStorage
    FE-->>User: Redirect to Dashboard

    Note over User,DB: Login
    User->>FE: Enter email + password
    FE->>BE: POST /api/v1/auth/login
    BE->>BE: verify_password (bcrypt)
    BE->>BE: Create access_token
    BE-->>FE: { access_token }
    FE->>FE: Store token in localStorage
    FE->>BE: GET /api/v1/auth/me
    BE-->>FE: ProfileResponse
    FE->>FE: Cache user in localStorage
    FE-->>User: Redirect to Dashboard

    Note over User,DB: Session Restore (page refresh)
    User->>Browser: Refresh / Cmd+R
    FE->>FE: Check localStorage for veticare_token
    alt Token Exists
        FE->>FE: Set loading=true, show spinner
        FE->>BE: GET /api/v1/auth/me
        alt Valid (200)
            BE-->>FE: ProfileResponse
            FE->>FE: Update user state, loading=false
            FE->>FE: Render protected UI
        else Expired/Invalid (401)
            BE-->>FE: 401 Unauthorized
            FE->>FE: clearSession()
            FE->>FE: Show toast "session expired"
            FE->>FE: Redirect to /login
        end
    else No Token
        FE->>FE: Set user=null, loading=false
        FE->>FE: Show login page
    end
```

---

## Token Lifecycle

```mermaid
graph LR
    subgraph Creation["Token Creation"]
        Login["Login / Register"] --> JWT["jose.jwt.encode()"]
        JWT --> Payload["{sub: profile_id, exp: now+30m, iat: now}"]
        Payload --> Secret["Signed with JWT_SECRET_KEY (HS256)"]
    end

    subgraph Storage["Client Storage"]
        Token["JWT String"] --> LS["localStorage: veticare_token<br/>{access_token: '...'}"]
    end

    subgraph Validation["Server Validation"]
        Req["Request with Bearer token"] --> Decode["jose.jwt.decode()"]
        Decode --> CheckExp["Check exp claim"]
        CheckExp --> Lookup["SELECT profile FROM Supabase"]
        Lookup --> Active["Check is_active flag"]
    end

    subgraph Expiry["Expiry Handling"]
        Expired["401 Response"] --> FE["Frontend detects 401"]
        FE --> Clear["clearSession()"]
        Clear --> Toast["Toast: 'session expired'"]
        Toast --> Redirect["Redirect /login"]
    end

    Creation --> Storage
    Storage --> Validation
    Validation -->|expired| Expiry
```

---

## Frontend Auth Implementation

### AuthContext (`src/context/AuthContext.tsx`)

The `AuthProvider` component:

1. **Initialization**: Checks `localStorage` for `veticare_token`. If present, sets `loading=true` and calls `restoreSession()`.
2. **Session Validation**: Calls `GET /api/v1/auth/me`. On success, populates user state. On 401, clears everything and redirects.
3. **401 Interceptor**: Registers a global handler with `api.ts` via `setOnUnauthorized()`. Any API 401 response triggers session cleanup, toast, and redirect.
4. **Exposed API**: `user`, `loading`, `isAuthenticated`, `login()`, `register()`, `logout()`, `restoreSession()`, `refreshUser()`

### Route Protection

```mermaid
graph TD
    App["App Startup"] --> CheckToken{Token in localStorage?}
    CheckToken -->|Yes| Loading["loading=true<br/>Full-screen spinner"]
    Loading --> Validate["GET /auth/me"]
    Validate -->|200| Authd["isAuthenticated=true<br/>Render protected pages"]
    Validate -->|401| NotAuth["isAuthenticated=false<br/>Redirect /login"]
    CheckToken -->|No| NotAuth
```

### Global 401 Interceptor

In `src/lib/api.ts`:

```typescript
// Registered on every API call
if (res.status === 401) onUnauthorized?.();

// AuthContext registers its handler:
setOnUnauthorized(() => {
  authService.clearSession();
  setUser(null);
  toast.error("Your session has expired. Please sign in again.");
  navigate("/login");
});
```

---

## Backend Auth Implementation

### Password Hashing

Uses **bcrypt** via the `passlib` library:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)
```

### JWT Tokens

Created and validated with `python-jose`:

```python
# Creation
def create_access_token(subject: str) -> str:
    expires = datetime.now(UTC) + timedelta(minutes=30)
    return jwt.encode(
        {"sub": subject, "exp": expires, "iat": datetime.now(UTC)},
        settings.jwt_secret_key,
        algorithm="HS256",
    )

# Validation
def decode_access_token(token: str) -> str:
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
    return payload["sub"]  # profile_id
```

### Session Validation Dependency

```python
def get_current_user(token: Annotated[str, Depends(oauth2_scheme)],
                     supabase: SupabaseClient) -> dict:
    profile_id = decode_access_token(token)
    result = supabase.table("profiles").select("*")\
        .eq("id", profile_id).execute()
    if not result.data or not result.data[0].get("is_active"):
        raise HTTPException(status_code=401)
    return result.data[0]
```

---

## Security Considerations

- **Passwords** are never stored in plain text; bcrypt hashing with salt
- **JWT Secret**: Must be changed from default in production (validated at startup via `model_validator`)
- **Token Expiry**: 30-minute short-lived tokens; no refresh tokens in current implementation
- **localStorage**: Token stored in `localStorage` (XSS-vulnerable). Backend validates every request.
- **Session Validation**: Every app startup calls `/auth/me` — the backend is the source of truth
- **No automatic retry**: 401 clears state immediately to prevent infinite loops
