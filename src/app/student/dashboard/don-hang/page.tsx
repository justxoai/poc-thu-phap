import type { Metadata } from "next";
import Link from "next/link";

import { NeedLogin } from "@/components/student/dashboard/NeedLogin";
import { listStudentOrders } from "@/lib/firestore/ledger";
import { formatVnDateTime } from "@/lib/format";
import { gemLabel } from "@/lib/ledger-view";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Đơn đã đổi", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const viewer = await getViewer();
  if (!viewer) return <NeedLogin title="Đơn đã đổi" />;
  const orders = await listStudentOrders(viewer.studentId);
  return (
    <>
      <h1 className="page-title">Đơn đã đổi</h1>
      <section className="sd-card" aria-label="Đơn đổi quà">
        {orders.status !== "ok" ? <p className="notice">Chưa đọc được danh sách đơn. Vui lòng thử lại sau.</p> : null}
        {orders.status === "ok" && orders.data.length === 0 ? (
          <p className="notice">
            Bạn chưa đổi quà nào. Xem <Link href="/cho-phien">Chợ phiên</Link>.
          </p>
        ) : null}
        {orders.status === "ok" && orders.data.length > 0 ? (
          <div className="sd-wrap">
            <table className="sd-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Vật phẩm</th>
                  <th className="sd-num">SL</th>
                  <th className="sd-num">Giá</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.data.map((o) => (
                  <tr key={o.id}>
                    <td>{o.createdAt ? formatVnDateTime(o.createdAt) : "—"}</td>
                    <td>{o.itemName}</td>
                    <td className="sd-num">{o.quantity}</td>
                    <td className="sd-num">
                      {o.cost} {gemLabel(o.currency)}
                    </td>
                    <td>{o.status || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </>
  );
}
