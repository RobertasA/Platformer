#!/usr/bin/env bash
# Boots the game in headless Chromium, fails on console/page errors, saves screenshots to shots/.
# Usage: ./tools/check.sh [url-path]   (default: index.html served locally)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p shots
PORT=${PORT:-8123}
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 0.7
node tools/check.js "http://localhost:$PORT/${1:-index.html}"
