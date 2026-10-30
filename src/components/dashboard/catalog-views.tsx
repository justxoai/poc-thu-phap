import Link from "next/link";

import { AdminDialog } from "@/components/dashboard/AdminDialog";
import { CatalogItemDialog, SeedCatalogButton } from "@/components/dashboard/CatalogParts";
import { PageSizeSelect } from "@/components/dashboard/ListControls";
import { Pager } from "@/components/dashboard/Pager";
import { PurchasesView, Result } from "@/components/dashboard/views";
import { Icon } from "@/components/ui/Icon";
import { adminHref, sliceMemoryPage, type PageInfo, type PageRequest } from "@/lib/admin-paging";
import { CATALOG_TEXT, type CatalogKind } from "@/lib/catalog";
import type { CatalogItem } from "@/lib/firestore/admin-catalog";
import { formatVnd } from "@/lib/format";
import type { DataResult, PurchaseKind, PurchaseRecord } from "@/lib/types";

/** Mua sách / Đặt ấn / Đăng ký khóa học / Tài liệu trả phí: mỗi mục có 2 tab "Danh sách bán" và "Người mua". Server Component. */

export type CatalogSub = "ban" | "mua";
export type CatalogDialog = { mode: "add" } | { mode: "edit"; item: DataResult<CatalogItem | null> };

export function parseSub(raw: string | undefined): CatalogSub {
  return raw === "mua" ? "mua" : "ban";
}

function SubTabs({ tab, sub, kind }: { tab: string; sub: CatalogSub; kind: CatalogKind }) {
  const t = CATALOG_TEXT[kind];
  return (
    <nav className="ad-tabs" aria-label="Chọn danh sách">
      <Link className="ad-tab" href={adminHref(tab, { sub: "ban" })} aria-current={sub === "ban" ? "page" : undefined} scroll={false}>
        {t.sale}
      </Link>
      <Link className="ad-tab" href={adminHref(tab, { sub: "mua" })} aria-current={sub === "mua" ? "page" : undefined} scroll={false}>
        {t.buyers}
      </Link>
    </nav>
  );
}

export function CatalogView({
  tab,
  kind,
  sub,
  req,
  catalog,
  dialog,
  buyers,
}: {
  tab: string;
  kind: CatalogKind;
  sub: CatalogSub;
  req: PageRequest;
  catalog: DataResult<CatalogItem[]> | null;
  dialog: CatalogDialog | null;
  buyers: DataResult<{ rows: PurchaseRecord[]; info: PageInfo }> | null;
}) {
  const t = CATALOG_TEXT[kind];
  const keepList = { sub, size: req.size };
  const closeHref = adminHref(tab, keepList);
  return (
    <>
      <SubTabs tab={tab} sub={sub} kind={kind} />

      {sub === "ban" && catalog ? (
        <section aria-label={t.sale}>
          <div className="ad-market-bar">
            <form method="get" action="/admin/dashboard" className="ad-bar">
              <input type="hidden" name="tab" value={tab} />
              <input type="hidden" name="sub" value="ban" />
              <PageSizeSelect value={req.size} />
            </form>
            <span className="ad-bar-actions">
              <SeedCatalogButton kind={kind} label={kind === "document" ? "Nạp tài liệu trả phí đã có" : "Nạp mục có sẵn"} />
              <Link className="ad-btn" href={adminHref(tab, { ...keepList, add: 1 })} scroll={false}>
                <Icon name="plus" size={16} /> {t.add}
              </Link>
            </span>
          </div>
          <Result result={catalog}>
            {(all) => {
              const page = sliceMemoryPage(all, req);
              return page.rows.length === 0 ? (
                <p className="dash-empty">{t.empty} Bấm “{t.add}” hoặc nạp các mục có sẵn.</p>
              ) : (
                <>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Tên</th>
                          <th>Mô tả</th>
                          <th className="num">Giá</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {page.rows.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.description || "—"}</td>
                            <td className="num">{item.price > 0 ? formatVnd(item.price) : "0đ"}</td>
                            <td>
                              <span className={item.active ? "dash-chip dash-chip-active" : "dash-chip dash-chip-danger"}>{item.active ? "Đang bán" : "Tạm ngưng"}</span>
                            </td>
                            <td>
                              <Link className="ad-icon-btn" href={adminHref(tab, { ...keepList, edit: item.id })} scroll={false} aria-label={`Sửa ${item.name}`} title="Sửa">
                                <Icon name="pen" size={17} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pager tab={tab} params={{ sub }} info={page.info} memory />
                </>
              );
            }}
          </Result>
          <p className="ad-hint">Danh mục này để thầy quản lý. Trang bán công khai chưa đọc từ đây: giá khi khách đặt vẫn tính theo bảng giá trong hệ thống.</p>
        </section>
      ) : null}

      {sub === "mua" && buyers ? (
        <section aria-label={t.buyers}>
          <form method="get" action="/admin/dashboard" className="ad-bar">
            <input type="hidden" name="tab" value={tab} />
            <input type="hidden" name="sub" value="mua" />
            <PageSizeSelect value={req.size} />
          </form>
          <Result result={buyers}>{(data) => <PurchasesView kind={kind as PurchaseKind} data={data} tab={tab} keep={{ sub: "mua" }} />}</Result>
        </section>
      ) : null}

      {dialog?.mode === "add" ? <CatalogItemDialog kind={kind} closeHref={closeHref} title={t.add} /> : null}
      {dialog?.mode === "edit" ? (
        <Result result={dialog.item}>
          {(item) =>
            item && item.kind === kind ? (
              <CatalogItemDialog key={item.id} kind={kind} closeHref={closeHref} item={item} title={t.add} />
            ) : (
              <AdminDialog title="Sửa mục" closeHref={closeHref} size="sm">
                <p className="dash-empty">Không tìm thấy mục này.</p>
              </AdminDialog>
            )
          }
        </Result>
      ) : null}
    </>
  );
}
