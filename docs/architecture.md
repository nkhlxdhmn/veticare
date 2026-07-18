# VetiCare Architecture

## Overview

VetiCare is a full-stack pet healthcare platform built with a **React** frontend and a **FastAPI** backend, connected via a **Supabase** PostgreSQL database. The platform integrates machine learning for disease prediction and a Large Language Model (LLM) for an AI-powered veterinary assistant.

---

## System Architecture Diagram

```mermaid
graph TB
    subgraph Client["Browser"]
        REACT["React SPA<br/>(Vite + TypeScript)"]
        RQ["TanStack Query<br/>(caching + state)"]
        RR["React Router v6<br/>(client-side routing)"]
    end

    subgraph Server["FastAPI Backend"]
        API["API Router<br/>(/api/v1)"]
        MW["Middleware Stack<br/>(CORS, RateLimit, Logging)"]
        AUTH["Auth Module<br/>(JWT + Supabase)"]
        ML["ML Engine<br/>(scikit-learn Pipeline)"]
        LLM["LLM Service<br/>(OpenAI-compatible)"]
        SERVICE["Service Layer<br/>(business logic)"]
    end

    subgraph Storage["Persistent Storage"]
        SUPABASE["Supabase<br/>(PostgreSQL + Auth)"]
        FS["Filesystem<br/>(model .joblib + dataset .csv)"]
    end

    subgraph External["External Services"]
        GMAPS["Google Maps API<br/>(Nearby Services)"]
        OAI["OpenAI / Ollama<br/>(LLM Provider)"]
    end

    REACT -->|HTTP / JSON| API
    RQ --> REACT
    RR --> REACT

    API --> MW
    MW --> AUTH
    MW --> SERVICE
    SERVICE --> ML
    SERVICE --> LLM

    AUTH --> SUPABASE
    SERVICE --> SUPABASE
    ML --> FS
    LLM --> OAI
    SERVICE ----> GMAPS
```

---

## Layer Architecture

