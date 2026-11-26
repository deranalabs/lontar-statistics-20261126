// SPDX-License-Identifier: MIT
// Hands in Lontar: checks the screenshots, copies the site (app/) and them to the output folder, writes the dossier.
//
// Lontar is a static national statistics site for Indonesia (ES modules, CSS and SVG, no build step, no network).
// The output folder is /output in the grader and MAKEFUN_OUTPUT_DIR elsewhere:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// vendor/makefun-frontend.ts is the kit's library, unchanged: the scorer rebuilds dossier.json with it byte for byte.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFolder(name: string): void {
  const from = join(root, name);
  mkdirSync(join(output, name), { recursive: true });
  if (existsSync(from)) cpSync(from, join(output, name), { recursive: true });
}

// The cover is the first screenshot by name; the gate wants 3 or 4 of them, so stop early with a clear message.
const shots = existsSync(join(root, 'screenshots')) ? readdirSync(join(root, 'screenshots')).filter((name) => /\.(jpe?g|png)$/i.test(name)) : [];
if (shots.length < 3 || shots.length > 4) throw new Error(`screenshots/ holds ${shots.length} images; the gate wants 3 or 4`);

mkdirSync(output, { recursive: true });
copyFolder('app');
copyFolder('screenshots');

// The scorer's caps: at most 4 screenshots of 256 KiB, 993 app entries, 16 MiB of app files, 160 KiB of dossier text.
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(output, 'dossier.json'), dossier);
console.log(`Lontar handed in: ${shots.length} screenshots (cover ${shots.sort()[0]}), dossier.json ${Buffer.byteLength(dossier)} bytes`);
