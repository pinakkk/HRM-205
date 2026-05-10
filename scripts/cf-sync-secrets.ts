/**
 * Push every non-empty key in .env.local to Cloudflare Workers as a secret.
 * Run once before each deploy if you've changed .env.local; otherwise the
 * existing secrets persist across deploys.
 *
 *   npm run cf:secrets
 *
 * Skips: comments, blank lines, and any key whose value is empty.
 * Ignores: keys listed in SKIP below (e.g. APP_URL — auto-detected at runtime).
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const ENV_FILE = resolve(process.cwd(), ".env.local");

// Keys we deliberately don't push (auto-detected, dev-only, etc.)
const SKIP = new Set<string>(["APP_URL", "NEXT_PUBLIC_APP_URL"]);

if (!existsSync(ENV_FILE)) {
  console.error(`✗ ${ENV_FILE} not found`);
  process.exit(1);
}

const raw = readFileSync(ENV_FILE, "utf8");
const entries: { key: string; value: string }[] = [];

for (const line of raw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  // Strip surrounding quotes if present
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  if (!value) continue;
  if (SKIP.has(key)) continue;
  entries.push({ key, value });
}

if (entries.length === 0) {
  console.error("✗ No usable entries in .env.local");
  process.exit(1);
}

console.log(`Pushing ${entries.length} secrets to Cloudflare Workers...\n`);

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 1500;
const PACING_MS = 800; // gap between successful puts to avoid API throttling

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function tryPut(key: string, value: string): { ok: boolean; stderr: string } {
  const result = spawnSync("npx", ["wrangler", "secret", "put", key], {
    input: value,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return { ok: result.status === 0, stderr: result.stderr?.trim() ?? "" };
}

async function main() {
  let failed = 0;
  for (const { key, value } of entries) {
    process.stdout.write(`  ${key} ... `);
    let lastErr = "";
    let ok = false;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const r = tryPut(key, value);
      if (r.ok) {
        ok = true;
        break;
      }
      lastErr = r.stderr;
      if (attempt < MAX_ATTEMPTS) {
        const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
        process.stdout.write(`retry ${attempt}/${MAX_ATTEMPTS - 1} (${delay}ms)... `);
        await sleep(delay);
      }
    }
    if (ok) {
      console.log("ok");
      await sleep(PACING_MS);
    } else {
      failed++;
      console.log("FAIL");
      const firstLine = lastErr.split("\n").find((l) => /ERROR|fetch failed|\d{3}/.test(l));
      if (firstLine) console.error(`    ${firstLine.trim()}`);
    }
  }

  console.log(`\nDone. ${entries.length - failed} ok, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
