"use client";

import { useActionState, useState } from "react";

import { submitRegistrationAction, type RegisterState } from "@/app/dang-ky-hoc/actions";
import { courses, packagesOf } from "@/data/courses";
import { formatVnd } from "@/lib/format";

const INITIAL: RegisterState = { status: "idle" };

/** Phiếu đăng ký khóa học: lưu vào Firestore `purchases` (kind: "course"), trạng thái "new" chờ giáo viên duyệt. */
export function RegisterForm({ initialCourse }: { initialCourse?: string }) {
  const [state, formAction, pending] = useActionState(submitRegistrationAction, INITIAL);
  const [courseId, setCourseId] = useState(initialCourse ?? courses[0].id);
  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const options = packagesOf(course);
  const [packageId, setPackageId] = useState("");
  const selected = options.find((p) => p.id === packageId);

  if (state.status === "ok") {
    return (
      <div className="reg-success" role="status">
        <div className="reg-success-mark" aria-hidden="true">
          ✓
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
        <p className="reg-note">Mã học viên có hiệu lực khi hồ sơ được giáo viên duyệt.</p>
      </div>
    );
  }

  const fields = state.status === "error" ? state.fields : {};
  const err = (name: keyof typeof fields) =>
    fields[name] ? <span className="reg-error">{fields[name]}</span> : null;

  return (
    <form action={formAction} className="reg-form" noValidate>
      <h3>Phiếu đăng ký học</h3>

      <div className="reg-trap" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="reg-field">
        <span>Họ và tên *</span>
        <input name="name" type="text" maxLength={80} required autoComplete="name" />
        {err("name")}
      </label>
      <div className="reg-row">
        <label className="reg-field">
          <span>Số điện thoại *</span>
          <input name="phone" type="tel" inputMode="tel" maxLength={20} required autoComplete="tel" />
          {err("phone")}
        </label>
        <label className="reg-field">
          <span>Tên Zalo của bạn</span>
          <input name="zalo" type="text" maxLength={80} autoComplete="off" />
        </label>
      </div>
      <label className="reg-field">
        <span>Email *</span>
        <input name="email" type="email" maxLength={120} required autoComplete="email" />
        {err("email")}
      </label>

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
    </form>
  );
}
