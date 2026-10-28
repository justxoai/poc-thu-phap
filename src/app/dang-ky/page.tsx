import type { Metadata } from "next";

import { RegisterAccountForm } from "@/components/account/RegisterAccountForm";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { PageBanner } from "@/components/ui/PageBanner";

import "@/components/account/account.css";

export const metadata: Metadata = {
  title: "Tạo tài khoản",
  description: "Tạo tài khoản học viên Thanh Phong Thư Môn để nhận mã học viên, nộp bài và dùng các tính năng của lớp.",
};

export const dynamic = "force-static";

export default function CreateAccountPage() {
  return (
    <SidebarLayout>
      <PageBanner title="Tạo tài khoản" lead="Tạo tài khoản học viên để nhận mã học viên, nộp bài và dùng các tính năng của lớp." />
      <div className="acc">
        <RegisterAccountForm hideHeading />
      </div>
    </SidebarLayout>
  );
}
