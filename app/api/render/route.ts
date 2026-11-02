import { NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { AnimationProjectSchema } from "@/lib/animation-schema";
import { cleanOldJobs, renderJobs } from "@/lib/render-jobs";
import path from "node:path";
import os from "node:os";
import { mkdtemp, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const maxDuration = 300;

let serveUrlPromise: Promise<string> | undefined;
function getServeUrl(): Promise<string> {
  if (!serveUrlPromise) {
    serveUrlPromise = (async () => {
      const bundleDir = await mkdtemp(path.join(os.tmpdir(), "ai-remotion-bundle-"));
      return bundle({
        entryPoint: path.resolve(process.cwd(), "remotion/index.ts"),
        outDir: bundleDir,
        publicDir: path.resolve(process.cwd(), "public"),
      });
    })().catch((error) => {
      serveUrlPromise = undefined;
      throw error;
    });
  }
  return serveUrlPromise;
}

async function runRender(jobId: string, project: ReturnType<typeof AnimationProjectSchema.parse>, quality: "draft" | "standard" | "high") {
  let workDir = "";
  const job = renderJobs.get(jobId);
  if (!job) return;
  try {
    job.status = "rendering";
    job.message = "Preparing Remotion renderer...";
    workDir = await mkdtemp(path.join(os.tmpdir(), "ai-remotion-export-"));
    const serveUrl = await getServeUrl();
    const inputProps = { project };
    const composition = await selectComposition({ serveUrl, id: "StockAnimation", inputProps });
    const settings = {
      draft: { scale: 2 / 3, crf: 28 },
      standard: { scale: 1, crf: 23 },
      high: { scale: 1, crf: 18 },
    } as const;
    const outputLocation = path.join(workDir, "animation.mp4");
    await renderMedia({
      composition, serveUrl, codec: "h264", outputLocation, inputProps,
      crf: settings[quality].crf, scale: settings[quality].scale,
      pixelFormat: "yuv420p", concurrency: 2,
      onProgress: ({ progress }) => {
        const current = renderJobs.get(jobId);
        if (current) {
          current.progress = Math.max(1, Math.min(99, Math.round(progress * 100)));
          current.message = "Rendering video frames...";
        }
      },
    });
    const finalPath = path.join(os.tmpdir(), `ai-remotion-${jobId}.mp4`);
    const { copyFile } = await import("node:fs/promises");
    await copyFile(outputLocation, finalPath);
    const current = renderJobs.get(jobId);
    if (current) {
      current.status = "completed";
      current.progress = 100;
      current.message = "Video ready to download.";
      current.filePath = finalPath;
      current.filename = `ai-remotion-${quality}.mp4`;
    }
  } catch (error) {
    console.error("MP4 render failed:", error);
    const current = renderJobs.get(jobId);
    if (current) {
      current.status = "failed";
      current.message = "Export failed.";
      current.error = "MP4 export failed. Check the terminal for the technical error, then try again.";
    }
  } finally {
    if (workDir) await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function POST(request: Request) {
  try {
    cleanOldJobs();
    const body = await request.json();
    const parsed = AnimationProjectSchema.safeParse(body?.project);
    if (!parsed.success) return NextResponse.json({ error: "Invalid animation project." }, { status: 400 });
    const quality = ["draft", "standard", "high"].includes(body?.quality) ? body.quality as "draft" | "standard" | "high" : "draft";
    const jobId = randomUUID();
    renderJobs.set(jobId, {
      id: jobId, status: "queued", progress: 0,
      message: "Export queued...", createdAt: Date.now(),
    });
    void runRender(jobId, parsed.data, quality);
    return NextResponse.json({ jobId }, { status: 202 });
  } catch (error) {
    console.error("Could not start MP4 export:", error);
    return NextResponse.json({ error: "Could not start MP4 export." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const jobId = new URL(request.url).searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
  const job = renderJobs.get(jobId);
  if (!job) return NextResponse.json({ error: "Render job not found or expired." }, { status: 404 });
  return NextResponse.json({
    jobId: job.id, status: job.status, progress: job.progress,
    message: job.message, error: job.error,
    downloadUrl: job.status === "completed" ? `/api/render/download/${job.id}` : undefined,
  });
}
