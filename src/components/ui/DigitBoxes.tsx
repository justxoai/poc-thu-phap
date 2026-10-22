"use client";

import { useRef, type ClipboardEvent, type FocusEvent, type KeyboardEvent } from "react";

import "./digit-boxes.css";

/**
 * Ô nhập từng chữ số (kiểu mã OTP): mỗi ô một số, gõ xong tự nhảy sang ô kế, Backspace lùi lại, dán cả dãy được,
 * không cho bỏ trống ô ở giữa. Điều khiển bằng chuỗi `value` (chỉ chữ số, dài tối đa `length`).
 * Không có `name`: nơi dùng tự đặt một <input type="hidden"> chứa `value` để gửi cùng biểu mẫu.
 */
export function DigitBoxes({
  value,
  onChange,
  length = 6,
  masked = false,
  disabled = false,
  label,
  idPrefix,
}: {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  masked?: boolean;
  disabled?: boolean;
  label: string;
  idPrefix: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.slice(0, length).split("");
  // Số ô đã có chữ số, cập nhật ngay trong handler (trước khi React vẽ lại) để onFocus không đẩy focus ngược về.
  const filled = useRef(chars.length);
  filled.current = chars.length;
  const commit = (next: string[]) => {
    filled.current = next.length;
    onChange(next.join(""));
  };
  const focusBox = (index: number) => refs.current[Math.max(0, Math.min(index, length - 1))]?.focus();

  const setAt = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (digit === "") {
      // Xóa ô đang có số: các số sau dồn lên để không có ô trống ở giữa.
      if (index < chars.length) commit([...chars.slice(0, index), ...chars.slice(index + 1)]);
      return;
    }
    const at = Math.min(index, chars.length); // bấm vào ô sau ô trống đầu tiên thì điền vào ô trống đầu tiên
    const next = [...chars];
    next[at] = digit;
    commit(next);
    focusBox(at + 1);
  };

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (/^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Phím số trên bàn phím: ghi đè luôn, kể cả khi ô đã có số mà con trỏ không bôi đen. (Bàn phím ảo gửi qua onChange.)
      event.preventDefault();
      setAt(index, event.key);
    } else if (event.key === "Backspace" && index >= chars.length && chars.length > 0) {
      // Ô trống: xóa số liền trước rồi lùi lại.
      event.preventDefault();
      commit(chars.slice(0, -1));
      focusBox(chars.length - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(Math.min(index + 1, chars.length));
    }
  };

  const onPaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (digits === "") return;
    event.preventDefault();
    const next = (chars.slice(0, Math.min(index, chars.length)).join("") + digits).slice(0, length).split("");
    commit(next);
    focusBox(next.length >= length ? length - 1 : next.length);
  };

  const onFocus = (index: number) => (event: FocusEvent<HTMLInputElement>) => {
    if (index > filled.current) focusBox(filled.current);
    else event.target.select();
  };

  return (
    <div className="digits" role="group" aria-label={label}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          ref={(el: HTMLInputElement | null) => {
            refs.current[i] = el;
          }}
          className={chars[i] ? "digits-box is-filled" : "digits-box"}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-label={`${label}, chữ số ${i + 1}`}
          value={chars[i] ?? ""}
          onChange={(event) => setAt(i, event.target.value)}
          onKeyDown={onKeyDown(i)}
          onPaste={onPaste(i)}
          onFocus={onFocus(i)}
        />
      ))}
    </div>
  );
}
