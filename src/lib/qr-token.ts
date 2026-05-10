import { createHmac, timingSafeEqual } from "node:crypto";

const WINDOW_SECONDS = 5 * 60;

function secret(): string {
  return (
    process.env.QR_ATTENDANCE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "dev-only-qr-secret"
  );
}

function bucket(now = Date.now()): number {
  return Math.floor(now / 1000 / WINDOW_SECONDS);
}

function sign(b: number): string {
  return createHmac("sha256", secret()).update(`qr:${b}`).digest("hex").slice(0, 16);
}

export function currentQrToken(): { token: string; expiresAt: number } {
  const b = bucket();
  const expiresAt = (b + 1) * WINDOW_SECONDS * 1000;
  return { token: `${b}.${sign(b)}`, expiresAt };
}

/** Verify a token. Accepts the current bucket and the previous one (grace). */
export function verifyQrToken(token: string): boolean {
  const [bStr, sig] = token.split(".");
  if (!bStr || !sig) return false;
  const b = Number(bStr);
  if (!Number.isFinite(b)) return false;
  const now = bucket();
  if (b !== now && b !== now - 1) return false;
  const expected = sign(b);
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}
