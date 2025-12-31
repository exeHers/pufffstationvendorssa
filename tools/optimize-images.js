const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const INPUT_DIR = path.join(__dirname, "../raw-images");
const OUTPUT_DIR = path.join(__dirname, "../optimized-images");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function isImage(file) {
  return /\.(png|jpg|jpeg|webp)$/i.test(file);
}

(async () => {
  ensureDir(INPUT_DIR);
  ensureDir(OUTPUT_DIR);

  const files = fs.readdirSync(INPUT_DIR).filter(isImage);

  if (files.length === 0) {
    console.log("⚠️ No images found in /raw-images");
    console.log("✅ Put your PNG/JPG/WebP files inside: raw-images/");
    console.log("Then run: node tools/optimize-images.js");
    process.exit(0);
  }

  console.log(`📦 Found ${files.length} image(s). Optimizing...`);

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);

    const base = file.replace(/\.(png|jpg|jpeg|webp)$/i, "");
    const outputPath = path.join(OUTPUT_DIR, `${base}.webp`);

    try {
      console.log("🛠️ Optimizing:", file);

      await sharp(inputPath)
        .resize(800, 1000, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);

      console.log("✅ Saved:", outputPath);
    } catch (err) {
      console.log("❌ Failed:", file);
      console.error(err);
    }
  }

  console.log("🔥 Done. Optimized images are in:", OUTPUT_DIR);
})();