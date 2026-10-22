"use client";

import { useActionState, useState } from "react";

import { enrollCourseAction, type RegisterState } from "@/app/dang-ky-hoc/actions";
import { courses, packagesOf } from "@/data/courses";
import { formatVnd } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

const INITIAL: RegisterState = { status: "idle" };

/**
 * Bước 2 của Đăng ký học: chọn khóa + gói. Họ tên/SĐT/email lấy từ tài khoản đang đăng nhập (ở server), nên không hỏi lại.
 * Lưu vào Firestore `purchases` (kind: "course"), trạng thái "new" chờ giáo viên duyệt.
 */
export function RegisterForm({ initialCourse, onBack }: { initialCourse?: string; onBack?: () => void }) {
  const [state, formAction, pending] = useActionState(enrollCourseAction, INITIAL);
  const [courseId, setCourseId] = useState(initialCourse ?? courses[0].id);
  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const options = packagesOf(course);
  const [packageId, setPackageId] = useState("");
  const selected = options.find((p) => p.id === packageId);

  if (state.status === "ok") {
    return (
      <div className="reg-success" role="status">
        <div className="reg-success-mark" aria-hidden="true">
          <Icon name="check" size={36} />
        </div>
        <h3>Đã nhận đăng ký</h3>
        <p>
          {state.name ? `${state.name}, ` : ""}
          chúng tôi đã nhận đăng ký <strong>{state.courseName}</strong> — <strong>{state.packageName}</strong>
          {state.amount > 0 ? ` (${formatVnd(state.amount)})` : " (miễn phí)"}.
        </p>
        {state.duplicate ? <p>Đăng ký này đã được ghi nhận trước đó nên không tạo thêm bản mới.</p> : null}
        {state.payment ? (
          <div className="reg-pay">
            {state.payment.qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh QR do dịch vụ ngoài tạo theo từng đơn
              <img src={state.payment.qrUrl} alt="Mã QR chuyển khoản học phí" width={220} height={220} loading="lazy" />
            ) : null}
            <dl>
              <dt>Ngân hàng</dt>
              <dd>{state.payment.bankName}</dd>
              <dt>Số tài khoản</dt>
              <dd>{state.payment.account}</dd>
              <dt>Chủ tài khoản</dt>
              <dd>{state.payment.holder}</dd>
              <dt>Số tiền</dt>
              <dd>{formatVnd(state.payment.amount)}</dd>
              <dt>Nội dung</dt>
              <dd>{state.payment.note}</dd>
            </dl>
          </div>
        ) : state.amount > 0 ? (
          <p>Giáo viên sẽ liên hệ qua số điện thoại để hướng dẫn thanh toán học phí.</p>
        ) : null}
        <p className="reg-note">Thầy sẽ liên hệ và xếp Tổ/Khóa cho bạn sau khi xác nhận đăng ký.</p>
      </div>
    );
  }

  const fields = state.status === "error" ? state.fields : {};
  const err = (name: keyof typeof fields) =>
    fields[name] ? <span className="reg-error">{fields[name]}</span> : null;

  return (
    <form action={formAction} className="reg-form" noValidate>
      <h3>Chọn khóa học</h3>

      <div className="reg-trap" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="reg-field">
        <span>Khoá học *</span>
        <select
          name="course"
          value={courseId}
          onChange={(event) => {
            setCourseId(event.target.value);
            setPackageId("");
          }}
        >
          {courses
            .filter((c) => c.open)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        {err("course")}
      </label>

      <fieldset className="reg-packages">
        <legend>Gói học *</legend>
        {options.map((p) => (
          <label key={p.id} className={packageId === p.id ? "reg-package is-selected" : "reg-package"}>
            <input type="radio" name="package" value={p.id} checked={packageId === p.id} onChange={() => setPackageId(p.id)} />
            <span>
              <strong>{p.name}</strong>
              <em>{p.price > 0 ? formatVnd(p.price) : "0đ"}</em>
            </span>
          </label>
        ))}
        {err("package")}
      </fieldset>
      {selected ? <p className="reg-hint">Học phí: {selected.price > 0 ? formatVnd(selected.price) : "miễn phí"}.</p> : null}

      <label className="reg-check">
        <input name="agree" type="checkbox" />
        <span>Tôi đã đọc và đồng ý với nội quy lớp học.</span>
      </label>
      {err("agree")}

      <div role="alert" aria-live="assertive">
        {state.status === "error" ? <p className="reg-error">{state.message}</p> : null}
      </div>
      <button type="submit" className="reg-submit" disabled={pending}>
        {pending ? "Đang gửi..." : "GỬI ĐĂNG KÝ"}
      </button>
      {onBack ? (
        <button type="button" className="reg-back" onClick={onBack}>
          ← Quay lại Bước 1
        </button>
      ) : null}
    </form>
  );
}
