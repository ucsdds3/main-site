/**
 * Compress raster images under public/ and src/Assets/ to at most MAX_BYTES (500 KiB).
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const MAX_BYTES = 500 * 1024;
const ROOTS = ["public", "src/Assets"];
const MAX_SIDES = [2400, 1920, 1600, 1400, 1200, 1000, 800, 640, 512, 400];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) walk(fp, files);
    else if (/\.(jpe?g|png|webp|gif)$/i.test(name)) files.push(fp);
  }
  return files;
}

/** Write via temp file then replace (avoids Windows/OneDrive issues in place). */
async function writeAtomic(targetPath, buf) {
  const dir = path.dirname(targetPath);
  const base = path.basename(targetPath);
  const tmp = path.join(dir, `.opt-${base}.${process.pid}.tmp`);
  await fs.promises.writeFile(tmp, buf);
  try {
    await fs.promises.unlink(targetPath);
  } catch {
    /* may not exist */
  }
  await fs.promises.rename(tmp, targetPath);
}

async function toWebpBuffer(inputBuf, maxSide, quality) {
  const meta = await sharp(inputBuf).metadata();
  let pipeline = sharp(inputBuf).rotate();
  if (meta.width && meta.height && (meta.width > maxSide || meta.height > maxSide)) {
    pipeline = pipeline.resize(maxSide, maxSide, { fit: "inside", withoutEnlargement: true });
  }
  return pipeline.webp({ quality, effort: 6 }).toBuffer();
}

async function toJpegBuffer(inputBuf, maxSide, quality) {
  const meta = await sharp(inputBuf).metadata();
  let pipeline = sharp(inputBuf).rotate();
  if (meta.width && meta.height && (meta.width > maxSide || meta.height > maxSide)) {
    pipeline = pipeline.resize(maxSide, maxSide, { fit: "inside", withoutEnlargement: true });
  }
  return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
}

async function toPngBuffer(inputBuf, maxSide) {
  const meta = await sharp(inputBuf).metadata();
  let pipeline = sharp(inputBuf).rotate();
  if (meta.width && meta.height && (meta.width > maxSide || meta.height > maxSide)) {
    pipeline = pipeline.resize(maxSide, maxSide, { fit: "inside", withoutEnlargement: true });
  }
  return pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
}

/**
 * @returns {{ filePath: string, before: number, after: number, renamed?: boolean } | null}
 */
async function optimizeFile(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size <= MAX_BYTES) return null;

  const ext = path.extname(filePath).toLowerCase();
  const before = stat.size;
  const inputBuf = await fs.promises.readFile(filePath);

  for (const maxSide of MAX_SIDES) {
    if (ext === ".webp") {
      for (let q = 88; q >= 38; q -= 4) {
        const buf = await toWebpBuffer(inputBuf, maxSide, q);
        if (buf.length <= MAX_BYTES) {
          await writeAtomic(filePath, buf);
          return { filePath, before, after: buf.length };
        }
      }
    } else if (ext === ".jpg" || ext === ".jpeg") {
      for (let q = 88; q >= 38; q -= 4) {
        const buf = await toJpegBuffer(inputBuf, maxSide, q);
        if (buf.length <= MAX_BYTES) {
          await writeAtomic(filePath, buf);
          return { filePath, before, after: buf.length };
        }
      }
    } else if (ext === ".png") {
      const buf = await toPngBuffer(inputBuf, maxSide);
      if (buf.length <= MAX_BYTES) {
        await writeAtomic(filePath, buf);
        return { filePath, before, after: buf.length };
      }
    }
  }

  if (ext === ".png") {
    for (const maxSide of MAX_SIDES) {
      for (let q = 88; q >= 38; q -= 4) {
        const buf = await toWebpBuffer(inputBuf, maxSide, q);
        if (buf.length <= MAX_BYTES) {
          const newPath = filePath.replace(/\.png$/i, ".webp");
          await writeAtomic(newPath, buf);
          await fs.promises.unlink(filePath);
          return { filePath: newPath, before, after: buf.length, renamed: true };
        }
      }
    }
  }

  console.error("[optimize-images] Could not get under cap:", filePath);
  return null;
}

async function main() {
  const allFiles = [];
  for (const r of ROOTS) {
    allFiles.push(...walk(path.join(REPO_ROOT, r)));
  }

  const big = allFiles.filter((f) => fs.statSync(f).size > MAX_BYTES);
  console.log(`Found ${big.length} file(s) over ${MAX_BYTES / 1024} KiB.`);

  const results = [];
  for (const f of big) {
    const r = await optimizeFile(f);
    if (r) results.push(r);
  }

  for (const r of results) {
    const kb = (n) => (n / 1024).toFixed(1);
    const tag = r.renamed ? " (png→webp)" : "";
    console.log(`${tag}${path.relative(REPO_ROOT, r.filePath)}: ${kb(r.before)} → ${kb(r.after)} KiB`);
  }

  const recheck = ROOTS.flatMap((r) => walk(path.join(REPO_ROOT, r)));
  const bad = recheck.filter((f) => fs.existsSync(f) && fs.statSync(f).size > MAX_BYTES);

  if (bad.length) {
    console.error("Still over cap:", bad.map((f) => path.relative(REPO_ROOT, f)));
    process.exitCode = 1;
  } else {
    console.log("All scanned images are at or under the cap.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
