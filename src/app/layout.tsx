import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { site } from "@/lib/site";
import { Nav } from "@/components/layout/Nav";
import { Background } from "@/components/layout/Background";
import { SmoothScroll } from "@/features/scroll/SmoothScroll";
import { Cursor } from "@/features/cursor/Cursor";
import { WebGLLayer } from "@/components/webgl/WebGLLayer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} – ${site.role}`, template: `%s – ${site.name}` },
  description: site.description,
  applicationName: "The Internet of Maxi",
  authors: [{ name: site.name, url: site.github }],
  creator: site.name,
  keywords: ["Maximilian Feix", "software developer", "creative developer", "developer tools", "open source", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: "The Internet of Maxi",
    title: `${site.name} – ${site.role}`,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: `${site.name} – ${site.role}`, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script
          // Runs before first paint, so repeat visitors never see the boot overlay flash.
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("maxi:intro-seen")==="1")document.documentElement.classList.add("intro-seen")}catch(e){}`,
          }}
        />
        <noscript>
          <style>{`[data-char]{transform:none!important}[data-fade]{opacity:1!important}[data-intro]{display:none}`}</style>
        </noscript>
      </head>
      <body>
        <a href="#main" className="skip-link mono">
          Skip to content
        </a>
        <Background />
        <WebGLLayer />
        <SmoothScroll />
        <Nav />
        {children}
        <div aria-hidden className="grain" />
        <Cursor />
      </body>
    </html>
  );
}
