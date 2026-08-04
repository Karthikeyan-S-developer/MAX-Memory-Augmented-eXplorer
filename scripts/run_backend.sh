#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python -m uvicorn backend.app.main:app --reload --port 8000
