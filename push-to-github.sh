#!/usr/bin/env bash
# Pushes this project to a GitHub repo in one command.
#
# Usage:
#   ./push-to-github.sh https://github.com/<your-username>/about.git
#
# (On Windows, run this from Git Bash, or follow the manual steps in DEPLOY.md.)
set -e

REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
  echo "Usage: ./push-to-github.sh https://github.com/<your-username>/<repo>.git"
  echo "Example: ./push-to-github.sh https://github.com/suyash/about.git"
  exit 1
fi

git init -b main
git add .
git commit -m "Portfolio site"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
git push -u origin main

echo ""
echo "Done! Now enable GitHub Pages:"
echo "  Repo -> Settings -> Pages -> Source: GitHub Actions"
echo "Your site will be live at the URL Pages shows (usually https://<username>.github.io/about/)."
