# Getting Started

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm or yarn
- A Supabase account (free tier at [supabase.com](https://supabase.com))

## Quick Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/veticare.git
cd veticare/veticare
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your Supabase credentials
#   VETICARE_SUPABASE_URL=https://your-project.supabase.co
#   VETICARE_SUPABASE_KEY=your-service-role-key

# Run database migration
# Open supabase_migration.sql in Supabase SQL editor and execute

# Start the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000
# VITE_AI_API_URL=http://localhost:8000

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Verify Installation

1. Open `http://localhost:5173` — you should see the landing page
2. Open `http://localhost:8000/docs` — you should see the Swagger UI
3. Register a new account via the frontend
4. Create a pet profile
5. Run a disease prediction

## Common Issues

See [Troubleshooting](Troubleshooting) for solutions to common problems.
