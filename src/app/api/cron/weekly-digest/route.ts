import { ok } from "@/lib/http";

export async function GET() {
  // TODO: Phase 5 — query weekly ledger deltas and dispatch via Resend.
  return ok({ status: "noop" });
}
