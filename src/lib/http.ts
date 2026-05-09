import { NextResponse } from "next/server";

/**
 * RFC 7807 problem details — minimal helper.
 */
export function problem(
  status: number,
  title: string,
  detail?: string,
  extras?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      type: "about:blank",
      title,
      status,
      detail,
      ...extras,
    },
    { status, headers: { "content-type": "application/problem+json" } },
  );
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
