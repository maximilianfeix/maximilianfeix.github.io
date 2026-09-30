import sharp from "sharp";
const W = 1600, H = 800;
const BG = "#101012", FG = "#EDEBE4", MUTED = "#8C8B86", LINE = "#2A2A2E", ACC = "#C6F36B";
const mono = "Consolas, 'Cascadia Mono', monospace", sans = "'Segoe UI', Arial, sans-serif";
const frame = (body, extra = "") => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#1B1B1E" stroke-width="1"/></pattern>
<radialGradient id="v" cx="0.7" cy="0.4" r="0.9"><stop offset="0" stop-color="#1A1A1D"/><stop offset="1" stop-color="${BG}"/></radialGradient>${extra}</defs>
<rect width="100%" height="100%" fill="url(#v)"/><rect width="100%" height="100%" fill="url(#g)" opacity="0.6"/>${body}</svg>`;
const label = (x, y, t, c = MUTED, s = 22) => `<text x="${x}" y="${y}" font-family="${mono}" font-size="${s}" fill="${c}" letter-spacing="2">${t}</text>`;

// Axon CLI: a terminal generating a workflow
const lines = [["$ vendor/bin/axonphp ci:init github", FG], ["  reading composer.json", MUTED], ["  writing .github/workflows/ci.yml", MUTED], ["", FG],
 ["name: CI", ACC], ["on: [push, pull_request]", FG], ["jobs:", FG], ["  test:", FG], ["    runs-on: ubuntu-latest", FG], ["    steps:", FG], ["      - uses: actions/checkout@v4", FG], ["      - uses: shivammathur/setup-php@v2", FG], ["      - run: composer install --no-progress", FG], ["      - run: vendor/bin/phpunit", FG], ["", FG], ["  ✓ CI configuration generated", ACC]];
const axon = frame(`<rect x="560" y="90" width="940" height="620" rx="6" fill="#0C0C0E" stroke="${LINE}"/>
<line x1="560" y1="140" x2="1500" y2="140" stroke="${LINE}"/>${label(590, 122, "axonphp — zsh", MUTED, 18)}
${lines.map(([t, c], i) => `<text x="600" y="${190 + i * 32}" font-family="${mono}" font-size="22" fill="${c}" xml:space="preserve">${t.replace(/&/g, "&amp;")}</text>`).join("")}
<text x="100" y="330" font-family="${sans}" font-weight="700" font-size="92" fill="${FG}" letter-spacing="-3">AxonPHP</text>
${label(106, 390, "CI/CD CONFIG IN ONE COMMAND")}${label(106, 690, "PHP · COMPOSER · GITHUB ACTIONS", MUTED, 18)}`);

// Event registration: seats/slots grid + ticket
let seats = ""; for (let r = 0; r < 9; r++) for (let c = 0; c < 16; c++) { const taken = ((r * 7 + c * 13) % 5) < 3; const x = 760 + c * 44, y = 180 + r * 44; seats += `<rect x="${x}" y="${y}" width="30" height="30" rx="3" fill="${taken ? "#2A2A2E" : "none"}" stroke="${taken ? "none" : "#3A3A3F"}"/>`; }
seats += `<rect x="${760 + 9 * 44}" y="${180 + 4 * 44}" width="30" height="30" rx="3" fill="${ACC}"/>`;
const event = frame(`${seats}${label(760, 150, "HALL A · 144 SEATS · 87 REGISTERED", MUTED, 18)}
<text x="100" y="330" font-family="${sans}" font-weight="700" font-size="104" fill="${FG}" letter-spacing="-4">Event</text>
<text x="100" y="440" font-family="${sans}" font-weight="700" font-size="104" fill="${FG}" letter-spacing="-4">System</text>
${label(106, 500, "REGISTRATION · CHECK-IN · CAPACITY")}
<rect x="100" y="580" width="420" height="120" rx="4" fill="none" stroke="${LINE}"/><line x1="400" y1="580" x2="400" y2="700" stroke="${LINE}" stroke-dasharray="6 6"/>
${label(124, 630, "TICKET #0412", FG, 20)}${label(124, 670, "SEAT A-5-10", MUTED, 18)}${label(424, 650, "✓ IN", ACC, 22)}`);

