import fs from 'fs';
import path from 'path';
import { execSync, exec } from 'child_process';

const BASE = '/Users/astro/Desktop/Claude Projekts';
const DEPLOY_SCRIPT = path.join(BASE, 'live-demos', 'deploy.sh');

// Welche Ordner/Dateien überwachen
const WATCH_TARGETS = [
  { path: `${BASE}/SkyFocus Live/SKYFOCUS_LIVE_DASHBOARD.html`, label: 'SkyFocus Dashboard' },
  { path: `${BASE}/SkyFocus Live/dashboard.html`, label: 'SkyFocus Project' },
  { path: `${BASE}/SkyFocus Live/app/frontend/src`, label: 'SkyFocus App', recursive: true },
  { path: `${BASE}/Autorepond/SaaS-Projekt/04-Landing/index.html`, label: 'Velora Landing' },
  { path: `${BASE}/Autorepond/SaaS-Projekt/06-Dashboard/index.html`, label: 'Velora Dashboard' },
  { path: `${BASE}/Skills-Central/ai-opportunity-engine/dashboard.html`, label: 'Skills Dashboard' },
  { path: `${BASE}/Projekt 4/Wetten/frontend/src`, label: 'Wetten App', recursive: true },
];

let deployTimer = null;
let isDeploying = false;

function triggerDeploy(changedLabel) {
  if (isDeploying) {
    console.log(`⏳ Deploy läuft bereits, überspringe...`);
    return;
  }

  // Debounce: warte 5 Sekunden nach letzter Änderung
  if (deployTimer) clearTimeout(deployTimer);

  deployTimer = setTimeout(() => {
    isDeploying = true;
    console.log(`\n🔄 Änderung erkannt: ${changedLabel}`);
    console.log('🚀 Starte Auto-Deploy...\n');

    exec(`bash "${DEPLOY_SCRIPT}"`, (error, stdout, stderr) => {
      isDeploying = false;
      if (error) {
        console.error('❌ Deploy Fehler:', stderr || error.message);
      } else {
        console.log(stdout);
      }
    });
  }, 5000);
}

// Watchers starten
let activeWatchers = 0;

for (const target of WATCH_TARGETS) {
  try {
    if (!fs.existsSync(target.path)) {
      console.log(`⚠️  Nicht gefunden: ${target.label} (${target.path})`);
      continue;
    }

    const options = { persistent: true };
    if (target.recursive) options.recursive = true;

    fs.watch(target.path, options, (eventType, filename) => {
      if (filename && (filename.endsWith('.swp') || filename.startsWith('.'))) return;
      triggerDeploy(`${target.label}${filename ? ` (${filename})` : ''}`);
    });

    activeWatchers++;
    console.log(`👀 Überwache: ${target.label}`);
  } catch (err) {
    console.log(`⚠️  Fehler bei ${target.label}: ${err.message}`);
  }
}

console.log(`\n🤖 Auto-Deploy Watcher aktiv — ${activeWatchers} Targets`);
console.log('📌 Änderungen werden erkannt und automatisch deployed.\n');

// Keep alive
process.on('SIGINT', () => { console.log('\n👋 Watcher gestoppt.'); process.exit(0); });
process.on('SIGTERM', () => { console.log('\n👋 Watcher gestoppt.'); process.exit(0); });
