# Branch Rules & CI Pipeline

## Main Branch

- Direct pushes disabled
- Pull Requests required
- 1 review approval required before merge
- CI Pipeline must pass (lint, tests, Codecov)

## Dev Branch

- PR recommended for major changes
- Direct pushes allowed for small/urgent fixes
- CI Pipeline runs on push and pull requests

## CI Pipeline Checks

- Frontend: Lint → Test (with coverage)
- Backend: Lint → Test (with coverage)
- Coverage reports uploaded to Codecov
- Merge blocked if checks fail
