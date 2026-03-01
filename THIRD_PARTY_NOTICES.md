# Third-Party Notices

This project uses third-party open-source software.  
The following list is based on the current dependency manifests and lockfiles in this repository.

Date generated: 2026-03-01

## Backend dependencies

Source: `backend/pyproject.toml` and installed package metadata in `backend/.venv`.

- fastapi — MIT
- huggingface-hub — Apache-2.0
- mistralai (Python SDK) — Apache-2.0
- pydantic — MIT
- sqlalchemy — MIT
- uvicorn — BSD-3-Clause
- python-dotenv — BSD-3-Clause
- dotenv — MIT

## Frontend direct dependencies

Source: `frontend/package.json` and `frontend/package-lock.json`.

- @mistralai/mistralai — see upstream package metadata/license file
- gifenc — MIT
- react — MIT
- react-dom — MIT

## Frontend tooling dependencies (dev)

Source: `frontend/package.json` and `frontend/package-lock.json`.

- @biomejs/biome — MIT OR Apache-2.0
- @eslint/js — MIT
- @tailwindcss/vite — MIT
- @types/react — MIT
- @types/react-dom — MIT
- @vitejs/plugin-react — MIT
- eslint — MIT
- eslint-plugin-react-hooks — MIT
- eslint-plugin-react-refresh — MIT
- globals — MIT
- tailwindcss — MIT
- vite — MIT

## Notable transitive dependency attribution

- caniuse-lite — CC-BY-4.0  
  Required attribution should be preserved according to the package license terms.

## Notes

- Full license texts are generally available in each dependency package/distribution.
- If dependency versions change, this notice file should be updated.
- This document is informational and not legal advice.
