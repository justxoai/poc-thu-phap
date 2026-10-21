import type { ReactNode } from "react";

import "./app-shell.css";

/** Màn hình toàn trang, nội dung căn giữa (đăng nhập, thông báo "đang đóng"). Không có menu. */
export function AppCenter({ children }: { children: ReactNode }) {
  return (
    <div className="ap-center">
      <div className="ap-center-card">{children}</div>
    </div>
  );
}
