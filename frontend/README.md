# VetiCare Frontend

VetiCare is a responsive React application for pet health education, disease-prediction workflows, pet records, vaccination tracking, care guidance, and nearby-service discovery. It currently uses typed local mock data only; no backend, database, or external API is called.

## Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS and Lucide React
- React Router with route-level code splitting
- Local mock authentication persisted in `localStorage`

## Project structure

```text
src/
  components/     Shared UI, layout, animal, and auth components
  context/        Client-side auth state
  data/           Typed mock domain data
  pages/          Route-level screens
  services/       Replaceable mock service layer
```

## Installation and commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

The development server runs at `http://localhost:5173` by default.

## Mock authentication

Use any valid email and a password with at least eight characters to sign in. The session is stored locally under `veticare_mock_user`; it can be cleared using the Logout action.

## Future FastAPI integration

The UI consumes local services rather than calling pages directly. Replace `src/services/auth.ts` with a FastAPI JWT implementation and replace data/service modules (for example `dashboardService.ts`) with HTTP-backed versions. Route and component contracts can remain unchanged.

## Notes

Disease predictions and health recommendations are educational mock content, not veterinary diagnosis or medical advice.
