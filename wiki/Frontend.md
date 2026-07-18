# Frontend

## Technology Stack

- **React 18.3** with TypeScript 5.5
- **Vite 5.4** for build tooling and dev server
- **React Router v6** for client-side routing
- **TanStack Query 5** for server state management
- **Tailwind CSS 3.4** for utility-first styling
- **Lucide React** for icons
- **Leaflet** + **React Leaflet** for maps
- **Sonner** for toast notifications

## Folder Structure

```
src/
├── components/
│   ├── ai-assistant/   # AI chat UI (7 components)
│   ├── animal/         # Animal reference display
│   ├── auth/           # AuthCard, RouteGuards
│   ├── layout/         # Navbar, Footer, Section, Container
│   ├── map/            # LocationSearch, MapView
│   └── ui/             # Primitives (13 components)
├── context/
│   └── AuthContext.tsx  # Auth state management
├── hooks/              # Custom hooks (2)
├── lib/                # Utilities (3 files)
├── pages/              # Route pages (24 files)
├── services/           # API service functions (2 files)
├── App.tsx             # Root with routing
├── main.tsx            # Entry point
└── index.css           # Global styles + animations
```

## Routing

All 24 page components use `React.lazy()` for code splitting. Routes are organized into three groups:

- **Public**: Home, About, Privacy, Terms, Contact, FAQ
- **Guest** (redirect if authenticated): Login, Register, ForgotPassword, ResetPassword, VerifyEmail, VerifyOTP
- **Protected** (redirect if unauthenticated): Dashboard, Profile, Settings, Animals, AnimalDetails, Predictions, Pets, PetDetails, Vaccinations, CareGuide, NearbyServices, AIAssistant

## State Management

Three layers:
1. **AuthContext** (React Context): Authentication state
2. **TanStack Query**: Server data cache
3. **React Router**: URL/route state

## Key Components

- **Navbar**: Responsive, animated mobile menu (slide from right), active link underlines, logo hover effect, user avatar
- **AuthGate**: Full-screen loading spinner during session validation
- **PageTransition**: Fade + slide animation on route changes
- **motion.tsx**: Reusable animation components (FadeIn, Stagger, HoverCard, HoverButton, SuccessCheckmark)
- **EmptyState / ErrorState**: Consistent empty and error UIs
- **Skeleton**: Loading placeholders

See `veticare/frontend/src/components/` for all component implementations.
