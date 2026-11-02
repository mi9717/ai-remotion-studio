import { NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { AnimationProjectSchema } from "@/lib/animation-schema";
import path from "node:path";
import os from "node:os";
import { mkdtemp, readFile, rm } from "node:fs/promises";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  let workDir = "";
  try {
    const body = await request.json();
    const parsed = AnimationProjectSchema.safeParse(body?.project);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid animation project." }, { status: 400 });
    }
    const project = parsed.data;
    workDir = await mkdtemp(path.join(os.tmpdir(), "ai-remotion-"));
    const serveUrl = await bundle({
      entryPoint: path.resolve(process.cwd(), "remotion/index.ts"),
      outDir: path.join(workDir, "bundle"),
      publicDir: path.resolve(process.cwd(), "public"),
    });
    const inputProps = { project };
    const composition = await selectComposition({ serveUrl, id: "StockAnimation", inputProps });
    const outputLocation = path.join(workDir, "animation.mp4");
    await renderMedia({
      composition, serveUrl, codec: "h264", outputLocation, inputProps,
      crf: 18, pixelFormat: "yuv420p", concurrency: 2,
    });
    const video = await readFile(outputLocation);
    return new NextResponse(new Uint8Array(video), {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "attachment; filename=\"ai-remotion-studio.mp4\"",
        "Content-Length": String(video.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("MP4 render failed:", error);
    return NextResponse.json({ error: "MP4 export failed. Check the terminal for the technical error, then try again." }, { status: 500 });
  } finally {
    if (workDir) await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
