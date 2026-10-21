import type { ReactNode } from "react";

import { logoutAction } from "@/app/minh-hong/actions";
import { AppShell, type AppNavGroup } from "@/components/app/AppShell";
import { getViewer } from "@/lib/session";

import "./sd.css";

const GROUPS: AppNavGroup[] = [
  {
    items: [
      { id: "tong-quan", href: "/student/dashboard", label: "Tổng quan", icon: "🏠" },
      { id: "nop-bai", href: "/student/dashboard/nop-bai", label: "Nộp bài", icon: "✍️" },
      { id: "vi", href: "/student/dashboard/vi", label: "Ví & giao dịch", icon: "💎" },
      { id: "don-hang", href: "/student/dashboard/don-hang", label: "Đơn đã đổi", icon: "🎁" },
    ],
  },
  {
    label: "Đi tới",
    items: [
      { id: "nhiem-vu", href: "/nhiem-vu", label: "Nhiệm vụ", icon: "🎯" },
      { id: "giang-duong", href: "/giang-duong", label: "Giảng đường", icon: "🏯" },
      { id: "xem-lai-video", href: "/xem-lai-video", label: "Xem lại video", icon: "🎞️" },
      { id: "mau-lam-mo", href: "/mau-lam-mo", label: "Mẫu lâm mô", icon: "🖌️" },
      { id: "cho-phien", href: "/cho-phien", label: "Chợ phiên", icon: "🛍️" },
      { id: "bang-xep-hang", href: "/bang-xep-hang", label: "Bảng xếp hạng", icon: "🏆" },
    ],
  },
];

/**
 * Khung toàn màn hình của khu học viên (menu bên trái). Layout không đổi khi chuyển trang con nên chỉ đọc tên người dùng ở đây;
 * mỗi trang vẫn tự kiểm tra đăng nhập và tự đọc dữ liệu của mình.
 */
export default async function StudentDashboardLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  return (
    <AppShell
      brand="Thanh Phong Thư Môn"
      subtitle="Khu học viên"
      groups={GROUPS}
      user={viewer ? { name: viewer.name || "Học viên", note: `Tổ ${viewer.group || "—"} · Khóa ${viewer.course || "—"}` } : { name: "Chưa đăng nhập", note: "Dùng nút Minh Hồng để đăng nhập" }}
      footer={
        viewer ? (
          <form action={logoutAction}>
            <button type="submit">Đăng xuất</button>
          </form>
        ) : null
      }
    >
      <div className="sd">{children}</div>
    </AppShell>
  );
}
