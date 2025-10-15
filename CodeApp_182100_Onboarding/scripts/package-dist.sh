#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

npm run build

DIST_DIR="$ROOT_DIR/dist"
OUT="$ROOT_DIR/app-dist.zip"

if [ -f "$OUT" ]; then
  rm "$OUT"
fi

cd "$DIST_DIR"
zip -r "$OUT" .

echo "Created $OUT"