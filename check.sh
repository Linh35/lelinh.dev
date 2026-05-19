#!/bin/bash
# check.sh — static verifier from the brief. Run from repo root.
# Site source lives under src/; configs and archives stay at the repo root.
set +e
FAIL=0

echo "=== File length (must be empty) ==="
OVER=$(find src/assets -type f \( -name '*.js' -o -name '*.css' \) -exec wc -l {} \; 2>/dev/null | awk '$1 > 150 {print}')
if [ -n "$OVER" ]; then echo "$OVER"; FAIL=1; fi

echo "=== Non-relative imports (must be empty) ==="
BAD=$(grep -rEn "from ['\"][^./]" src/assets/ 2>/dev/null)
if [ -n "$BAD" ]; then echo "$BAD"; FAIL=1; fi

echo "=== Framework references (must be empty) ==="
# Match real usage (imports / script srcs), not the words in prose copy.
FW=$(grep -riEn "(from|import\(|require\()[[:space:]]*['\"][^'\"]*(react|vue|svelte|alpine|jquery|lit-html)|<script[^>]*src=['\"][^'\"]*(react|vue|svelte|alpine|jquery|lit-html)" --include='*.js' --include='*.html' src/ 2>/dev/null)
if [ -n "$FW" ]; then echo "$FW"; FAIL=1; fi

echo "=== Build artifacts (must be absent) ==="
if [ -e node_modules ] || [ -e package.json ]; then echo "FAIL: build tooling present"; FAIL=1; fi

echo "=== File headers (every file needs a header comment) ==="
for f in $(find src/assets -type f \( -name '*.js' -o -name '*.css' \)); do
  head -1 "$f" | grep -qE "^(/\*|//|/\*\*)" || { echo "no header: $f"; FAIL=1; }
done

echo "=== View Transitions usage ==="
grep -q "startViewTransition" src/assets/kernel/router.js 2>/dev/null || { echo "router missing View Transitions"; FAIL=1; }
grep -q "startViewTransition" src/assets/kernel/mode-manager.js 2>/dev/null || { echo "mode-manager missing View Transitions"; FAIL=1; }

echo "=== data-mode set in head (FOUC prevention) ==="
for f in src/*.html src/work/*.html; do
  [ -f "$f" ] || continue
  grep -qE '<script[^>]*>[^<]*data-mode' "$f" || { echo "no inline mode script: $f"; FAIL=1; }
done

echo
if [ $FAIL -eq 0 ]; then echo "ALL CHECKS PASSED"; else echo "FAILURES: $FAIL"; exit 1; fi
