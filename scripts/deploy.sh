#!/usr/bin/env bash

set -euo pipefail

BRANCH="${1:-main}"
APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

cd "$APP_DIR"

echo "Deploying branch: $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

docker compose up -d --build

echo "Deployment finished."
