import { ok } from "@/lib/http";
import { cacheInvalidate, cacheKeys } from "@/lib/redis";

export async function GET() {
  // Force the next /api/admin/audit/fairness call to recompute.
  await cacheInvalidate(cacheKeys.auditSummary());
  return ok({ status: "invalidated" });
}
