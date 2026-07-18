/**
 * Rebuild all assets from updated pics/ + compress video.
 * Run: node scripts/rebuild-all.mjs
 */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const PICS = "../pics";
const VIDEO_SRC = "../video/产品宣传视频.mp4";
const VIDEO_OUT = "public/video/product-loop.webm";
const OUT = "public/images";
const CH = "public/images/chapters";
const CA = "public/images/cases";

console.log("=== 1/4 Compressing video ===");
try {
  execFileSync(ffmpegPath, [
    "-y",
    "-i", VIDEO_SRC,
    "-vf", "scale=1280:-2",
    "-c:v", "libvpx-vp9",
    "-crf", "38",
    "-b:v", "0",
    "-an",
    "-t", "6",
    "-loop", "0",
    VIDEO_OUT,
  ], { stdio: "inherit", timeout: 120000 });
  console.log("✓ product-loop.webm");
} catch (e) {
  console.error("✗ Video compression failed:", e.message);
  console.log("  Falling back to MP4 — compress manually for production");
}

console.log("\n=== 2/4 Product hero images ===");
const products = [
  { src: "nextbody-s30-hero.png", dest: "nextbody-s30-hero.webp", w: 800, h: 1000 },
  { src: "F20.png", dest: "nextbody-s20-hero.webp", w: 800, h: 1000 },
  { src: "nextbody-report-ui.png", dest: "report-ui-hero.webp", w: 1440, h: 900 },
];
for (const p of products) {
  try {
    await sharp(join(PICS, p.src))
      .resize(p.w, p.h, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(join(OUT, p.dest));
    console.log(`✓ ${p.dest}`);
  } catch (e) { console.error(`✗ ${p.dest}: ${e.message}`); }
}

console.log("\n=== 3/4 Chapter images (custom crops) ===");
const chapters = [
  { src: "健身房场景1.png", dest: "member-scan.webp", w: 720, h: 450, fit: "cover", pos: "centre" },
  { src: "报告.png", dest: "member-report.webp", w: 720, h: 450, fit: "cover", pos: "centre" },
  { src: "健身房场景2.png", dest: "coach-workflow.webp", w: 720, h: 450, fit: "cover", pos: "centre" },
];
for (const c of chapters) {
  try {
    let pipeline = sharp(join(PICS, c.src)).resize(c.w, c.h, { fit: c.fit, position: c.pos });
    if (c.modulate) pipeline = pipeline.modulate(c.modulate);
    await pipeline.webp({ quality: 85 }).toFile(join(CH, c.dest));
    console.log(`✓ ${c.dest}`);
  } catch (e) { console.error(`✗ ${c.dest}: ${e.message}`); }
}

console.log("\n=== 4/4 Case images (custom crops) ===");
const cases = [
  { src: "健身房场景1.png", dest: "case-dubai-gym.webp", w: 720, h: 450, fit: "cover", pos: "right" },
  { src: "3D人体扫描.png", dest: "case-riyadh-rehab.webp", w: 720, h: 450, fit: "cover", pos: "centre" },
  { src: "nextbody-s30-hero.png", dest: "case-singapore-studio.webp", w: 720, h: 450, fit: "cover", pos: "centre" },
  { src: "报告.png", dest: "case-bangkok-nutrition.webp", w: 720, h: 450, fit: "cover", pos: "centre" },
  { src: "人体扫描.png", dest: "case-doha-medical.webp", w: 720, h: 450, fit: "cover", pos: "centre" },
  { src: "F20.png", dest: "case-kl-chain.webp", w: 720, h: 450, fit: "cover", pos: "centre" },
];
for (const c of cases) {
  try {
    await sharp(join(PICS, c.src))
      .resize(c.w, c.h, { fit: c.fit, position: c.pos })
      .modulate({ brightness: 0.85, saturation: 0.8 })
      .webp({ quality: 85 })
      .toFile(join(CA, c.dest));
    console.log(`✓ ${c.dest}`);
  } catch (e) { console.error(`✗ ${c.dest}: ${e.message}`); }
}

console.log("\n✓ All assets rebuilt");
