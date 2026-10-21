"use client";

import { useActionState, useState } from "react";

import { submitBookOrderAction, type BookOrderState } from "@/app/sach-thu-phap/actions";
import { bookOrder } from "@/data/book";
import { BOOK } from "@/lib/book-pricing";
import { formatVnd } from "@/lib/format";

const INITIAL: BookOrderState = { status: "idle" };

const QUANTITIES = Array.from({ length: BOOK.maxQuantity }, (_, i) => i + 1);

/** Phiếu đăng ký mua sách. Bản ghi lưu ở Firestore `purchases` (kind: "book"); giá cuối cùng do server tính. */
export function BookOrderForm() {
  const [state, formAction, pending] = useActionState(submitBookOrderAction, INITIAL);
  const [quantity, setQuantity] = useState(1);

  if (state.status === "ok") {
    return (
      <div className="bk-success" role="status">
        <div className="bk-success-mark" aria-hidden="true">
          ✓
        </div>
        <h3>{bookOrder.success.title}</h3>
        <p>{bookOrder.success.text}</p>
        <dl className="bk-success-list">
          <div>
            <dt>Người nhận</dt>
            <dd>{state.name}</dd>
          </div>
          <div>
            <dt>Số điện thoại</dt>
            <dd>{state.phone}</dd>
          </div>
          <div>
            <dt>Số lượng</dt>
            <dd>{state.quantity} cuốn</dd>
          </div>
          <div>
            <dt>Đơn giá</dt>
            <dd>{formatVnd(state.unitPrice)}</dd>
          </div>
          <div>
            <dt>Tạm tính</dt>
            <dd>{formatVnd(state.total)}</dd>
          </div>
        </dl>
        {state.duplicate ? <p>Phiếu này đã được ghi nhận trước đó nên không tạo thêm bản mới.</p> : null}
        <p className="bk-success-note">{bookOrder.success.note}</p>
      </div>
    );
  }

  const fields = state.status === "error" ? state.fields : {};
  const err = (name: keyof typeof fields) =>
    fields[name] ? (
      <span className="bk-field-error" id={`bk-${name}-error`}>
        {fields[name]}
      </span>
    ) : null;

  return (
    <form action={formAction} className="bk-form" noValidate>
      <h3>{bookOrder.formTitle}</h3>
      <p className="bk-form-lead">{bookOrder.formLead}</p>

      {/* Ô bẫy bot: ẩn khỏi người dùng và công cụ đọc màn hình */}
      <div className="bk-trap" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="bk-field">
        <span>Họ và tên *</span>
        <input name="name" type="text" maxLength={80} placeholder="Tên người nhận sách" required autoComplete="name" aria-describedby={fields.name ? "bk-name-error" : undefined} />
        {err("name")}
      </label>

      <div className="bk-row">
        <label className="bk-field">
          <span>Số điện thoại *</span>
          <input name="phone" type="tel" inputMode="tel" maxLength={20} placeholder="Ví dụ: 0966966007" required autoComplete="tel" aria-describedby={fields.phone ? "bk-phone-error" : undefined} />
          {err("phone")}
        </label>
        <label className="bk-field">
          <span>Số lượng</span>
          <select name="quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
            {QUANTITIES.map((n) => (
              <option key={n} value={n}>
                {n} cuốn
              </option>
            ))}
          </select>
          {err("quantity")}
        </label>
      </div>

      <label className="bk-field">
        <span>Địa chỉ nhận sách *</span>
        <input name="address" type="text" maxLength={300} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" required autoComplete="street-address" aria-describedby={fields.address ? "bk-address-error" : undefined} />
        {err("address")}
      </label>

      <label className="bk-field">
        <span>Mã ưu đãi</span>
        <input name="promo" type="text" maxLength={40} placeholder="Mã học viên, ví dụ 010104" autoComplete="off" spellCheck={false} />
        <small>{bookOrder.promoHint}</small>
      </label>

      <dl className="bk-estimate">
        <div>
          <dt>Giá niêm yết</dt>
          <dd>{formatVnd(BOOK.listPrice)}</dd>
        </div>
        <div>
          <dt>Số lượng</dt>
          <dd>{quantity} cuốn</dd>
        </div>
        <div>
          <dt>Tạm tính (chưa ưu đãi)</dt>
          <dd>{formatVnd(BOOK.listPrice * quantity)}</dd>
        </div>
      </dl>
      <p className="bk-form-lead">Ưu đãi được áp dụng và hiển thị số tiền cuối cùng sau khi bạn gửi phiếu.</p>

      <label className="bk-check">
        <input name="agree" type="checkbox" aria-describedby={fields.agree ? "bk-agree-error" : undefined} />
        <span>{bookOrder.consent}</span>
      </label>
      {err("agree")}

      <div role="alert" aria-live="assertive">
        {state.status === "error" ? <p className="bk-form-error">{state.message}</p> : null}
      </div>

      <button type="submit" className="bk-submit" disabled={pending}>
        {pending ? "Đang gửi..." : bookOrder.submit}
      </button>
    </form>
  );
}
