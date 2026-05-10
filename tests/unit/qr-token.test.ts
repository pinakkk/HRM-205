import { describe, it, expect } from "vitest";
import { currentQrToken, verifyQrToken } from "@/lib/qr-token";

describe("qr token", () => {
  it("issues a token that verifies immediately", () => {
    const { token } = currentQrToken();
    expect(verifyQrToken(token)).toBe(true);
  });
  it("rejects garbage", () => {
    expect(verifyQrToken("not-a-token")).toBe(false);
    expect(verifyQrToken("")).toBe(false);
    expect(verifyQrToken("9999.deadbeefdeadbeef")).toBe(false);
  });
  it("rejects truncated signatures", () => {
    const { token } = currentQrToken();
    expect(verifyQrToken(token.slice(0, -2))).toBe(false);
  });
});
