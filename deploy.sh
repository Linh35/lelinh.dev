#!/bin/bash
# deploy.sh — verify, then publish src/ to Cloudflare Pages (prod). Run from repo root.
# Auth is yours: run `npx wrangler login` once first. This does NOT git push.
set -e

echo "=== Verifying (check.sh) ==="
./check.sh

echo
echo "=== Deploying src/ to Cloudflare Pages (project: lelinh) ==="
npx wrangler pages deploy src --project-name=lelinh --branch=master --commit-dirty=true

echo
echo "Live at https://lelinh.dev (and https://lelinh.pages.dev)"
