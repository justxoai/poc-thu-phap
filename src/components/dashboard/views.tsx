import Link from "next/link";
import type { ReactNode } from "react";

import { Pager } from "@/components/dashboard/Pager";
import type { PageInfo } from "@/lib/admin-paging";
import { formatVnDateTime, formatVnd } from "@/lib/format";
import type { Overview } from "@/lib/firestore/admin-data";
import type { IconName } from "@/components/ui/Icon";
import type { DataResult, PurchaseKind, PurchaseRecord } from "@/lib/types";

export const DASH_TABS = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "lop", label: "Lớp" },
  { id: "hoc-vien", label: "Học viên" },
  { id: "hoc-vien-moi", label: "Học viên mới" },
  { id: "vi", label: "Ngọc & ví" },
  { id: "market", label: "Chợ phiên" },
  { id: "tin-tuc", label: "Tin tức" },
  { id: "mua-sach", label: "Mua sách" },
  { id: "dat-an", label: "Đặt ấn" },
  { id: "khoa-hoc", label: "Đăng ký khóa học" },
  { id: "tai-lieu", label: "Tài liệu trả phí" },
] as const;

/** Menu bên trái của khu thầy: nhóm các mục theo công việc. Mọi mục là một DashTab. */
export const ADMIN_NAV: { label?: string; items: { id: DashTab; icon: IconName }[] }[] = [
  { items: [{ id: "tong-quan", icon: "home" }] },
  {
    label: "Học viên",
    items: [
      { id: "hoc-vien-moi", icon: "user" },
      { id: "hoc-vien", icon: "graduation" },
      { id: "lop", icon: "users" },
      { id: "vi", icon: "gem" },
    ],
  },
  {
    label: "Chợ & nội dung",
    items: [
      { id: "market", icon: "bag" },
      { id: "tin-tuc", icon: "news" },
    ],
  },
  {
    label: "Đơn hàng",
    items: [
      { id: "mua-sach", icon: "book" },
      { id: "dat-an", icon: "bookmark" },
      { id: "khoa-hoc", icon: "graduation" },
      { id: "tai-lieu", icon: "file" },
    ],
  },
];

export type DashTab = (typeof DASH_TABS)[number]["id"];

export function parseTab(value: string | undefined): DashTab {
  return DASH_TABS.find((t) => t.id === value)?.id ?? "tong-quan";
}

export const KIND_OF_TAB: Partial<Record<DashTab, PurchaseKind>> = {
  "mua-sach": "book",
  "dat-an": "seal",
  "khoa-hoc": "course",
  "tai-lieu": "document",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  confirmed: "Đã xác nhận",
  paid: "Đã thanh toán",
  shipped: "Đã gửi",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
};

const DISCOUNT_LABEL: Record<string, string> = { student: "Học viên −20%", early: "Đăng ký sớm −10%", none: "Giá bìa" };

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? (status || "—");
}

/** Hiển thị một DataResult: thông báo khi chưa kết nối/lỗi, hoặc gọi `children` khi có dữ liệu. */
export function Result<T>({ result, children }: { result: DataResult<T>; children: (data: T) => ReactNode }) {
  if (result.status === "unconfigured") return <p className="dash-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p>;
  if (result.status === "error") return <p className="dash-notice dash-notice-error">Chưa đọc được dữ liệu. Vui lòng thử lại.</p>;
  return <>{children(result.data)}</>;
}

function Empty({ text }: { text: string }) {
  return <p className="dash-empty">{text}</p>;
}

/* ---------- Tổng quan ---------- */

export function OverviewView({ data }: { data: Overview }) {
  const cards: { label: string; value: number; tab: DashTab }[] = [
    { label: "Học viên", value: data.students, tab: "hoc-vien" },
    { label: "Lớp (mã tra cứu)", value: data.classes, tab: "lop" },
    { label: "Vật phẩm Chợ phiên", value: data.marketItems, tab: "market" },
    { label: "Lượt đổi quà", value: data.marketOrders, tab: "market" },
    { label: "Đơn mua sách", value: data.book, tab: "mua-sach" },
    { label: "Đơn đặt ấn", value: data.seal, tab: "dat-an" },
    { label: "Đăng ký khóa học", value: data.course, tab: "khoa-hoc" },
    { label: "Mua tài liệu", value: data.document, tab: "tai-lieu" },
  ];
  return (
    <ul className="dash-cards">
      {cards.map((card) => (
        <li key={card.label}>
          <Link href={`/admin/dashboard?tab=${card.tab}`}>
            <strong>{new Intl.NumberFormat("vi-VN").format(card.value)}</strong>
            <span>{card.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Đơn mua sách / khóa học / tài liệu ---------- */

export function PurchasesView({ kind, data, tab, keep }: { kind: PurchaseKind; data: { rows: PurchaseRecord[]; info: PageInfo }; tab: string; keep: Record<string, string | null | undefined> }) {
  const { rows, info } = data;
  const emptyText = {
    book: "Chưa có đơn mua sách.",
    course: "Chưa có đăng ký khóa học.",
    document: "Chưa có đơn mua tài liệu (collection purchases, kind = document).",
    seal: "Chưa có đơn đặt ấn.",
  }[kind];
  if (rows.length === 0) return <Empty text={emptyText} />;
  return (
    <>
      <p className="dash-privacy">Chứa dữ liệu cá nhân của khách. Không chụp màn hình hoặc chia sẻ ra ngoài.</p>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Họ và tên</th>
              <th>Điện thoại</th>
              {kind === "course" ? <th>Email</th> : null}
              {kind === "course" ? <th>Zalo</th> : null}
              {kind === "book" || kind === "seal" ? <th>Địa chỉ</th> : null}
              <th>{kind === "course" ? "Khóa · Gói" : kind === "seal" ? "Các con ấn" : "Sản phẩm"}</th>
              {kind !== "course" ? <th className="num">{kind === "seal" ? "Số ấn" : "SL"}</th> : null}
              {kind === "book" ? <th>Ưu đãi</th> : null}
              <th className="num">Thành tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.createdAt ? formatVnDateTime(row.createdAt) : "—"}</td>
                <td>{row.name}</td>
                <td>{row.phone}</td>
                {kind === "course" ? <td>{row.email || "—"}</td> : null}
                {kind === "course" ? <td>{row.zalo || "—"}</td> : null}
                {kind === "book" || kind === "seal" ? <td>{row.address || "—"}</td> : null}
                <td className={kind === "seal" ? "dash-pre" : undefined}>
                  {row.item || "—"}
                  {kind === "seal" && row.note ? (
                    <>
                      <br />
                      <small>Ghi chú: {row.note}</small>
                    </>
                  ) : null}
                </td>
                {kind !== "course" ? <td className="num">{row.quantity}</td> : null}
                {kind === "book" ? (
                  <td>
                    {row.discount ? DISCOUNT_LABEL[row.discount] : "—"}
                    {row.promoCode ? (
                      <>
                        <br />
                        <small>mã: {row.promoCode}</small>
                      </>
                    ) : null}
                  </td>
                ) : null}
                <td className="num">{row.total > 0 ? formatVnd(row.total) : "0đ"}</td>
                <td>
                  <span className={`dash-chip dash-chip-status-${row.status}`}>{statusLabel(row.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager tab={tab} params={keep} info={info} />
    </>
  );
}

