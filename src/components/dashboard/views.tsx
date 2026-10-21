import Link from "next/link";
import type { ReactNode } from "react";

import { formatScore, formatVnDateTime, formatVnd } from "@/lib/format";
import type { ClassRow, Overview, Paged, StudentRow } from "@/lib/firestore/admin-data";
import { MarketItemForm, OrderStatusForm, RestockForm } from "@/components/dashboard/AdminForms";
import type { DataResult, MarketItem, MarketOrder, PurchaseKind, PurchaseRecord } from "@/lib/types";

export const DASH_TABS = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "lop", label: "Lớp" },
  { id: "hoc-vien", label: "Học viên" },
  { id: "vi", label: "Ngọc & ví" },
  { id: "market", label: "Chợ phiên" },
  { id: "cham-bai", label: "Chấm bài" },
  { id: "tin-tuc", label: "Tin tức" },
  { id: "mua-sach", label: "Mua sách" },
  { id: "dat-an", label: "Đặt ấn" },
  { id: "khoa-hoc", label: "Đăng ký khóa học" },
  { id: "tai-lieu", label: "Tài liệu trả phí" },
] as const;

/** Menu bên trái của khu thầy: nhóm các mục theo công việc. Mọi mục là một DashTab. */
export const ADMIN_NAV: { label?: string; items: { id: DashTab; icon: string }[] }[] = [
  { items: [{ id: "tong-quan", icon: "🏠" }] },
  {
    label: "Học viên",
    items: [
      { id: "hoc-vien", icon: "🧑‍🎓" },
      { id: "lop", icon: "👥" },
      { id: "cham-bai", icon: "✅" },
      { id: "vi", icon: "💎" },
    ],
  },
  {
    label: "Chợ & nội dung",
    items: [
      { id: "market", icon: "🛍️" },
      { id: "tin-tuc", icon: "📰" },
    ],
  },
  {
    label: "Đơn hàng",
    items: [
      { id: "mua-sach", icon: "📚" },
      { id: "dat-an", icon: "🔖" },
      { id: "khoa-hoc", icon: "🎓" },
      { id: "tai-lieu", icon: "📄" },
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

function NextLink({ tab, cursorParam, cursor, extra }: { tab: DashTab; cursorParam: string; cursor: string | null; extra?: Record<string, string | null> }) {
  if (!cursor) return null;
  const params = new URLSearchParams({ tab, [cursorParam]: cursor });
  for (const [k, v] of Object.entries(extra ?? {})) if (v) params.set(k, v);
  return (
    <p className="dash-next">
      <Link href={`/admin/dashboard?${params.toString()}`}>Trang sau →</Link>
    </p>
  );
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

/* ---------- Lớp ---------- */

export function ClassesView({ rows }: { rows: ClassRow[] }) {
  if (rows.length === 0) return <Empty text="Chưa có lớp nào (collection classCodes trống)." />;
  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Khóa</th>
            <th>Tổ</th>
            <th>Mã tra cứu (cán sự)</th>
            <th className="num">Số học viên</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code}>
              <td>Khóa {row.course}</td>
              <td>Tổ {row.group}</td>
              <td>
                <code>{row.code}</code>
              </td>
              <td className="num">{row.members}</td>
              <td>
                <Link href={`/admin/dashboard?tab=hoc-vien&group=${encodeURIComponent(row.group)}&course=${encodeURIComponent(row.course)}`}>Xem học viên</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Học viên ---------- */

export function StudentsView({ page, group, course }: { page: Paged<StudentRow>; group: string | null; course: string | null }) {
  return (
    <>
      <form method="get" action="/admin/dashboard" className="dash-filter">
        <input type="hidden" name="tab" value="hoc-vien" />
        <label>
          Khóa <input name="course" defaultValue={course ?? ""} maxLength={10} size={4} />
        </label>
        <label>
          Tổ <input name="group" defaultValue={group ?? ""} maxLength={10} size={4} />
        </label>
        <button type="submit">Lọc</button>
        {group || course ? <Link href="/admin/dashboard?tab=hoc-vien">Bỏ lọc</Link> : null}
      </form>
      {page.rows.length === 0 ? (
        <Empty text="Không có học viên phù hợp." />
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Họ và tên</th>
                <th>Khóa</th>
                <th>Tổ</th>
                <th>Ví</th>
                <th className="num">Số bài</th>
                <th className="num">Điểm TB</th>
                <th>Bài gần nhất</th>
                <th>Hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {page.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <code>{row.id}</code>
                  </td>
                  <td>{row.name}</td>
                  <td>{row.course}</td>
                  <td>{row.group}</td>
                  <td>
                    {Object.entries(row.wallet)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(" · ") || "—"}
                  </td>
                  <td className="num">{row.submissionCount}</td>
                  <td className="num">{row.average ? formatScore(row.average) : "—"}</td>
                  <td>{row.lastSubmittedAt ? formatVnDateTime(row.lastSubmittedAt) : "—"}</td>
                  <td>
                    <span className={`dash-chip dash-chip-${row.activity.level}`}>{row.activity.text}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <NextLink tab="hoc-vien" cursorParam="after" cursor={page.nextCursor} extra={{ group, course }} />
    </>
  );
}

/* ---------- Đơn mua sách / khóa học / tài liệu ---------- */

export function PurchasesView({ kind, page, tab }: { kind: PurchaseKind; page: Paged<PurchaseRecord>; tab: DashTab }) {
  const emptyText = {
    book: "Chưa có đơn mua sách.",
    course: "Chưa có đăng ký khóa học.",
    document: "Chưa có đơn mua tài liệu (collection purchases, kind = document).",
    seal: "Chưa có đơn đặt ấn.",
  }[kind];
  if (page.rows.length === 0) return <Empty text={emptyText} />;
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
            {page.rows.map((row) => (
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
      <NextLink tab={tab} cursorParam="cursor" cursor={page.nextCursor} />
    </>
  );
}

/* ---------- Chợ phiên ---------- */

export function MarketView({ items, orders, canWrite = false }: { items: DataResult<MarketItem[]>; orders: DataResult<Paged<MarketOrder>>; canWrite?: boolean }) {
  return (
    <>
      {canWrite ? (
        <details className="dash-details">
          <summary>Thêm vật phẩm mới</summary>
          <MarketItemForm />
        </details>
      ) : null}
      <h2 className="dash-h2">Vật phẩm đang bán</h2>
      <Result result={items}>
        {(list) =>
          list.length === 0 ? (
            <Empty text="Chưa có vật phẩm (collection market trống)." />
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Vật phẩm</th>
                    <th className="num">Giá</th>
                    <th className="num">Tồn kho</th>
                    <th>Trạng thái</th>
                    {canWrite ? <th>Nhập kho</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.name}
                        {canWrite ? (
                          <details className="dash-details">
                            <summary>Sửa</summary>
                            <MarketItemForm item={item} />
                          </details>
                        ) : null}
                      </td>
                      <td className="num">
                        {item.price} {item.currency}
                      </td>
                      <td className="num">{item.stock}</td>
                      <td>
                        <span className={item.active ? "dash-chip dash-chip-active" : "dash-chip dash-chip-danger"}>{item.active ? "Đang bán" : "Tạm ngưng"}</span>
                      </td>
                      {canWrite ? (
                        <td>
                          <RestockForm id={item.id} />
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Result>

      <h2 className="dash-h2">Lịch sử mua hàng tại Chợ phiên</h2>
      <Result result={orders}>
        {(page) =>
          page.rows.length === 0 ? (
            <Empty text="Chưa có lượt đổi quà nào (collection orders trống)." />
          ) : (
            <>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Học viên</th>
                      <th>Vật phẩm</th>
                      <th className="num">SL</th>
                      <th className="num">Chi phí</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.createdAt ? formatVnDateTime(row.createdAt) : "—"}</td>
                        <td>
                          {row.studentName || "—"} <small>({row.studentId})</small>
                        </td>
                        <td>{row.itemName || "—"}</td>
                        <td className="num">{row.quantity}</td>
                        <td className="num">
                          {row.cost} {row.currency}
                        </td>
                        <td>{canWrite ? <OrderStatusForm id={row.id} status={row.status} /> : row.status || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <NextLink tab="market" cursorParam="cursor" cursor={page.nextCursor} />
            </>
          )
        }
      </Result>
    </>
  );
}
