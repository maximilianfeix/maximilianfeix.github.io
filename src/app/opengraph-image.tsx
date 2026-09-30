import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { projects } from "@/data/projects";

export const alt = "Maximilian Feix – Creative Software Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

const font = (file: string) => readFile(join(process.cwd(), "node_modules/geist/dist/fonts", file));

// The share image: the name, the role, and the project graph drawn small in the corner.
export default async function Image() {
  const [semibold, mono] = await Promise.all([font("geist-sans/Geist-SemiBold.ttf"), font("geist-mono/GeistMono-Regular.ttf")]);
  const scale = 0.22;
  const cx = 960;
  const cy = 250;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0b0b0c",
        color: "#edebe4",
        padding: 72,
        position: "relative",
      }}
    >
      <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
        {projects.map((p) => (
          <line
            key={p.slug}
            x1={cx}
            y1={cy}
            x2={cx + p.position.x * scale}
            y2={cy + p.position.y * scale}
            stroke="rgba(237,235,228,0.18)"
            strokeWidth={1.5}
          />
        ))}
        {projects.map((p) => (
          <circle key={`c-${p.slug}`} cx={cx + p.position.x * scale} cy={cy + p.position.y * scale} r={6} fill={p.featured ? "#edebe4" : "#74736f"} />
        ))}
        <circle cx={cx} cy={cy} r={14} fill="#c6f36b" />
      </svg>
      <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 20, letterSpacing: 4, color: "#a3a29d" }}>THE INTERNET OF MAXI</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: "Geist", fontSize: 150, lineHeight: 0.85, letterSpacing: -8 }}>MAXIMILIAN</div>
        <div style={{ fontFamily: "Geist", fontSize: 150, lineHeight: 0.85, letterSpacing: -8 }}>FEIX</div>
        <div style={{ display: "flex", marginTop: 36, fontFamily: "Geist Mono", fontSize: 22, letterSpacing: 4, color: "#a3a29d" }}>
          CREATIVE SOFTWARE DEVELOPER · MAXIMILIANFEIX.GITHUB.IO
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
