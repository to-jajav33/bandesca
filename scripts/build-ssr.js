import path from "node:path";
import fs from "node:fs";

export async function buildSsr() {
  const outDir = path.join(process.cwd(), "dist", "ssr");
  // create outDir if it doesn't exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // copy src/ to outDir
  fs.cpSync(path.join(import.meta.dir, "src"), outDir, { recursive: true });
}
