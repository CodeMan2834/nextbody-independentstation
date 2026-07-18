/**
 * Generate case study images from existing pics/ resources.
 * Each gets a custom crop suited to the layout slot.
 */
import sharp from "sharp";
import { join } from "node:path";

const PICS = "../pics";
const OUT = "public/images/cases";

const jobs = [];

// Helper: crop + resize to 16:10 (640x400) with specific position
async function crop(srcName, destName, options = {}) {
  const { width = 640, height = 400, fit = "cover", position = "center", brightness = 1, contrast = 1, saturate = 1, blur = 0 } = options;
  try {
    let pipeline = sharp(join(PICS, srcName))
      .resize(width, height, { fit, position });

    // Apply dark-theme color adjustments
    if (brightness !== 1 || contrast !== 1 || saturate !== 1) {
      pipeline = pipeline.modulate({ brightness, saturation: saturate });
    }
    if (contrast !== 1) {
      // sharp doesn't have direct contrast, but we can approximate with linear
      pipeline = pipeline.linear(contrast, -(contrast - 1) * 128);
    }

    await pipeline.webp({ quality: 85 }).toFile(join(OUT, destName));
    console.log(`✓ ${destName}`);
  } catch (e) {
    console.error(`✗ ${destName}: ${e.message}`);
  }
}

// Dubai gym — gym interior scene (focus: premium equipment area)
jobs.push(crop("健身房场景1.png", "case-dubai-gym.webp", {
  position: "right center", brightness: 0.85, saturate: 0.8
}));

// Riyadh rehab — product in professional medical setting
jobs.push(crop("3D人体扫描.png", "case-riyadh-rehab.webp", {
  position: "center", brightness: 0.8, saturate: 0.7
}));

// Singapore studio — compact product setup
jobs.push(crop("nextbody-s30-hero111.png", "case-singapore-studio.webp", {
  position: "center", brightness: 0.9, saturate: 0.85
}));

// Bangkok nutrition — report/data display
jobs.push(crop("报告.png", "case-bangkok-nutrition.webp", {
  position: "center", brightness: 0.85, saturate: 0.75
}));

// Doha medical — body scan in premium context
jobs.push(crop("人体扫描.png", "case-doha-medical.webp", {
  position: "center", brightness: 0.8, saturate: 0.7
}));

// KL chain — multi-site/product overview
jobs.push(crop("F20.png", "case-kl-chain.webp", {
  position: "center", brightness: 0.85, saturate: 0.8
}));

await Promise.all(jobs);
console.log("\n✓ All case images processed");
