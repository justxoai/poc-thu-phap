import type { Metadata } from "next";

import { ClassLookup } from "@/components/class/ClassLookup";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = {
  title: "Tra cứu dành cho Ban Cán Sự lớp",
  description: "Tra cứu thông tin học tập của cả tổ bằng mã tra cứu dành cho Ban Cán Sự lớp.",
};

export const dynamic = "force-static";

export default function ClassLookupPage() {
  return (
    <SidebarLayout>
      <PageBanner title="Tra cứu cán sự lớp" />
      <ClassLookup />
    </SidebarLayout>
  );
}
