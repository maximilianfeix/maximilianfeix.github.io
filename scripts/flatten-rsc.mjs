// On Windows, the static export writes the RSC payloads of nested segments into folders
// (out/projects/x/__next.projects/$d$slug/__PAGE__.txt), while the client requests them with dots
// (out/projects/x/__next.projects.$d$slug.__PAGE__.txt). Without rewrites on GitHub Pages, every
// client-side navigation would then fall back to a full page load and lose its view transition.
// Linux builds (CI) already write the dotted names, so there this copies nothing.
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
