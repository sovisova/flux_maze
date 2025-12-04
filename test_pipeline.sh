#!/bin/bash

#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔎 Checking Node and npm..."
if ! command -v node >/dev/null 2>&1; then
  echo "❌ node is not in PATH. Open a new terminal where 'node -v' works and run this script again."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is not in PATH. Open a new terminal where 'npm -v' works and run this script again."
  exit 1
fi
echo "✅ node: $(node -v), npm: $(npm -v)"

cd "$PROJECT_ROOT"

# Install deps if node_modules missing
if [ ! -d node_modules ]; then
  echo "📦 node_modules not found. Running npm install..."
  npm install
else
  echo "📦 node_modules already present, skipping npm install."
fi

# Start Vite dev server in background
echo "🚀 Starting dev server (npm run dev)..."
npm run dev >/tmp/rrweb-dev.log 2>&1 &
DEV_PID=$!

cleanup() {
  echo
  echo "🧹 Stopping dev server (pid $DEV_PID)..."
  kill "$DEV_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Wait for Vite to be ready on port 8080 (adjust if you use another port)
echo "⏳ Waiting for http://localhost:8080 to be ready..."
for i in {1..40}; do
  if curl -sSf http://localhost:8080 >/dev/null 2>&1; then
    echo "✅ Dev server is up at http://localhost:8080"
    break
  fi
  sleep 1
  if [ "$i" -eq 40 ]; then
    echo "❌ Timed out waiting for dev server. Check /tmp/rrweb-dev.log"
    exit 1
  fi
done

echo
echo "🖱  Manual step:"
echo "  1. Open your browser at:  http://localhost:8080"
echo "  2. Click around (login/signup/pages) so rrweb records a session."
echo "  3. Click the 'Download Session' button to save a JSON file to ~/Downloads."
echo
read -rp "👉 Press ENTER here AFTER you have downloaded the session JSON... "

# Grab the newest session-*.json from Downloads
LATEST_JSON=$(ls -t "$HOME"/Downloads/session-*.json 2>/dev/null | head -n 1 || true)

if [ -z "$LATEST_JSON" ]; then
  echo "❌ No file matching ~/Downloads/session-*.json found."
  echo "   Make sure the download button created a file named like 'session-XXXX.json'."
  exit 1
fi

echo "📥 Found latest session JSON: $LATEST_JSON"

SESSION_BASENAME=$(basename "$LATEST_JSON")
TARGET_JSON="$PROJECT_ROOT/$SESSION_BASENAME"

cp "$LATEST_JSON" "$TARGET_JSON"
echo "📂 Copied to project root as: $TARGET_JSON"

# Run geometry extraction
if [ ! -f "$PROJECT_ROOT/tools/extract_geometry.cjs" ]; then
  echo "❌ tools/extract_geometry.cjs not found. Make sure the extractor script exists."
  exit 1
fi

echo "📐 Running geometry extractor..."
node tools/extract_geometry.cjs "$TARGET_JSON"

GEOM_FILE="${SESSION_BASENAME%.json}.geometry.json"
if [ -f "$PROJECT_ROOT/$GEOM_FILE" ]; then
  echo "✅ Geometry file created: $GEOM_FILE"
  echo
  echo "First lines of the output:"
  head -40 "$GEOM_FILE" || true
else
  echo "❌ Expected $GEOM_FILE but it was not created. Check extractor logs above."
  exit 1
fi

echo
echo "🎉 End-to-end pipeline succeeded."
echo "   Recording → Download → Copy → Extract → Geometry JSON"
