import { NextResponse } from "next/server";

import { listExhibition, parseExhibitionParams } from "@/lib/firestore/exhibition";

export const runtime = "nodejs";

/**
 * Trang tác phẩm triển lãm theo bộ lọc (khoa, to, sort, cursor). Dữ liệu dùng chung nên cho CDN lưu 60 giây:
 * nhiều người cùng lọc một điều kiện chỉ tốn một lượt đọc Firestore.
 */
export async function GET(request: Request) {
  const query = parseExhibitionParams(new URL(request.url).searchParams);
  const result = await listExhibition(query);
  if (result.status !== "ok") {
    return NextResponse.json(
      { error: result.status === "unconfigured" ? "unconfigured" : "failed" },
      { status: result.status === "unconfigured" ? 503 : 500, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(result.data, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
