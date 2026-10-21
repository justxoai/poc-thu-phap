import type { Metadata } from "next";

import { ClassLookup } from "@/components/class/ClassLookup";
import { SidebarLayout } from "@/components/shell/SidebarLayout";

export const metadata: Metadata = {
  title: "Tra cứu dành cho Ban Cán Sự lớp",
  description: "Tra cứu thông tin học tập của cả tổ bằng mã tra cứu dành cho Ban Cán Sự lớp.",
};

export const dynamic = "force-static";

export default function ClassLookupPage() {
  return (
    <SidebarLayout>
      <h1 className="page-title">Bảng tra cứu dành cho Ban Cán Sự lớp</h1>
      <ClassLookup />
    </SidebarLayout>
  );
}
