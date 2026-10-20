import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const startUrl = req.nextUrl.searchParams.get("startUrl") || "/";

  const manifest = {
    name: "Fine 3D App",
    short_name: "Fine3D",
    description: "Fine 3D App",
    version: "1.0.0",
    start_url: startUrl,
    scope: startUrl,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#009687",
    icons: [
      { src: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { src: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { src: "/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { src: "/favicon-180x180.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-store",
    },
  });
}
