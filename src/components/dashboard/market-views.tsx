import Image from "next/image";
import Link from "next/link";

import { AdminDialog } from "@/components/dashboard/AdminDialog";
import { OrderStatusForm, RestockForm } from "@/components/dashboard/AdminForms";
import { PageSizeSelect } from "@/components/dashboard/ListControls";
import { MarketItemDialog } from "@/components/dashboard/MarketParts";
import { Pager } from "@/components/dashboard/Pager";
import { Result } from "@/components/dashboard/views";
import { Icon } from "@/components/ui/Icon";
import { findRarity } from "@/data/gems";
import { ITEM_IMAGES } from "@/data/item-images";
import { MERCHANTS, findMerchant, type Merchant } from "@/data/merchants";
import { adminHref, type PageInfo } from "@/lib/admin-paging";
import type { MarketHistoryParams } from "@/lib/firestore/admin-market";
import { formatVnDateTime } from "@/lib/format";
import { orderCode, salePrice } from "@/lib/market-price";
import type { DataResult, MarketItem, MarketOrder } from "@/lib/types";

import "@/components/market/merchant-market.css";

/** Khu Chợ phiên của thầy: chọn thương nhân -> xem/thêm/sửa vật phẩm họ bán; bên dưới là Lịch sử mua hàng. Server Component. */

export type MarketDialog = { mode: "add" } | { mode: "edit"; item: DataResult<MarketItem | null> };

const TAB = "market";
const NONE = "none";

function Figure({ merchant }: { merchant: Merchant }) {
  return (
    <span className="mm-figure">
      <Image src={merchant.image} alt="" width={merchant.imageWidth} height={merchant.imageHeight} sizes="(max-width: 700px) 30vw, 220px" className="mm-figure-img" />
    </span>
  );
}

function MerchantCard({ merchant, count, href, stage = false }: { merchant: Merchant; count: number; href: string; stage?: boolean }) {
  const body = (
    <>
      <Figure merchant={merchant} />
      <span className="mm-card-text">
        <span className="mm-name">{merchant.name}</span>
        <span className="mm-shop">{merchant.shop}</span>
        <span className="mm-count">{count} vật phẩm</span>
      </span>
    </>
  );
  return stage ? (
    <div className="mm-card is-stage" aria-current="true">
      {body}
    </div>
  ) : (
    <Link className="mm-card" href={href} scroll={false} aria-label={`Xem quầy của ${merchant.name}: ${count} vật phẩm`}>
      {body}
    </Link>
  );
}

function ItemCard({ item, keep }: { item: MarketItem; keep: Record<string, string | null | undefined> }) {
  const rarity = findRarity(item.rarity);
  const sale = salePrice(item.price, item.promo, item.promoPercent);
  return (
    <li className={item.active ? "mm-item" : "mm-item is-off"}>
      <span className="mm-item-art">
        {item.image ? <Image src={item.image} alt="" width={160} height={160} /> : <Icon name="bag" size={34} />}
      </span>
      <span className="mm-item-name">{item.name}</span>
      <span className="ad-item-meta">
        {rarity ? <span className="ad-rarity">{rarity.name}</span> : null}
        {item.promo ? <span className="ad-badge">-{item.promoPercent}%</span> : null}
        {!item.active ? <span>Tạm ngưng</span> : null}
      </span>
      <span className="ad-price">
        <span>
          {sale} {item.currency}
        </span>
        {item.promo ? <s>{item.price}</s> : null}
      </span>
      {item.description ? <p className="ad-item-desc">{item.description}</p> : null}
      <span className="ad-item-meta">{item.stock === null ? "Không giới hạn" : `Còn ${item.stock}`}</span>
      <span className="ad-item-actions">
        <Link className="ad-icon-btn" href={adminHref(TAB, { ...keep, edit: item.id })} scroll={false} aria-label={`Sửa ${item.name}`} title="Sửa">
          <Icon name="pen" size={17} />
        </Link>
        {item.stock !== null ? <RestockForm id={item.id} /> : null}
      </span>
    </li>
  );
}

