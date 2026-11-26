import { adsConfig } from "@/lib/ads";

export const dynamic = "force-static";

export function GET() {
  const lines = ["# ads.txt for VideoDrop"];

  if (adsConfig.client) {
    const publisherId = adsConfig.client.replace(/^ca-/, "");
    lines.push(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`);
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
