import type { Metadata } from "next";

import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { StudentLookup } from "@/components/student/StudentLookup";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = {
  title: "Tra cứu hồ sơ học viên",
  description: "Tra cứu hồ sơ, điểm số, linh thạch và vật phẩm bằng Mã học viên.",
};

// Trang tĩnh; việc tra cứu chạy qua Server Action khi người dùng bấm nút.
export const dynamic = "force-static";

export default function StudentLookupPage() {
  return (
    <SidebarLayout>
      <PageBanner title="Tra cứu hồ sơ" />
      <StudentLookup hint="Nhập đúng Mã học viên để mở hồ sơ." />
    </SidebarLayout>
  );
}
