import sharp from "sharp";
const jobs = [["proxy-scraper.png","proxy-scraper"],["spillage.png","spillage"],["repoatlas.png","repoatlas"],["actions-guard.png","actions-guard"],["gha-preview.svg","gha-preview"],["holymeme-logo.svg","holymeme-logo"]];
for (const [src, name] of jobs) {
  for (const w of [1600, 800]) {
    const info = await sharp(`scripts/assets/${src}`, { density: 200 }).resize({ width: w, withoutEnlargement: false }).webp({ quality: 82 }).toFile(`public/projects/${name}-${w}.webp`);
    console.log(name, w, info.width + "x" + info.height, Math.round(info.size / 1024) + "KiB");
  }
}
