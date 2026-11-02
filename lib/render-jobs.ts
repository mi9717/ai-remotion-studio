export type RenderJob = {
  id: string;
  status: "queued" | "rendering" | "completed" | "failed";
  progress: number;
  message: string;
  filePath?: string;
  filename?: string;
  error?: string;
  createdAt: number;
};

type RenderJobStore = Map<string, RenderJob>;
const globalForJobs = globalThis as typeof globalThis & { __aiRemotionRenderJobs?: RenderJobStore };
export const renderJobs = globalForJobs.__aiRemotionRenderJobs ?? new Map<string, RenderJob>();
globalForJobs.__aiRemotionRenderJobs = renderJobs;

export function cleanOldJobs() {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, job] of renderJobs) {
    if (job.createdAt < cutoff) renderJobs.delete(id);
  }
}
