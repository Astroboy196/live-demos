#!/bin/bash
# Auto-Deploy Script — baut alle Demos und pusht zu GitHub Pages
set -e

BASE="/Users/astro/Desktop/Claude Projekts"
DEMOS="$BASE/live-demos"
TIMESTAMP=$(date '+%d.%m.%Y %H:%M')

echo "🚀 Deploy gestartet — $TIMESTAMP"

# === 1. Statische HTML Demos aktualisieren ===
echo "📄 Kopiere statische Demos..."

cp "$BASE/SkyFocus Live/SKYFOCUS_LIVE_DASHBOARD.html" "$DEMOS/skyfocus-dashboard/index.html"
cp "$BASE/SkyFocus Live/dashboard.html" "$DEMOS/skyfocus-project/index.html"
cp "$BASE/Autorepond/SaaS-Projekt/04-Landing/index.html" "$DEMOS/velora-landing/index.html"
cp "$BASE/Autorepond/SaaS-Projekt/06-Dashboard/index.html" "$DEMOS/velora-dashboard/index.html"
cp "$BASE/Skills-Central/ai-opportunity-engine/dashboard.html" "$DEMOS/skills-dashboard/index.html"

# === 2. React/Vite Apps neu builden ===
echo "⚙️ Builde SkyFocus App..."
cd "$BASE/SkyFocus Live/app/frontend"
npx vite build --base=/live-demos/skyfocus-app/ 2>/dev/null
rm -rf "$DEMOS/skyfocus-app"
cp -r dist "$DEMOS/skyfocus-app"

echo "⚙️ Builde Wetten App..."
cd "$BASE/Projekt 4/Wetten/frontend"
npx vite build --base=/live-demos/wetten/ 2>/dev/null
rm -rf "$DEMOS/wetten"
cp -r dist "$DEMOS/wetten"

# === 3. Git Push ===
echo "📤 Pushe zu GitHub..."
cd "$DEMOS"
git add -A
if git diff --cached --quiet; then
  echo "✅ Keine Änderungen — alles aktuell."
  exit 0
fi

git commit -m "Auto-deploy: $TIMESTAMP"
git push origin main

echo "✅ Deploy fertig! Live in ~60 Sekunden."
echo "🌐 https://astroboy196.github.io/live-demos/"
