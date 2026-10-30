import type { Metadata } from "next";

import { NeedLogin } from "@/components/student/dashboard/NeedLogin";
import { DecorPicker } from "@/components/student/dashboard/DecorPicker";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Trang trí hồ sơ", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DecorPage() {
  const viewer = await getViewer();
  if (!viewer) return <NeedLogin title="Trang trí hồ sơ" />;
  return (
    <>
      <h1 className="page-title">Trang trí hồ sơ</h1>
      <section className="sd-card" aria-label="Chọn trang trí">
        <h2>Avatar, khung và nền</h2>
        <p>Chọn Avatar, Khung và Nền hồ sơ trong số những món bạn đã sở hữu (các món mới sẽ đổi ở Phiên chợ). Avatar nằm trong khung, cả hai nằm trên nền hồ sơ. Thay đổi hiện ở Dashboard và thanh bên.</p>
        <DecorPicker name={viewer.name} initial={viewer.decor} />
      </section>
    </>
  );
}
