import { NextResponse } from "next/server";
import { renderJobs } from "@/lib/render-jobs";
import { readFile } from "node:fs/promises";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  const job = renderJobs.get(jobId);
  if (!job || job.status !== "completed" || !job.filePath) {
    return NextResponse.json({ error: "Rendered video is not available." }, { status: 404 });
  }
  try {
    const video = await readFile(job.filePath);
    return new NextResponse(new Uint8Array(video), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${job.filename || "ai-remotion.mp4"}"`,
        "Content-Length": String(video.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Rendered video file is no longer available." }, { status: 404 });
  }
}
