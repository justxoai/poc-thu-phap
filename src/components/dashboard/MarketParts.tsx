"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { saveMarketItemAction, type AdminOpState } from "@/app/admin/dashboard/admin-actions";
import { DialogFrame } from "@/components/dashboard/AdminDialog";
import { Icon } from "@/components/ui/Icon";
import { RARITIES, findGem } from "@/data/gems";
import type { ItemImage } from "@/data/item-images";
import { currencyOfRarity, salePrice } from "@/lib/market-price";
import type { MarketItem } from "@/lib/types";

const IDLE: AdminOpState = { status: "idle" };

export interface MerchantOption {
  id: string;
  name: string;
}

/**
 * Popup thêm / sửa vật phẩm Chợ phiên. Giá tính bằng loại ngọc gắn với HẠNG vật phẩm (đổi hạng thì đơn vị đổi theo).
 * Khuyến mãi là phần trăm giảm; ô "Giá trị khuyến mãi" chỉ hiện khi chọn "Có". Lưu xong tự đóng và về danh sách.
 */
export function MarketItemDialog({ closeHref, merchants, images, item, defaultMerchantId }: { closeHref: string; merchants: MerchantOption[]; images: ItemImage[]; item?: MarketItem; defaultMerchantId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveMarketItemAction, IDLE);
  const [rarity, setRarity] = useState(item?.rarity || RARITIES[0].key);
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [promo, setPromo] = useState(item?.promo ?? false);
  const [percent, setPercent] = useState(item && item.promo ? String(item.promoPercent) : "");
  const [image, setImage] = useState(item?.image ?? "");

  const close = () => router.push(closeHref, { scroll: false });
  useEffect(() => {
    if (state.status === "ok") router.push(closeHref, { scroll: false });
  }, [state, router, closeHref]);

  const unit = currencyOfRarity(rarity) || findGem("hongNgoc")?.name || "";
  const priceNum = /^\d{1,9}$/.test(price) ? Number(price) : null;
  const percentNum = /^\d{1,2}$/.test(percent) ? Number(percent) : null;
  const after = priceNum !== null && promo && percentNum !== null && percentNum >= 1 ? salePrice(priceNum, true, percentNum) : null;

  return (
    <DialogFrame title={item ? "Sửa vật phẩm" : "Thêm vật phẩm"} size="md" onClose={close}>
      <form action={formAction} className="ad-form">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}

        <fieldset className="ad-field ad-wide">
          <legend>Ảnh</legend>
          {images.length === 0 ? (
            <p className="ad-hint">
              Chưa có ảnh vật phẩm. Bỏ ảnh vào <code>public/images/vat-pham</code> rồi chạy <code>npm run items:images</code>. Vẫn có thể lưu vật phẩm không ảnh.
            </p>
          ) : null}
          <div className="ad-images" role="radiogroup" aria-label="Ảnh vật phẩm">
            <label className={image === "" ? "ad-image is-on" : "ad-image"}>
              <input type="radio" name="image" value="" checked={image === ""} onChange={() => setImage("")} />
              <span className="ad-image-art">
                <Icon name="bag" size={26} />
              </span>
              <span>Không ảnh</span>
            </label>
            {images.map((img) => (
              <label key={img.src} className={image === img.src ? "ad-image is-on" : "ad-image"}>
                <input type="radio" name="image" value={img.src} checked={image === img.src} onChange={() => setImage(img.src)} />
                <span className="ad-image-art">
                  <Image src={img.src} alt="" width={96} height={96} />
                </span>
                <span>{img.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="ad-field ad-wide">
          Tên vật phẩm
          <input name="name" required maxLength={80} defaultValue={item?.name ?? ""} />
        </label>

        <label className="ad-field">
          Hạng vật phẩm
          <select name="rarity" value={rarity} onChange={(e) => setRarity(e.target.value)}>
            {RARITIES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label className="ad-field">
          Người bán
          <select name="merchantId" defaultValue={item?.merchantId || defaultMerchantId} required>
            <option value="" disabled>
              Chọn thương nhân
            </option>
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <label className="ad-field">
          Giá trị ({unit})
          <input name="price" required inputMode="numeric" pattern="[0-9]+" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>

        <fieldset className="ad-field">
          <legend>Khuyến mãi</legend>
          <div className="ad-radios">
            <label>
              <input type="radio" name="promo" value="no" checked={!promo} onChange={() => setPromo(false)} /> Không
            </label>
            <label>
              <input type="radio" name="promo" value="yes" checked={promo} onChange={() => setPromo(true)} /> Có
            </label>
          </div>
        </fieldset>

        {promo ? (
          <label className="ad-field ad-wide">
            Giá trị khuyến mãi (% giảm, 1–99)
            <input name="promoPercent" required inputMode="numeric" pattern="[0-9]{1,2}" value={percent} onChange={(e) => setPercent(e.target.value)} />
            {after !== null ? (
              <span className="ad-hint">
                Giá sau giảm: <strong>{after}</strong> {unit}
              </span>
            ) : null}
          </label>
        ) : null}

        <label className="ad-field ad-wide">
          Mô tả ngắn
          <textarea name="description" rows={2} maxLength={160} defaultValue={item?.description ?? ""} />
        </label>

        <label className="ad-field">
          Tồn kho (để trống = không giới hạn)
          <input name="stock" inputMode="numeric" pattern="[0-9]*" defaultValue={item?.stock === null || item === undefined ? "" : String(item.stock)} />
        </label>

        <label className="ad-field ad-check">
          <input type="checkbox" name="active" defaultChecked={item ? item.active : true} /> Đang bán
        </label>

        <div role="status" aria-live="polite" className="ad-wide">
          {state.status === "error" ? <p className="dash-error">{state.message}</p> : null}
          {state.status === "ok" ? <p className="dash-ok">{state.message}</p> : null}
        </div>

        <div className="ad-confirm-actions ad-wide">
          <button type="button" className="ad-btn ad-btn-ghost" onClick={close}>
            Hủy
          </button>
          <button type="submit" className="ad-btn" disabled={pending}>
            {pending ? "Đang lưu..." : item ? "Lưu thay đổi" : "Thêm vật phẩm"}
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}
