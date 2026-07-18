/**
 * Process reference images from ../pics/ → optimized WebP for production.
 * Run: node scripts/process-images.mjs
 */
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { basename, join, extname } from "node:path";

const PICS_DIR = "../pics";
const OUT_DIR = "public/images";
const CHAPTERS_OUT = "public/images/chapters";
const CASES_OUT = "public/images/cases";

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(CHAPTERS_OUT, { recursive: true });
mkdirSync(CASES_OUT, { recursive: true });

const jobs = [];

// Helper: resize + webp
async function toWebp(src, dest, width, height, quality = 80) {
  try {
    await sharp(src)
      .resize(width, height, { fit: "cover", position: "center" })
      .webp({ quality })
      .toFile(dest);
    console.log(`✓ ${dest}`);
  } catch (e) {
    console.error(`✗ ${dest}: ${e.message}`);
  }
}

// ── P0: Product hero images ──────────────────────
jobs.push(
  toWebp(
    join(PICS_DIR, "nextbody-s30-hero.png"),
    join(OUT_DIR, "nextbody-s30-hero.webp"),
    1200, 1200, 80
  )
);
// Use F20.png as S20 hero
jobs.push(
  toWebp(
    join(PICS_DIR, "F20.png"),
    join(OUT_DIR, "nextbody-s20-hero.webp"),
    1200, 1200, 80
  )
);

// ── P0: Report UI ────────────────────────────────
jobs.push(
  toWebp(
    join(PICS_DIR, "nextbody-report-ui.png"),
    join(OUT_DIR, "report-ui-hero.webp"),
    1440, 900, 80
  )
);

// ── P1: Chapter images (from gym scene refs) ─────
jobs.push(
  toWebp(
    join(PICS_DIR, "健身房场景1.png"),
    join(CHAPTERS_OUT, "member-scan.webp"),
    1440, 900, 80
  )
);
jobs.push(
  toWebp(
    join(PICS_DIR, "报告.png"),
    join(CHAPTERS_OUT, "member-report.webp"),
    1440, 900, 80
  )
);
jobs.push(
  toWebp(
    join(PICS_DIR, "健身房场景2.png"),
    join(CHAPTERS_OUT, "coach-workflow.webp"),
    1440, 900, 80
  )
);

// ── Process all ──────────────────────────────────
await Promise.all(jobs);
console.log("\n✓ All images processed");
