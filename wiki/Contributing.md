# Contributing

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests and linting
5. Commit and push
6. Open a Pull Request

## Development Setup

Follow the [Getting Started](Getting-Started) guide to set up your local environment.

## Code Standards

### Python (Backend)
- Python 3.11+
- Follow PEP 8
- Use type hints
- Format with Ruff (`ruff check .`)
- Run tests with pytest

### TypeScript/React (Frontend)
- Use TypeScript strict mode
- Follow existing component patterns
- Use Tailwind CSS classes (avoid inline styles)
- Run linter: `npm run lint`
- Build check: `npm run build`

## Pull Request Process

1. Ensure your code builds cleanly (`npm run build` for frontend, `pytest` for backend)
2. Update documentation if needed
3. Add tests for new functionality
4. Keep PRs focused on a single concern

## Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes
- `refactor/description` — Code refactoring

## Commit Messages

Use conventional commits:
- `feat: add vaccination reminder`
- `fix: correct 401 redirect loop`
- `docs: update API reference`
- `refactor: extract auth service`
