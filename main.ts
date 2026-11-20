// Leonida Legend — the hand-in program for the GTA 6 trophy guide bounty
// (gta6-trophy-guide-01). The guide itself is the static web app in app/:
// plain files, no build step, nothing fetched at run time. This program's one
// job is to hand it in — copy app/ and screenshots/ into the output directory
// and write dossier.json there with the vendored make.fun library, byte for
// byte as the scorer rebuilds it. vendor/makefun-frontend.ts stays untouched.
//
// Run it the way the grader does (MAKEFUN_OUTPUT_DIR stands in for /output
// outside the grader's container):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Try the guide locally with:  node serve.ts   →   http://localhost:8080

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps the scorer holds this bounty to: at most 4 screenshots of 256 KiB,
// at most 993 files and 48 MiB under app/, and the dossier text capped at
// 160 KiB. Passing them to buildDossier makes it refuse anything the scorer
// would refuse, here instead of there.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyTree(fromName, toName) {
  const from = join(repoRoot, fromName);
  const to = join(outputDir, toName);
  if (!existsSync(from)) return 0;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  return countFiles(to);
}

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    total += statSync(path).isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  // Start from a clean slate: the program runs twice and both runs must write
  // the same bytes, so a file the guide no longer ships must not linger in the
  // output from an earlier run.
  for (const name of ['app', 'screenshots']) {
    rmSync(join(outputDir, name), { recursive: true, force: true });
  }
  const appFiles = copyTree('app', 'app');
  const shotFiles = copyTree('screenshots', 'screenshots');
  writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_LIMITS));
  console.log(`Leonida Legend handed in: ${appFiles} app files, ${shotFiles} screenshots, dossier.json written to ${outputDir}`);
}

handIn();
