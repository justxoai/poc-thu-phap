import type { Metadata } from "next";

import { RegisterAccountForm } from "@/components/account/RegisterAccountForm";
import { SidebarLayout } from "@/components/shell/SidebarLayout";

import "@/components/account/account.css";

export const metadata: Metadata = {
  title: "Tạo tài khoản",
  description: "Tạo tài khoản học viên Thanh Phong Thư Môn để nhận mã học viên, nộp bài và dùng các tính năng của lớp.",
};

export const dynamic = "force-static";

export default function CreateAccountPage() {
  return (
    <SidebarLayout>
      <div className="acc">
        <RegisterAccountForm />
      </div>
    </SidebarLayout>
  );
}
