# Welcome to the VetiCare Wiki

VetiCare is a full-stack, production-grade pet healthcare platform combining **machine learning disease prediction**, an **LLM-powered AI veterinary assistant**, **vaccination tracking**, and a **veterinary services locator**.

## Quick Links

| Page | Description |
|------|-------------|
| [Getting Started](Getting-Started) | Setup and installation guide |
| [Architecture](Architecture) | System architecture overview |
| [Database](Database) | Schema, tables, and relationships |
| [Authentication](Authentication) | JWT auth flow and session management |
| [API Reference](API) | All API endpoints with examples |
| [Frontend](Frontend) | React component architecture and routing |
| [Backend](Backend) | FastAPI module structure and middleware |
| [Deployment](Deployment) | Production deployment guide |
| [Troubleshooting](Troubleshooting) | Common issues and solutions |
| [FAQ](FAQ) | Frequently asked questions |
| [Contributing](Contributing) | How to contribute |
| [Developer Guide](Developer-Guide) | Development workflow |
| [Project Structure](Project-Structure) | Folder layout and module responsibilities |
| [Future Roadmap](Future-Roadmap) | Planned features and improvements |

## Source Code

- **Frontend**: `veticare/frontend/` — React + TypeScript + Vite
- **Backend**: `veticare/backend/` — FastAPI + Python 3.11+
- **AI Assistant**: `backend/` — Separate LLM service
- **ML Dataset**: `dataset/` — Training data and Jupyter notebook

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4 |
| Backend | FastAPI 0.115, Python 3.11 |
| Database | Supabase (PostgreSQL) |
| ML | scikit-learn 1.5, pandas 2.0, joblib 1.4 |
| AI | OpenAI-compatible API (OpenAI / Ollama) |
| Auth | JWT (HS256) + bcrypt |
| Maps | Leaflet + Google Maps Places API |
