#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Please ask IT to install Node.js (LTS) and npm."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

URL="http://localhost:5173/"

# Start dev server in background
npm run dev -- --host 127.0.0.1 --port 5173 >/tmp/pdf-generator-dev.log 2>&1 &
SERVER_PID=$!

# Wait for server
for i in {1..30}; do
  if curl -s "$URL" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Open browser
open "$URL"

echo "PDF Generator is running at $URL"
echo "Close this window to stop the server."

# Wait until user closes
read -r

# Stop server
kill $SERVER_PID >/dev/null 2>&1 || true
