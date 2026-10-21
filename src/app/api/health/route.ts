import { NextResponse } from "next/server";

import { missingAdminEnv, missingWebEnv } from "@/lib/firebase/config";

// Chỉ báo biến môi trường đã đủ hay chưa. Không đọc Firestore (tránh tốn lượt đọc nếu bị gọi dồn dập).
export const dynamic = "force-dynamic";

export function GET() {
  const web = missingWebEnv();
  const admin = missingAdminEnv();

  return NextResponse.json(
    {
      ok: web.length === 0 && admin.length === 0,
      web: { configured: web.length === 0, missing: web },
      admin: { configured: admin.length === 0, missing: admin },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
