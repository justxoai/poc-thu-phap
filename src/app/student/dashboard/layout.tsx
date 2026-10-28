import type { ReactNode } from "react";

import { logoutAction } from "@/app/minh-hong/actions";
import { AppShell, type AppNavGroup } from "@/components/app/AppShell";
import { Icon } from "@/components/ui/Icon";
import { ProfileAvatar } from "@/components/student/ProfileAvatar";
import { quickLoginAvailable } from "@/lib/firestore/quick-code";
import { getViewer } from "@/lib/session";

import "./sd.css";

function buildGroups(quickMissing: boolean): AppNavGroup[] {
  return [
  {
    items: [
      { id: "tong-quan", href: "/student/dashboard", label: "Tổng quan", icon: "home" },
      { id: "nop-bai", href: "/student/dashboard/nop-bai", label: "Nộp bài", icon: "pen" },
      { id: "vi", href: "/student/dashboard/vi", label: "Ví & giao dịch", icon: "gem" },
      { id: "don-hang", href: "/student/dashboard/don-hang", label: "Đơn đã đổi", icon: "gift" },
      { id: "trang-tri", href: "/student/dashboard/trang-tri", label: "Trang trí", icon: "flower" },
      { id: "ma-nhanh", href: "/student/dashboard/ma-nhanh", label: "Mã nhanh", icon: "lock", alert: quickMissing, alertLabel: "Chưa đặt mã nhanh" },
    ],
  },
  {
    label: "Đi tới",
    items: [
      { id: "nhiem-vu", href: "/nhiem-vu", label: "Nhiệm vụ", icon: "target" },
      { id: "giang-duong", href: "/giang-duong", label: "Giảng đường", icon: "temple" },
      { id: "xem-lai-video", href: "/xem-lai-video", label: "Xem lại video", icon: "video" },
      { id: "mau-lam-mo", href: "/mau-lam-mo", label: "Mẫu lâm mô", icon: "brush" },
      { id: "cho-phien", href: "/cho-phien", label: "Chợ phiên", icon: "bag" },
      { id: "bang-xep-hang", href: "/bang-xep-hang", label: "Bảng xếp hạng", icon: "trophy" },
    ],
  },
  ];
}

/**
 * Khung toàn màn hình của khu học viên (menu bên trái). Layout không đổi khi chuyển trang con nên chỉ đọc tên người dùng ở đây;
 * mỗi trang vẫn tự kiểm tra đăng nhập và tự đọc dữ liệu của mình.
 */
export default async function StudentDashboardLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  // Chưa đặt mã nhanh: chấm đỏ ở mục "Mã nhanh". Tài khoản quản trị không dùng mã nhanh; lỗi đọc thì không báo.
  const quick = viewer && viewer.role !== "admin" ? await quickLoginAvailable(viewer.studentId) : null;
  const quickMissing = quick !== null && quick.status === "ok" && !quick.data;
  return (
    <AppShell
      brand="Thanh Phong Thư Môn"
      subtitle="Khu học viên"
      topTitle="Dashboard"
      groups={buildGroups(quickMissing)}
      user={viewer ? { name: viewer.name || "Học viên", note: `Tổ ${viewer.group || "—"} · Khóa ${viewer.course || "—"}`, avatar: <ProfileAvatar name={viewer.name} decor={viewer.decor} size={36} /> } : { name: "Chưa đăng nhập", note: "Dùng nút Minh Hồng để đăng nhập" }}
      footer={
        viewer ? (
          <form action={logoutAction}>
            <button type="submit">
              <Icon name="logout" size={18} />
              <span>Đăng xuất</span>
            </button>
          </form>
        ) : null
      }
    >
      <div className="sd">{children}</div>
    </AppShell>
  );
}