```mermaid
graph LR
    subgraph Presentation["Presentation Layer"]
        Pages["Pages<br/>(24 route pages)"]
        Layout["Layout Components<br/>(Navbar, Footer)"]
        UI["UI Primitives<br/>(Button, Card, Badge)"]
        Motion["Animation Components<br/>(FadeIn, Stagger, HoverCard)"]
    end

    subgraph State["State & Context"]
        AuthCtx["AuthContext<br/>(user, session, login/logout)"]
        RQClient["TanStack Query<br/>(server state cache)"]
    end

    subgraph Services["Service Layer"]
        AuthSvc["authService<br/>(token mgmt, /auth/me)"]
        ApiClient["api.ts<br/>(fetch wrapper, 401 interceptor)"]
        Services["services.ts<br/>(pet, vaccination, prediction)"]
    end

    subgraph API["Backend API"]
        Router["Central Router<br/>(12 route modules)"]
        Deps["Dependencies<br/>(auth, supabase client)"]
    end

    subgraph Business["Business Logic"]
        ServicesB["Service Modules<br/>(auth, pet, prediction, ...)"]
        ML["ML Pipeline<br/>(Random Forest Classifier)"]
        LLM["LLM Service<br/>(prompt + completion)"]
    end

    subgraph DB["Database"]
        SB["Supabase<br/>(PostgreSQL)"]
    end

    Presentation --> State
    State --> Services
    Services --> API
    API --> Deps
    Deps --> Business
    Business --> DB
    ML --> Dataset["CSV Dataset<br/>(training data)"]
    LLM --> OpenAI["OpenAI / Ollama"]
```

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant Browser
    participant Vite as Vite Dev Server
    participant FastAPI as FastAPI Backend
    participant MW as Middleware Stack
    participant Router as API Router
    participant Deps as Dependencies
    participant Service as Service Layer
    participant Supabase as Supabase DB

    Browser->>Vite: HTTP Request
    Vite->>FastAPI: Proxy to /api/*
    FastAPI->>MW: RequestLogMiddleware
    MW->>MW: RateLimitMiddleware (check)
    MW->>MW: CORSMiddleware
    MW->>MW: TrustedHostMiddleware (prod)
    MW->>Router: Route matched
    Router->>Deps: get_current_user (JWT decode)
    Deps->>Supabase: SELECT profile by ID
    Supabase-->>Deps: profile data
    Deps-->>Router: CurrentUser injected
    Router->>Service: Business logic call
    Service->>Supabase: CRUD operation
    Supabase-->>Service: Result
    Service-->>Router: Response data
    Router-->>MW: JSONResponse
    MW-->>FastAPI: Logged response
    FastAPI-->>Vite: HTTP Response
    Vite-->>Browser: JSON
```

---

## Frontend Component Hierarchy

```mermaid
graph TB
    App["App.tsx<br/>(RouterProvider)"]
    Root["RootLayout<br/>(AuthProvider > AuthGate)"]
    Nav["Navbar<br/>(responsive, animated)"]
    Outlet["AnimatedOutlet<br/>(page transitions)"]
    Foot["Footer"]
    Toaster["Sonner Toaster"]

    subgraph Routes["Route Groups"]
        Public["Public Routes<br/>(Home, About, Contact, FAQ, ...)"]
        Guest["Guest Routes<br/>(Login, Register, ForgotPassword, ...)"]
        Protected["Protected Routes<br/>(Dashboard, Profile, Pets, ...)"]
    end

    subguard["GuestRoute<br/>(redirect if authenticated)"]
    protguard["ProtectedRoute<br/>(redirect if unauthenticated)"]

    App --> Root
    Root --> Nav
    Root --> Outlet
    Root --> Foot
    Root --> Toaster

    Outlet --> Public
    Outlet --> subguard
    Outlet --> protguard

    subguard --> Guest
    protguard --> Protected

    subgraph Shared["Reusable Components"]
        MotionC["Motion Components<br/>(FadeIn, Stagger, HoverCard)"]
        Skeleton["Skeleton<br/>(loading placeholders)"]
        ErrorBoundary["ErrorBoundary"]
        PageTransition["PageTransition<br/>(fade + slide)"]
    end

    Outlet --> Shared
```

---

## Backend Module Dependency Graph

```mermaid
graph LR
    subgraph Entry["Entry Point"]
        main["main.py<br/>(create_application)"]
    end

    subgraph Core["Core"]
        config["config.py<br/>(Settings via pydantic)"]
        database["database.py<br/>(Supabase client)"]
        logging["logging.py<br/>(Logfire + structlog)"]
        ml["ml_model.py<br/>(model loader + predictor)"]
        rate["rate_limit.py<br/>(in-memory rate limiter)"]
        supabase["supabase.py<br/>(client factory)"]
    end

    subgraph API["API Layer"]
        router["router.py<br/>(central APIRouter)"]
        deps["dependencies.py<br/>(get_current_user)"]
        routes["12 Route Modules<br/>(auth, pets, prediction, ...)"]
    end

    subgraph Schemas["Pydantic Schemas"]
        schemas["15 Schema Modules<br/>(request/response validation)"]
    end

    subgraph Services["Business Logic"]
        services["10 Service Modules<br/>(auth, pet, prediction, ...)"]
    end

    subgraph Utils["Utilities"]
        security["security.py<br/>(JWT + bcrypt)"]
    end

    main --> router
    main --> core
    router --> deps
    router --> routes
    routes --> schemas
    routes --> services
    services --> supabase
    deps --> security
    deps --> supabase
```

---

## Key Architectural Decisions

### 1. JWT + External Auth Provider

Authentication uses a dual-layer approach: **bcrypt password hashing** for local credential storage in Supabase, and **JWT tokens** (HS256, 30-minute expiry) for stateless API authorization. The `python-jose` library handles token creation and validation. This avoids session storage on the server and enables horizontal scaling.

### 2. Supabase as Database Backend

Supabase provides a PostgreSQL-compatible database with row-level security via the `service_role` key. The backend uses the Supabase Python client (`supabase-py`) for all CRUD operations. A Supabase migration script (`supabase_migration.sql`) defines the schema.

### 3. Scikit-learn Pipeline

The ML model is a `RandomForestClassifier` trained on a CSV dataset of animal-disease-symptom mappings. The model is serialized via `joblib` and loaded at application startup. Predictions run entirely in-process — no external ML service required.

### 4. LLM Integration

The AI Assistant feature uses a separate FastAPI service (`backend/app/`) with OpenAI-compatible API calls (configurable endpoint). The prompt builder constructs structured prompts from symptom input, and the LLM response is parsed into a JSON result with disease name, confidence, and severity.

### 5. Frontend State Architecture

Three state layers:
- **AuthContext**: React Context for authentication state (user, token, session restoration)
- **TanStack Query**: Server state cache for all API data (pets, vaccinations, predictions)
- **URL state**: React Router v6 for navigation state (route params, query strings)

### 6. Animation Infrastructure

All animations use only `transform` and `opacity` for GPU-accelerated performance. A custom `useReducedMotion` hook respects the user's `prefers-reduced-motion` setting. Durations are constrained to 180-300ms range.

---

## Data Flow: Disease Prediction

```mermaid
sequenceDiagram
    participant User
    participant React as React Frontend
    participant API as FastAPI Backend
    participant ML as ML Pipeline
    participant DB as Supabase DB

    User->>React: Select species + symptoms
    React->>React: Validate form
    React->>API: POST /api/v1/prediction
    Note over API: get_current_user dependency
    API->>ML: predict_disease(model, species, symptoms)
    ML->>ML: Random Forest inference
    ML-->>API: {disease, confidence, top_predictions}
    API->>DB: INSERT prediction_history
    DB-->>API: stored record
    API-->>React: PredictionResult
    React-->>User: Display disease + confidence
```

---

## Data Flow: AI Assistant

```mermaid
sequenceDiagram
    participant User
    participant React
    participant AI as AI Backend (port 8000)
    participant LLM as OpenAI / Ollama
    participant Knowledge as Knowledge Base

    User->>React: Describe symptoms
    React->>React: SymptomSelector component
    React->>AI: POST /assess (symptoms, species)
    AI->>AI: build_prompt(symptoms, species)
    AI->>LLM: GPT completion request
    LLM-->>AI: Structured JSON response
    AI->>Knowledge: get_emergency_info(species)
    AI-->>React: {diagnosis, emergency, disclaimer}
    React->>React: ResultDashboard display
    React-->>User: Diagnosis + confidence + severity
```

---

## Environment Separation

```mermaid
graph LR
    subgraph Dev["Development"]
        FE_DEV["Vite Dev :5173"]
        BE_DEV["FastAPI Dev :8000"]
        AI_DEV["AI Service :8001"]
    end

    subgraph Prod["Production"]
        FE_PROD["Vercel"]
        BE_PROD["Render"]
        AI_PROD["Render / Docker"]
    end

    subgraph Shared["Shared"]
        DB["Supabase (cloud)"]
        OAI["OpenAI API"]
        GM["Google Maps API"]
    end

    FE_DEV --> BE_DEV
    FE_DEV --> AI_DEV
    BE_DEV --> DB
    FE_PROD --> BE_PROD
    FE_PROD --> AI_PROD
    BE_PROD --> DB
    AI_DEV --> OAI
    AI_PROD --> OAI
    BE_PROD --> GM
```
