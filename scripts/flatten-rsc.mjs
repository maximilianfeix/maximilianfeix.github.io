// The static export writes the RSC payloads of nested segments into folders
// (out/projects/x/__next.projects/$d$slug/__PAGE__.txt), but the client requests them with dots
// (out/projects/x/__next.projects.$d$slug.__PAGE__.txt). A server with rewrites would bridge that;
// GitHub Pages has none, so every client-side navigation would fall back to a full page load and
// lose its view transition. This copies each payload to the name the client asks for.
import { cpSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = "out";
let copied = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(path, dir);
    else walk(path);
  }
}

function flatten(segmentDir, parent) {
  const files = [];
  const collect = (d) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) collect(p);
      else files.push(p);
    }
  };
  collect(segmentDir);
  for (const file of files) {
    const flat = relative(parent, file).split(sep).join(".");
    cpSync(file, join(parent, flat));
    copied++;
  }
}

walk(root);
console.log(`flatten-rsc: ${copied} payloads copied`);
