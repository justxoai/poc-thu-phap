import { NextResponse } from "next/server";

import { levelFor } from "@/data/gems";
import { getOwnContact } from "@/lib/firestore/accounts";
import { maskEmail, maskPhone } from "@/lib/mask";
import { getViewer } from "@/lib/session";

// Trang Đăng ký học (tĩnh) hỏi tài khoản đang đăng nhập ở đây. Chỉ trả dữ liệu của CHÍNH người có cookie; SĐT/email đã che bớt.
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ loggedIn: false }, { headers });
  const contact = await getOwnContact(viewer.studentId);
  const c = contact.status === "ok" ? contact.data : null;
  return NextResponse.json(
    {
      loggedIn: true,
      account: {
        code: viewer.studentId,
        name: viewer.name,
        group: viewer.group,
        course: viewer.course,
        rank: viewer.xp,
        level: levelFor(viewer.xp),
        phoneMasked: c ? maskPhone(c.phone) : "",
        emailMasked: c ? maskEmail(c.email) : "",
        hasContact: Boolean(c && c.phone && c.email),
      },
    },
    { headers },
  );
}
