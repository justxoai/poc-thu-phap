import type { Metadata } from "next";

import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { MarketPanel } from "@/components/student/MarketPanel";
import { StudentLookup } from "@/components/student/StudentLookup";

export const metadata: Metadata = {
  title: "Tra cứu hồ sơ học viên",
  description: "Tra cứu hồ sơ, điểm số, linh thạch, vật phẩm và Chợ phiên bằng Mã học viên.",
};

// Trang tĩnh; việc tra cứu chạy qua Server Action khi người dùng bấm nút.
export const dynamic = "force-static";

export default function StudentLookupPage() {
  return (
    <SidebarLayout>
      <h1 className="page-title">Hồ sơ học viên</h1>
      <p className="page-lead">Tra cứu hồ sơ, linh thạch, vật phẩm và Chợ phiên.</p>
      <StudentLookup title="Tra cứu hồ sơ" hint="Nhập đúng Mã học viên để mở hồ sơ." />
      <MarketPanel />
    </SidebarLayout>
  );
}