// Experiments: generative field
let dots = ""; for (let i = 0; i < 26; i++) for (let j = 0; j < 13; j++) { const x = 640 + i * 34, y = 150 + j * 42; const d = Math.sin(i * 0.45) * Math.cos(j * 0.6 + i * 0.1); const r = 2 + Math.abs(d) * 9; dots += `<circle cx="${x}" cy="${y + d * 14}" r="${r.toFixed(1)}" fill="${d > 0.72 ? ACC : FG}" opacity="${(0.25 + Math.abs(d) * 0.7).toFixed(2)}"/>`; }
let wave = "M640 700"; for (let x = 0; x <= 880; x += 10) wave += ` L${640 + x} ${700 + Math.sin(x / 40) * 24 * Math.sin(x / 300)}`;
const lab = frame(`${dots}<path d="${wave}" fill="none" stroke="${ACC}" stroke-width="2"/>
<text x="100" y="360" font-family="${sans}" font-weight="700" font-size="150" fill="${FG}" letter-spacing="-6">Lab</text>
${label(106, 420, "SHADERS · CLI TOOLS · NETWORKING")}${label(106, 690, "SMALL THINGS, BUILT TO LEARN", MUTED, 18)}`);

// Infrastructure: rack + services
let rack = ""; for (let i = 0; i < 8; i++) { const y = 150 + i * 62; rack += `<rect x="760" y="${y}" width="330" height="46" rx="3" fill="#141417" stroke="${LINE}"/><circle cx="784" cy="${y + 23}" r="5" fill="${i === 2 ? ACC : "#3F6B3F"}"/>${label(804, y + 30, `node-${String(i + 1).padStart(2, "0")}`, MUTED, 16)}<rect x="990" y="${y + 17}" width="80" height="12" fill="#1E1E22"/><rect x="990" y="${y + 17}" width="${20 + ((i * 29) % 60)}" height="12" fill="#3A3A3F"/>`; }
const svc = [["APACHE", 330], ["NODE.JS", 430], ["REDIS", 530], ["MARIADB", 630]];
const infra = frame(`${rack}${svc.map(([n, y]) => `<rect x="1180" y="${y - 30}" width="240" height="50" rx="3" fill="none" stroke="#3A3A3F"/>${label(1200, y + 2, n, FG, 18)}<path d="M1090 ${y - 5} C1130 ${y - 5} 1140 ${y - 5} 1180 ${y - 5}" stroke="${LINE}" fill="none"/>`).join("")}
<text x="100" y="330" font-family="${sans}" font-weight="700" font-size="96" fill="${FG}" letter-spacing="-4">Infra</text>
<text x="100" y="430" font-family="${sans}" font-weight="700" font-size="96" fill="${FG}" letter-spacing="-4">structure</text>
${label(106, 490, "LINUX · PIPELINES · OPS")}`);

for (const [name, svg] of [["axon-cli", axon], ["event-system", event], ["experiments", lab], ["infrastructure", infra]])
  for (const w of [1600, 800]) await sharp(Buffer.from(svg)).resize({ width: w }).webp({ quality: 84 }).toFile(`public/projects/${name}-${w}.webp`);

// HolyMeme: mascot crop on dark canvas
const mascot = await sharp("scripts/assets/holymeme-logo.svg", { density: 220 }).resize({ width: 900 }).extract({ left: 0, top: 0, width: 900, height: 560 }).png().toBuffer();
const fade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560"><defs><radialGradient id="m" cx="0.5" cy="0.5" r="0.5"><stop offset="0.72" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><ellipse cx="450" cy="280" rx="450" ry="280" fill="url(#m)"/></svg>`);
const mascotSoft = await sharp(mascot).composite([{ input: fade, blend: "dest-in" }]).modulate({ brightness: 0.92 }).png().toBuffer();
const holyBg = frame(`<text x="100" y="360" font-family="${sans}" font-weight="700" font-size="130" fill="${FG}" letter-spacing="-5">HolyMeme</text>
${label(106, 420, "REAL-TIME MULTIPLAYER MEME PARTY")}${label(106, 690, "NODE.JS · WEBSOCKETS · ZERO DEPENDENCIES", MUTED, 18)}`);
for (const w of [1600, 800]) {
  const base = await sharp(Buffer.from(holyBg)).composite([{ input: await sharp(mascotSoft).resize({ width: 680 }).toBuffer(), left: 860, top: 140 }]).png().toBuffer();
  await sharp(base).resize({ width: w }).webp({ quality: 84 }).toFile(`public/projects/holymeme-${w}.webp`);
}
console.log("ok");
