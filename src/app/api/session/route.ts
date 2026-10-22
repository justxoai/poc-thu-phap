import { NextResponse } from "next/server";

import { levelFor } from "@/data/gems";
import { getViewer } from "@/lib/session";

// Khung Minh Hồng hỏi trạng thái đăng nhập ở đây (không đặt cookies() trong layout để các trang vẫn tĩnh/ISR).
export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getViewer();
  const headers = { "Cache-Control": "no-store" };
  if (!viewer) return NextResponse.json({ loggedIn: false }, { headers });
  return NextResponse.json(
    {
      loggedIn: true,
      // Không trả mã học viên, mật khẩu, SĐT, email, địa chỉ.
      card: { name: viewer.name, group: viewer.group, course: viewer.course, rank: viewer.xp, level: levelFor(viewer.xp), role: viewer.role },
      paid: viewer.paid,
    },
    { headers },
  );
}