export function MarketView({ items, selected, dialog, history, historyParams }: { items: DataResult<MarketItem[]>; selected: string | null; dialog: MarketDialog | null; history: DataResult<{ rows: MarketOrder[]; info: PageInfo }>; historyParams: MarketHistoryParams }) {
  const histKeep = { fm: historyParams.merchant, fs: historyParams.student, size: historyParams.size };
  const keep: Record<string, string | null | undefined> = { merchant: selected, fm: historyParams.merchant, fs: historyParams.student, size: String(historyParams.size) };
  const closeHref = adminHref(TAB, keep);
  const merchantOptions = MERCHANTS.map((m) => ({ id: m.id, name: m.name }));
  const stall = selected && selected !== NONE ? findMerchant(selected) : null;

  return (
    <>
      <Result result={items}>
        {(list) => {
          const countOf = (id: string) => list.filter((i) => i.merchantId === id).length;
          const unassigned = list.filter((i) => i.merchantId === "");
          const shown = stall ? list.filter((i) => i.merchantId === stall.id) : selected === NONE ? unassigned : [];
          const others = MERCHANTS.filter((m) => m.id !== stall?.id);
          return (
            <>
              <div className="ad-market-bar">
                <p>{stall ? `Quầy của ${stall.name}: ${shown.length} vật phẩm.` : selected === NONE ? `${unassigned.length} vật phẩm chưa gán thương nhân.` : `${MERCHANTS.length} thương nhân, ${list.length} vật phẩm. Chọn một thương nhân để xem quầy hàng.`}</p>
                <Link className="ad-btn" href={adminHref(TAB, { ...keep, add: 1 })} scroll={false}>
                  <Icon name="plus" size={16} /> Thêm vật phẩm
                </Link>
              </div>

              {stall ? (
                <section className="mm-stage" aria-label={`Quầy hàng của ${stall.name}`}>
                  <div className="mm-stage-left">
                    <MerchantCard merchant={stall} count={shown.length} href="" stage />
                  </div>
                  <div className="mm-stage-right">
                    <p className="mm-quote">{stall.greeting}</p>
                    <div className="mm-items-head">
                      <h2>Vật phẩm đang bán của {stall.name}</h2>
                      <Link className="mm-close" href={adminHref(TAB, histKeep)} scroll={false}>
                        <Icon name="close" size={16} /> Thu quầy
                      </Link>
                    </div>
                    {shown.length === 0 ? (
                      <p className="dash-empty">Quầy này chưa có vật phẩm. Bấm “Thêm vật phẩm” để bắt đầu.</p>
                    ) : (
                      <ul className="mm-items ad-items">
                        {shown.map((item) => (
                          <ItemCard key={item.id} item={item} keep={keep} />
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ) : null}

              {selected === NONE ? (
                <section aria-label="Vật phẩm chưa gán thương nhân">
                  <div className="mm-items-head">
                    <h2>Vật phẩm chưa gán thương nhân</h2>
                    <Link className="mm-close" href={adminHref(TAB, histKeep)} scroll={false}>
                      <Icon name="close" size={16} /> Đóng
                    </Link>
                  </div>
                  {unassigned.length === 0 ? (
                    <p className="dash-empty">Không còn vật phẩm nào chưa gán.</p>
                  ) : (
                    <ul className="mm-items ad-items">
                      {unassigned.map((item) => (
                        <ItemCard key={item.id} item={item} keep={keep} />
                      ))}
                    </ul>
                  )}
                </section>
              ) : null}

              <div className="mm-grid-head">
                <h2>{stall ? "Ghé quầy thương nhân khác" : "Thương nhân"}</h2>
                {unassigned.length > 0 && selected !== NONE ? (
                  <Link href={adminHref(TAB, { ...histKeep, merchant: NONE })} scroll={false}>
                    {unassigned.length} vật phẩm chưa gán thương nhân
                  </Link>
                ) : null}
              </div>
              <ul className={stall ? "mm-grid is-compact" : "mm-grid"}>
                {(stall ? others : MERCHANTS).map((m) => (
                  <li key={m.id}>
                    <MerchantCard merchant={m} count={countOf(m.id)} href={adminHref(TAB, { ...histKeep, merchant: m.id })} />
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      </Result>

      <HistoryView history={history} params={historyParams} selected={selected} />

      {dialog?.mode === "add" ? <MarketItemDialog closeHref={closeHref} merchants={merchantOptions} images={ITEM_IMAGES} defaultMerchantId={stall?.id ?? ""} /> : null}
      {dialog?.mode === "edit" ? (
        <Result result={dialog.item}>
          {(item) =>
            item ? (
              <MarketItemDialog key={item.id} closeHref={closeHref} merchants={merchantOptions} images={ITEM_IMAGES} item={item} defaultMerchantId={stall?.id ?? ""} />
            ) : (
              <AdminDialog title="Sửa vật phẩm" closeHref={closeHref} size="sm">
                <p className="dash-empty">Không tìm thấy vật phẩm (có thể đã bị xóa).</p>
              </AdminDialog>
            )
          }
        </Result>
      ) : null}
    </>
  );
}

/* ---------- Lịch sử mua hàng tại Chợ phiên ---------- */

function HistoryView({ history, params, selected }: { history: DataResult<{ rows: MarketOrder[]; info: PageInfo }>; params: MarketHistoryParams; selected: string | null }) {
  const filtered = Boolean(params.merchant || params.student);
  const keep = { merchant: selected, fm: params.merchant, fs: params.student };
  return (
    <section aria-label="Lịch sử mua hàng tại Chợ phiên" className="ad-history">
      <h2 className="dash-h2">Lịch sử mua hàng tại Chợ phiên</h2>
      <form method="get" action="/admin/dashboard" className="ad-bar">
        <input type="hidden" name="tab" value={TAB} />
        {selected ? <input type="hidden" name="merchant" value={selected} /> : null}
        <label>
          Thương nhân
          <select name="fm" defaultValue={params.merchant ?? ""}>
            <option value="">Tất cả</option>
            {MERCHANTS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mã người giao dịch
          <input name="fs" defaultValue={params.student ?? ""} maxLength={20} placeholder="TT00012" autoComplete="off" />
        </label>
        <PageSizeSelect value={params.size} />
        <button type="submit" className="ad-btn">
          Lọc
        </button>
        {filtered ? (
          <Link className="ad-clear" href={adminHref(TAB, { merchant: selected, size: params.size })}>
            Bỏ lọc
          </Link>
        ) : null}
      </form>
      <Result result={history}>
        {({ rows, info }) => (
          <>
            {rows.length === 0 ? (
              <p className="dash-empty">{filtered ? "Không có giao dịch phù hợp với bộ lọc." : "Chưa có giao dịch nào tại Chợ phiên."}</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Mã giao dịch</th>
                      <th>Người giao dịch</th>
                      <th>Thương nhân</th>
                      <th>Tên sản phẩm</th>
                      <th className="num">Giá trị</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <code>{orderCode(row.id, row.createdAt)}</code>
                          <br />
                          <small>{row.createdAt ? formatVnDateTime(row.createdAt) : "—"}</small>
                        </td>
                        <td>
                          {row.studentName || "—"} <small>({row.studentId || "—"})</small>
                        </td>
                        <td>{findMerchant(row.merchantId)?.name ?? "—"}</td>
                        <td>
                          {row.itemName || "—"}
                          {row.quantity > 1 ? ` ×${row.quantity}` : ""}
                        </td>
                        <td className="num">
                          {row.cost} {row.currency}
                        </td>
                        <td>
                          <OrderStatusForm id={row.id} status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pager tab={TAB} params={{ ...keep, merchant: keep.merchant ?? null, fm: keep.fm ?? null, fs: keep.fs ?? null }} info={info} />
          </>
        )}
      </Result>
    </section>
  );
}
