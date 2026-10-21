"use client";

import { useActionState, useMemo, useState } from "react";

import { submitSealOrderAction, type SealOrderState } from "@/app/an-trien/actions";
import { sealForm } from "@/data/seal";
import { formatVnd } from "@/lib/format";
import {
  SEAL_DESIGN_FEE,
  SEAL_MAX_CONTENT,
  SEAL_MAX_EXTRA,
  SEAL_MAX_ITEMS,
  SEAL_MAX_QUANTITY,
  SEAL_SIZES,
  SEAL_STONES,
  SEAL_TYPES,
  defaultUnitPrice,
  sealItemTotal,
  stoneById,
} from "@/lib/seal-pricing";

const INITIAL: SealOrderState = { status: "idle" };

interface DraftItem {
  key: number;
  type: string;
  size: string;
  stone: string;
  unitPrice: number;
  quantity: number;
  content: string;
  extra: string;
  design: boolean;
}

function newItem(key: number): DraftItem {
  return { key, type: "danh", size: "s2", stone: "tot", unitPrice: defaultUnitPrice("tot"), quantity: 1, content: "", extra: "", design: false };
}

const QUANTITIES = Array.from({ length: SEAL_MAX_QUANTITY }, (_, i) => i + 1);

/** Phiếu đặt ấn. Bản ghi lưu ở Firestore `purchases` (kind: "seal"); giá cuối cùng do server kiểm tra lại. */
export function SealOrderForm() {
  const [state, formAction, pending] = useActionState(submitSealOrderAction, INITIAL);
  const [items, setItems] = useState<DraftItem[]>(() => [newItem(1)]);
  const [nextKey, setNextKey] = useState(2);

  const total = useMemo(() => items.reduce((sum, it) => sum + sealItemTotal(it.unitPrice, it.quantity, it.design), 0), [items]);
  const payload = useMemo(
    () =>
      JSON.stringify(
        items.map((it) => ({ type: it.type, size: it.size, stone: it.stone, unitPrice: it.unitPrice, quantity: it.quantity, content: it.content, extra: it.extra, design: it.design })),
      ),
    [items],
  );

  function update(key: number, patch: Partial<DraftItem>) {
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function pickStone(key: number, stone: string) {
    update(key, { stone, unitPrice: defaultUnitPrice(stone) });
  }

  if (state.status === "ok") {
    return (
      <div className="sl-success" role="status">
        <div className="sl-success-mark" aria-hidden="true">
          ✓
        </div>
        <h3>{sealForm.success.title}</h3>
        <p>{sealForm.success.text}</p>
        <dl className="sl-success-list">
          <div>
            <dt>Người đặt</dt>
            <dd>{state.name}</dd>
          </div>
          <div>
            <dt>Số điện thoại</dt>
            <dd>{state.phone}</dd>
          </div>
          <div>
            <dt>Số con ấn</dt>
            <dd>{state.count}</dd>
          </div>
          <div>
            <dt>Tạm tính</dt>
            <dd>{formatVnd(state.total)}</dd>
          </div>
        </dl>
        {state.duplicate ? <p>Phiếu này đã được ghi nhận trước đó nên không tạo thêm bản mới.</p> : null}
      </div>
    );
  }

  const fields = state.status === "error" ? state.fields : {};
  const err = (name: keyof typeof fields) =>
    fields[name] ? (
      <span className="sl-field-error" id={`sl-${name}-error`}>
        {fields[name]}
      </span>
    ) : null;

  return (
    <form action={formAction} className="sl-form" noValidate id="dat-an">
      <div className="sl-trap" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="items" value={payload} />

      <fieldset className="sl-step">
        <legend>
          <span>1</span> {sealForm.buyerTitle}
        </legend>
        <p className="sl-note">{sealForm.buyerNote}</p>
        <label className="sl-field">
          <span>Họ và tên *</span>
          <input name="name" type="text" maxLength={80} required autoComplete="name" aria-describedby={fields.name ? "sl-name-error" : undefined} />
          {err("name")}
        </label>
        <div className="sl-row">
          <label className="sl-field">
            <span>Số điện thoại *</span>
            <input name="phone" type="tel" inputMode="tel" maxLength={20} required autoComplete="tel" aria-describedby={fields.phone ? "sl-phone-error" : undefined} />
            {err("phone")}
          </label>
          <label className="sl-field">
            <span>Email (tuỳ chọn)</span>
            <input name="email" type="email" maxLength={120} autoComplete="email" aria-describedby={fields.email ? "sl-email-error" : undefined} />
            {err("email")}
          </label>
        </div>
        <label className="sl-field">
          <span>Địa chỉ nhận ấn *</span>
          <textarea name="address" rows={2} maxLength={300} placeholder="Số nhà, đường, phường/xã, tỉnh/thành" required autoComplete="street-address" aria-describedby={fields.address ? "sl-address-error" : undefined} />
          {err("address")}
        </label>
      </fieldset>

      <fieldset className="sl-step">
        <legend>
          <span>2</span> {sealForm.itemTitle}
        </legend>
        {items.map((it, index) => {
          const stone = stoneById(it.stone);
          const ranged = !!stone && stone.min !== stone.max;
          return (
            <div key={it.key} className="sl-item">
              <div className="sl-item-head">
                <h4>Ấn số {index + 1}</h4>
                {items.length > 1 ? (
                  <button type="button" className="sl-link" onClick={() => setItems((list) => list.filter((x) => x.key !== it.key))}>
                    Xóa
                  </button>
                ) : null}
              </div>

              <div className="sl-choices" role="radiogroup" aria-label="Loại ấn">
                {SEAL_TYPES.map((t) => (
                  <label key={t.id} className={`sl-choice${it.type === t.id ? " is-on" : ""}`}>
                    <input type="radio" name={`type-${it.key}`} checked={it.type === t.id} onChange={() => update(it.key, { type: t.id })} />
                    <strong>{t.name}</strong>
                    <small>{t.hint}</small>
                  </label>
                ))}
              </div>

              <div className="sl-choices sl-choices-sm" role="radiogroup" aria-label="Kích thước">
                {SEAL_SIZES.map((s) => (
                  <label key={s.id} className={`sl-choice${it.size === s.id ? " is-on" : ""}`}>
                    <input type="radio" name={`size-${it.key}`} checked={it.size === s.id} onChange={() => update(it.key, { size: s.id })} />
                    <strong>{s.name}</strong>
                  </label>
                ))}
              </div>

              <div className="sl-choices" role="radiogroup" aria-label="Loại đá và mức giá">
                {SEAL_STONES.map((s) => (
                  <label key={s.id} className={`sl-choice${it.stone === s.id ? " is-on" : ""}`}>
                    <input type="radio" name={`stone-${it.key}`} checked={it.stone === s.id} onChange={() => pickStone(it.key, s.id)} />
                    <strong>{s.name}</strong>
                    <small>{s.hint}</small>
                    <em>{s.priceLabel}</em>
                  </label>
                ))}
              </div>

              <div className="sl-row">
                {ranged && stone ? (
                  <label className="sl-field">
                    <span>
                      Mức giá một con ấn ({formatVnd(stone.min)} – {stone.id === "cucdep" ? "tuỳ đá" : formatVnd(stone.max)})
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={stone.min}
                      max={stone.max}
                      step={50_000}
                      value={it.unitPrice}
                      onChange={(event) => update(it.key, { unitPrice: Math.floor(Number(event.target.value)) || 0 })}
                    />
                  </label>
                ) : null}
                <label className="sl-field">
                  <span>Số lượng</span>
                  <select value={it.quantity} onChange={(event) => update(it.key, { quantity: Number(event.target.value) })}>
                    {QUANTITIES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="sl-field">
                <span>Nội dung muốn khắc</span>
                <input type="text" maxLength={SEAL_MAX_CONTENT} value={it.content} placeholder="VD: Thanh Phong" onChange={(event) => update(it.key, { content: event.target.value })} />
              </label>
              <label className="sl-field">
                <span>Yêu cầu thêm (tuỳ chọn)</span>
                <textarea rows={2} maxLength={SEAL_MAX_EXTRA} value={it.extra} placeholder="Âm văn / dương văn, hình ấn vuông – tròn – đa giác, màu đá…" onChange={(event) => update(it.key, { extra: event.target.value })} />
              </label>
              <label className="sl-check">
                <input type="checkbox" checked={it.design} onChange={(event) => update(it.key, { design: event.target.checked })} />
                <span>Nhờ GVCN nghĩ và thiết kế mẫu (+{formatVnd(SEAL_DESIGN_FEE)})</span>
              </label>
              <p className="sl-item-total">
                Thành tiền ấn này: <strong>{formatVnd(sealItemTotal(it.unitPrice, it.quantity, it.design))}</strong>
              </p>
            </div>
          );
        })}
        {err("items")}
        {items.length < SEAL_MAX_ITEMS ? (
          <button
            type="button"
            className="sl-add"
            onClick={() => {
              setItems((list) => [...list, newItem(nextKey)]);
              setNextKey((k) => k + 1);
            }}
          >
            + Thêm một con ấn khác
          </button>
        ) : null}
      </fieldset>

      <fieldset className="sl-step">
        <legend>
          <span>3</span> {sealForm.estimateTitle}
        </legend>
        <ul className="sl-lines">
          {items.map((it, index) => (
            <li key={it.key}>
              <span>
                {index + 1}. {SEAL_TYPES.find((t) => t.id === it.type)?.name} · {SEAL_SIZES.find((s) => s.id === it.size)?.name} · {stoneById(it.stone)?.name}
                {it.design ? " · thiết kế" : ""} × {it.quantity}
              </span>
              <strong>{formatVnd(sealItemTotal(it.unitPrice, it.quantity, it.design))}</strong>
            </li>
          ))}
          <li className="sl-total">
            <span>Tổng tạm tính</span>
            <strong>{formatVnd(total)}</strong>
          </li>
        </ul>
        <label className="sl-field">
          <span>Ghi chú thêm cho GVCN</span>
          <textarea name="note" rows={2} maxLength={500} placeholder="Thời gian cần ấn, dịp tặng, mẫu tham khảo…" />
        </label>
        <p className="sl-note">{sealForm.estimateNote}</p>
        <label className="sl-check">
          <input name="agree" type="checkbox" aria-describedby={fields.agree ? "sl-agree-error" : undefined} />
          <span>{sealForm.consent}</span>
        </label>
        {err("agree")}
        <div role="alert" aria-live="assertive">
          {state.status === "error" ? <p className="sl-form-error">{state.message}</p> : null}
        </div>
        <button type="submit" className="sl-submit" disabled={pending}>
          {pending ? "Đang gửi..." : sealForm.submit}
        </button>
      </fieldset>
    </form>
  );
}
