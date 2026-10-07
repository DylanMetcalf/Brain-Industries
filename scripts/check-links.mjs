// Post-build check: every internal link, image and asset referenced in _site must exist.
import fs from "node:fs";
import path from "node:path";

const root = "_site";
const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".html")) files.push(p);
  }
})(root);

const exists = (url) => {
  const clean = decodeURI(url.split(/[?#]/)[0]);
  const p = path.join(root, clean);
  return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, "index.html")));
};

let errors = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"|srcset="([^"]+)"/g)].flatMap((m) =>
    m[1] ? [m[1]] : m[2].split(",").map((s) => s.trim().split(/\s+/)[0])
  );
  for (const ref of refs) {
    if (!ref.startsWith("/") || ref.startsWith("//")) continue;
    if (!exists(ref)) { console.error(`✗ ${file}: missing ${ref}`); errors++; }
  }
}
console.log(`Checked ${files.length} pages — ${errors ? errors + " broken reference(s)" : "no broken internal references"}.`);
process.exit(errors ? 1 : 0);
