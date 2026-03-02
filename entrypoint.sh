#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found in PATH."
  exit 1
fi

if [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
  PYTHON_BIN="$BACKEND_DIR/.venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python3)"
else
  echo "python3 is required but was not found in PATH."
  exit 1
fi

PIDS=()

cleanup() {
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
}

trap cleanup EXIT INT TERM

(
  cd "$BACKEND_DIR"
  if [[ -f .env ]]; then
    set -a; source .env; set +a
  fi
  "$PYTHON_BIN" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
) &
PIDS+=("$!")

(
  cd "$FRONTEND_DIR"
  npm run dev
) &
PIDS+=("$!")

wait -n "${PIDS[@]}"
