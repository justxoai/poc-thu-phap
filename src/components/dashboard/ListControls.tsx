"use client";

import { PAGE_SIZES } from "@/lib/admin-paging";

/** Ô chọn "số dòng/trang": đổi là gửi luôn biểu mẫu lọc chứa nó (về trang đầu). Không có JS thì dùng nút Lọc. */
export function PageSizeSelect({ value }: { value: number }) {
  return (
    <label className="ad-size">
      Số dòng/trang
      <select name="size" defaultValue={String(value)} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        {PAGE_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
