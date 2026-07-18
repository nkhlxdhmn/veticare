# VetiCare Project Flow

## User Journey

```mermaid
graph LR
    Land["Landing Page"] -->|CTA: Start Prediction| Auth{Authenticated?}
    Land -->|Browse| About["About Page"]
    Land -->|Browse| FAQ["FAQ"]
    Land -->|Browse| Contact["Contact Form"]
    
    Auth -->|No| Login["Login / Register"]
    Auth -->|Yes| Dash["Dashboard"]
    
    Login -->|Success| Dash
    
    Dash --> Pets["Manage Pets"]
    Dash --> Vacc["Vaccinations"]
    Dash --> Pred["Disease Prediction"]
    Dash --> AI["AI Assistant"]
    Dash --> Nearby["Nearby Services"]
    
    Pets --> AddPet["Add Pet"]
    Pets --> EditPet["Edit Pet"]
    Pets --> DelPet["Delete Pet"]
    
    Pred --> SelectSpecies["Select Species"]
    SelectSpecies --> EnterSymptoms["Enter Symptoms"]
    EnterSymptoms --> RunPred["Run ML Prediction"]
    RunPred --> Results["View Results"]
    Results --> History["Prediction History"]
    
    AI --> DescSymptoms["Describe Symptoms"]
    DescSymptoms --> AIResult["LLM Assessment"]
    AIResult --> Severity["Severity + Confidence"]
    AIResult --> Emergency["Emergency Alerts"]
    
    Vacc --> AddVacc["Add Vaccination"]
    Vacc --> TrackVacc["Track Schedule"]
    
    Nearby --> SearchMap["Search on Map"]
    SearchMap --> Clinics["Find Vets & Clinics"]
```

---

## Application Startup Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant React
    participant AuthCtx as AuthContext
    participant API as Backend API
    participant DB as Supabase

    User->>Browser: Enter URL
    Browser->>React: Load index.html
    React->>React: Initialize React app
    
    Note over React: Vite serves JS bundles
    
    React->>AuthCtx: Mount AuthProvider
    
    AuthCtx->>AuthCtx: Check localStorage for veticare_token
    
    alt Token Exists
        AuthCtx->>AuthCtx: Set loading = true
        AuthCtx->>AuthCtx: Show full-screen spinner (AuthGate)
        AuthCtx->>API: GET /api/v1/auth/me
        
        alt 200 OK (valid session)
            API->>DB: SELECT profile
            DB-->>API: Profile data
            API-->>AuthCtx: ProfileResponse
            AuthCtx->>AuthCtx: Set user, loading = false
            AuthCtx->>React: Render authenticated UI
            React->>React: TanStack Query fetches page data
            
        else 401 (expired/invalid)
            API-->>AuthCtx: 401 Unauthorized
            AuthCtx->>AuthCtx: clearSession()
            AuthCtx->>AuthCtx: toast("session expired")
            AuthCtx->>AuthCtx: Redirect /login
            AuthCtx->>AuthCtx: Set loading = false
        end
        
    else No Token
        AuthCtx->>AuthCtx: Set user = null, loading = false
        React->>React: Render public UI (Home / Login)
    end
```

---

## Disease Prediction Flow

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend
    participant API as FastAPI
    participant ML as ML Pipeline
    participant DB as Supabase

    User->>FE: Navigate to /predictions
    
    FE->>API: GET /api/v1/ml/species
    API-->>FE: ["Dog", "Cat", "Horse", ...]
    
    User->>FE: Select species (e.g. "Dog")
    FE->>API: GET /api/v1/ml/symptoms?species=Dog
    API-->>FE: ["Fever", "Cough", "Lethargy", ...]
    
    User->>FE: Select up to 5 symptoms
    User->>FE: Click "Predict"
    
    FE->>API: POST /api/v1/prediction
    Note over API: get_current_user dependency
    
    API->>ML: predict_disease(model, "Dog", ["Fever", "Cough"])
    
    ML->>ML: Create DataFrame with 5 symptom columns
    ML->>ML: model.predict(df) → disease name
    ML->>ML: model.predict_proba(df) → confidence scores
    ML-->>API: {disease, confidence, top_predictions}
    
    API->>DB: INSERT prediction_history
    DB-->>API: Stored record
    
    API-->>FE: PredictionResult
    
    FE->>FE: Display results with confidence bar
    FE-->>User: View disease prediction
    
    User->>FE: Navigate to history
    FE->>API: GET /api/v1/prediction/history
    API-->>FE: Past predictions list
```

---

## AI Assistant Flow

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend
    participant AI as AI Backend
    participant LLM as OpenAI / Ollama
    participant KB as Knowledge Base

    User->>FE: Navigate to /ai-assistant
    FE->>FE: Display SymptomSelector
    
    User->>FE: Select species + symptoms
    User->>FE: Click "Assess"
    
    FE->>FE: Show loading skeleton
    FE->>AI: POST /assess (symptoms, species)
    
    AI->>AI: build_prompt(symptoms, species)
    Note over AI: Structured prompt with context
    
    AI->>LLM: Chat completion request
    LLM-->>AI: Structured JSON response
    
    AI->>KB: get_emergency_info(species)
    KB-->>AI: Emergency contacts + info
    
    AI-->>FE: {diagnosis, confidence, severity, emergency_info}
    
    FE->>FE: Parse response
    FE->>FE: Render ResultDashboard
    FE-->>User: Display diagnosis
    FE-->>User: Show severity badge
    FE-->>User: Show confidence bar
    FE-->>User: Emergency alert (if critical)
    FE-->>User: Disclaimer message
```

---

## Project Build Flow

```mermaid
graph TD
    subgraph Frontend["Frontend Build"]
        TS["TypeScript (.tsx/.ts)"] -->|tsc -b| JS["Compiled JS"]
        TSX["JSX Templates"] -->|Vite| JS
        CSS["Tailwind CSS"] -->|PostCSS| CSS_O["Compiled CSS"]
        Assets["Static Assets (images, icons)"] -->|Vite| Dist
        JS -->|Vite Bundling| Dist["dist/ (static files)"]
        CSS_O --> Dist
    end

    subgraph Backend["Backend Build"]
        PY["Python 3.11+ (.py)"] -->|No compilation needed| PyDist["FastAPI Application"]
        ML["ML Model (.joblib)"] -->|joblib| PyDist
        Data["Dataset (.csv)"] -->|Loaded at runtime| PyDist
    end

    subgraph Deploy["Deployment"]
        Dist -->|Vercel| CDN["Global CDN"]
        PyDist -->|Render| Server["Production Server"]
        Server --> DB["Supabase"]
    end
```

---

## Project Life Cycle

### Development Cycle

```mermaid
gitGraph
    commit id: "initial"
    branch feature/auth
    commit id: "jwt auth"
    commit id: "register/login"
    checkout main
    merge feature/auth
    
    branch feature/ml
    commit id: "model training"
    commit id: "prediction endpoint"
    checkout main
    merge feature/ml
    
    branch feature/ai
    commit id: "ai assistant"
    commit id: "prompt builder"
    checkout main
    merge feature/ai
    
    branch feature/frontend
    commit id: "react setup"
    commit id: "pages and routing"
    commit id: "auth flow"
    commit id: "ui polish"
    checkout main
    merge feature/frontend
    
    commit tag: "v1.0.0"
```
