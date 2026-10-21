import type { Metadata } from "next";

import { DriveImage } from "@/components/DriveImage";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { RARITIES } from "@/data/gems";
import { listMarket, type PublicMarketItem } from "@/lib/firestore/market";

import "./market.css";

export const metadata: Metadata = {
  title: "Chợ phiên",
  description: "Đổi vật phẩm bằng ngọc tích lũy trong quá trình học thư pháp.",
};

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : null;
}

const n0 = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

function sortItems(items: PublicMarketItem[], sort: string): PublicMarketItem[] {
  const list = [...items];
  if (sort === "gia-giam") return list.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, "vi"));
  if (sort === "ten") return list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return list.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "vi"));
}

export default async function MarketPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const rarity = RARITIES.find((r) => r.key === one(sp.hiem))?.key ?? null;
  const sort = ["gia-giam", "ten"].includes(one(sp.xep) ?? "") ? (one(sp.xep) as string) : "gia-tang";

  const result = await listMarket();
  const all = result.status === "ok" ? result.data : [];
  const items = sortItems(rarity ? all.filter((i) => i.rarity === rarity) : all, sort);

  return (
    <SidebarLayout>
      <article className="mk">
        <header className="mk-head">
          <p className="mk-kicker">Chợ phiên</p>
          <h1>Chợ phiên thu đổi ngọc</h1>
          <p>Dùng ngọc tích lũy từ bài tập và nhiệm vụ để đổi vật phẩm. Khung này chỉ để xem danh sách; việc đổi quà cần đăng nhập học viên (sắp có).</p>
        </header>

        {result.status === "unconfigured" ? <p className="mk-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
        {result.status === "error" ? <p className="mk-notice mk-notice-error">Chưa đọc được danh sách vật phẩm. Vui lòng thử lại sau.</p> : null}

        <form method="get" action="/cho-phien" className="mk-filter">
          <label>
            Độ hiếm
            <select name="hiem" defaultValue={rarity ?? ""}>
              <option value="">Tất cả</option>
              {RARITIES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sắp xếp
            <select name="xep" defaultValue={sort}>
              <option value="gia-tang">Giá thấp đến cao</option>
              <option value="gia-giam">Giá cao đến thấp</option>
              <option value="ten">Theo tên</option>
            </select>
          </label>
          <button type="submit">Lọc</button>
        </form>

        {result.status === "ok" && items.length === 0 ? <p className="mk-empty">{all.length === 0 ? "Chợ phiên chưa có vật phẩm nào." : "Không có vật phẩm nào ở độ hiếm này."}</p> : null}

        <ul className="mk-grid">
          {items.map((item) => (
            <li key={item.id} className="mk-card">
              <div className="mk-img">
                {item.imageId ? <DriveImage id={item.imageId} alt={item.name} width={260} height={260} /> : <span aria-hidden="true">物</span>}
              </div>
              <div className="mk-body">
                {item.rarityName ? <span className={`mk-rarity mk-rarity-${item.rarity}`}>{item.rarityName}</span> : null}
                <h3>{item.name}</h3>
                {item.description ? <p>{item.description}</p> : null}
                <p className="mk-price">
                  {n0(item.price)} <span>{item.currency}</span>
                </p>
                <p className="mk-stock">{item.stock === null ? "Không giới hạn số lượng" : item.stock > 0 ? `Còn ${n0(item.stock)}` : "Hết hàng"}</p>
                <button type="button" disabled className="mk-buy">
                  Đăng nhập để đổi
                </button>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </SidebarLayout>
  );
}
