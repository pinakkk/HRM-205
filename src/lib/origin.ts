import { headers } from "next/headers";

/**
 * Returns the public origin of the current deployment by inspecting the
 * incoming request — works automatically on Cloudflare Workers, localhost,
 * and any preview URL without needing APP_URL/NEXT_PUBLIC_APP_URL set.
 *
 * Server-only (relies on next/headers). For client code, use window.location.origin.
 */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host") ?? h.get("host");
  const forwardedProto = h.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return "http://localhost:3000";
}
