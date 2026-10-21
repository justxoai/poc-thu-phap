import type { Metadata } from "next";
import Link from "next/link";

import { NeedLogin } from "@/components/student/dashboard/NeedLogin";
import { listTransactions } from "@/lib/firestore/ledger";
import { getStudentProfile } from "@/lib/firestore/students";
import { formatVnDateTime } from "@/lib/format";
import { gemLabel, sourceLabel, walletLines } from "@/lib/ledger-view";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Ví & giao dịch", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Số dư và sổ cái của CHÍNH người đăng nhập. Mã học viên lấy từ phiên; tham số `cursor` chỉ là mốc phân trang. */
export default async function WalletPage({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await getViewer();
  if (!viewer) return <NeedLogin title="Ví & giao dịch" />;
  const raw = (await searchParams).cursor;
  const cursor = typeof raw === "string" ? raw : null;
  const [profile, ledger] = await Promise.all([getStudentProfile(viewer.studentId), listTransactions(viewer.studentId, cursor)]);
  const wallet = profile.status === "ok" && profile.data ? walletLines(profile.data.wallet) : null;

  return (
    <>
      <h1 className="page-title">Ví & giao dịch</h1>
      <section className="sd-card" aria-label="Số dư">
        <h2>Số dư</h2>
        {wallet ? (
          <>
            <ul className="sd-gems">
              {wallet.lines.map((line) => (
                <li key={line.key}>
                  {line.label}
                  <b>{line.amount}</b>
                </li>
              ))}
            </ul>
            <p>Tổng tài sản quy đổi: {wallet.wealth} Hoàng Ngọc</p>
          </>
        ) : (
          <p className="notice">Chưa đọc được ví. Vui lòng thử lại sau.</p>
        )}
      </section>

      <section className="sd-card" aria-label="Lịch sử giao dịch">
        <h2>Lịch sử giao dịch</h2>
        {ledger.status === "ok" && ledger.data.rows.length === 0 ? <p className="notice">Chưa có giao dịch nào.</p> : null}
        {ledger.status !== "ok" ? <p className="notice">Chưa đọc được lịch sử. Vui lòng thử lại sau.</p> : null}
        {ledger.status === "ok" && ledger.data.rows.length > 0 ? (
          <div className="sd-wrap">
            <table className="sd-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Nguồn</th>
                  <th>Loại ngọc</th>
                  <th className="sd-num">Thay đổi</th>
                  <th className="sd-num">Số dư sau</th>
                </tr>
              </thead>
              <tbody>
                {ledger.data.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.createdAt ? formatVnDateTime(row.createdAt) : "—"}</td>
                    <td>
                      {sourceLabel(row.source)}
                      {row.note ? <div className="sd-hint">{row.note}</div> : null}
                    </td>
                    <td>{gemLabel(row.currency)}</td>
                    <td className={`sd-num ${row.amount >= 0 ? "sd-plus" : "sd-minus"}`}>{row.amount > 0 ? `+${row.amount}` : row.amount}</td>
                    <td className="sd-num">{row.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {ledger.status === "ok" && ledger.data.nextCursor ? (
          <p>
            <Link href={`/student/dashboard/vi?cursor=${encodeURIComponent(ledger.data.nextCursor)}`}>Xem các giao dịch cũ hơn →</Link>
          </p>
        ) : null}
      </section>
    </>
  );
}
