# Project Structure

```
veticare/
├── frontend/                          # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai-assistant/          # AI chat components
│   │   │   │   ├── AIAssistantHero.tsx
│   │   │   │   ├── AIAssistantSkeleton.tsx
│   │   │   │   ├── AssessmentForm.tsx
│   │   │   │   ├── ConfidenceBar.tsx
│   │   │   │   ├── ResultDashboard.tsx
│   │   │   │   ├── SeverityBadge.tsx
│   │   │   │   └── SymptomSelector.tsx
│   │   │   ├── animal/
│   │   │   │   └── AnimalComponents.tsx
│   │   │   ├── auth/
│   │   │   │   ├── AuthCard.tsx
│   │   │   │   └── RouteGuards.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Container.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   └── Section.tsx
│   │   │   ├── map/
│   │   │   │   ├── LocationSearch.tsx
│   │   │   │   └── MapView.tsx
│   │   │   └── ui/
│   │   │       ├── PageTransition.tsx
│   │   │       ├── ToggleSwitch.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── empty-state.tsx
│   │   │       ├── error-state.tsx
│   │   │       ├── input.tsx
│   │   │       ├── motion.tsx
│   │   │       ├── skeleton.tsx
│   │   │       └── table.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── data/
│   │   │   └── animals.ts
│   │   ├── hooks/
│   │   │   ├── use-mount-animation.ts
│   │   │   └── use-reduced-motion.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── AIVeterinaryAssistant.tsx
│   │   │   ├── About.tsx
│   │   │   ├── AnimalDetails.tsx
│   │   │   ├── Animals.tsx
│   │   │   ├── CareGuide.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DiseasePrediction.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── NearbyServices.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── PetDetails.tsx
│   │   │   ├── PetRecords.tsx
│   │   │   ├── Privacy.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Terms.tsx
│   │   │   ├── Vaccinations.tsx
│   │   │   ├── VerifyEmail.tsx
│   │   │   └── VerifyOTP.tsx
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   └── services.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── vercel.json
│
├── backend/                           # Main FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── animal.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── care_guide.py
│   │   │   │   ├── contact.py
│   │   │   │   ├── disease.py
│   │   │   │   ├── ml_model.py
│   │   │   │   ├── nearby_services.py
│   │   │   │   ├── pet.py
│   │   │   │   ├── prediction.py
│   │   │   │   ├── profile.py
│   │   │   │   └── vaccination.py
│   │   │   ├── dependencies.py
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── http.py
│   │   │   ├── logging.py
│   │   │   ├── ml_model.py
│   │   │   ├── rate_limit.py
│   │   │   └── supabase.py
│   │   ├── models/
│   │   │   └── domain.py
│   │   ├── schemas/
│   │   │   ├── animal.py
│   │   │   ├── auth.py
│   │   │   ├── care_guide.py
│   │   │   ├── common.py
│   │   │   ├── contact.py
│   │   │   ├── disease.py
│   │   │   ├── ml_model.py
│   │   │   ├── nearby.py
│   │   │   ├── pet.py
│   │   │   ├── prediction.py
│   │   │   ├── profile.py
│   │   │   └── vaccination.py
│   │   ├── services/
│   │   │   ├── animal.py
│   │   │   ├── auth.py
│   │   │   ├── care_guide.py
│   │   │   ├── disease.py
│   │   │   ├── ml_model.py
│   │   │   ├── nearby_services.py
│   │   │   ├── pet.py
│   │   │   ├── prediction.py
│   │   │   ├── profile.py
│   │   │   └── vaccination.py
│   │   ├── utils/
│   │   │   └── security.py
│   │   └── main.py
│   ├── dataset/
│   │   ├── Animal_Disease_dataset.csv
│   │   └── Random1.joblib
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_pet.py
│   │   ├── test_prediction.py
│   │   └── test_read.py
│   ├── supabase_migration.sql
│   ├── alembic.ini
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── start.sh
│   └── render.yaml
│
├── backend/ (root)                    # AI Assistant service
│   ├── app/
│   │   ├── api/routes/ai_assistant.py
│   │   ├── schemas/schemas.py
│   │   ├── services/
│   │   │   ├── emergency_service.py
│   │   │   ├── knowledge_service.py
│   │   │   ├── llm_service.py
│   │   │   └── prompt_builder.py
│   │   ├── data/diseases.json
│   │   └── main.py
│   └── scripts/
│
├── dataset/                           # ML training resources
│   ├── Animal_Disease_dataset.csv
│   ├── Animal_Disease_prediction.ipynb
│   └── Random1.joblib
│
├── docs/                              # Project documentation
├── wiki/                              # GitHub wiki pages
├── screenshots/                       # App screenshots
├── docker-compose.yml
├── Dockerfile
├── README.md
└── generate_pdf.py
```
