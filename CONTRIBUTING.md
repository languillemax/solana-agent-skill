# Contributing to Solana Agent Skill Toolkit

## Quick Start
```bash
npm install
npm test
npx tsc --noEmit
```

## Adding New Skills/Modules
1. Define the Zod schema in `src/tools.ts`.
2. Implement safety limits in `validateRiskLimits`.
3. Add tests in `tests/` (include at least 1 happy path and 1 negative security test).
