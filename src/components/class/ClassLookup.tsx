"use client";

import { useActionState } from "react";

import { lookupClassAction, type ClassLookupState } from "@/app/tra-cuu/actions";
import { WorkGrid } from "@/components/works/WorkCard";
import { formatScore } from "@/lib/format";

import "./class.css";
import "@/components/lookup/lookup.css";

const INITIAL: ClassLookupState = { status: "idle" };

/** Tra cứu cả tổ theo mã của cán sự lớp. Không có chức năng tặng quà của admin (chưa chốt đăng nhập/phân quyền). */
export function ClassLookup() {
  const [state, formAction, pending] = useActionState(lookupClassAction, INITIAL);

  return (
    <div className="cls">
      <div className="cls-box">
        <p className="cls-desc">Nhập mã tra cứu do giáo viên cấp cho cán sự lớp để xem toàn bộ học viên thuộc cùng Tổ và Khóa.</p>
        <form action={formAction} className="cls-row">
          <label className="sr-only" htmlFor="cls-code">
            Mã tra cứu
          </label>
          <input
            id="cls-code"
            name="code"
            className="cls-input"
            type="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={40}
            placeholder="Nhập mã tra cứu"
            required
          />
          <button type="submit" className="cls-button" disabled={pending}>
            {pending ? "ĐANG TRA..." : "TRA CỨU"}
          </button>
        </form>
        <div role="status" aria-live="polite">
          {state.status === "error" ? <div className="cls-message cls-message-error">{state.message}</div> : null}
        </div>

        {state.status === "ok" ? <ClassResult state={state} /> : null}
      </div>
    </div>
  );
}

/** Kết quả tra cứu một tổ: danh sách học viên + tác phẩm mới nhất của cả tổ. */
export function ClassResult({ state }: { state: Extract<ClassLookupState, { status: "ok" }> }) {
  return (
    <>
      <div className="cls-info">
        <div className="cls-info-title">
          Tổ {state.group} · Khóa {state.course}
        </div>
        <div className="cls-info-detail">
          Có <strong>{state.members.length}</strong> học viên.
        </div>
      </div>

      <div className="cls-result">
        <h3 className="cls-result-title">
          DANH SÁCH HỌC VIÊN <span className="cls-count">({state.members.length})</span>
        </h3>
        {state.members.length === 0 ? (
          <p className="cls-empty">Chưa có học viên nào trong tổ này.</p>
        ) : (
          <div className="cls-table-wrap">
            <table className="cls-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ và tên</th>
                  <th>Mã học viên</th>
                  <th>Điểm trung bình</th>
                  <th>Số lượt nộp</th>
                  <th>Tình trạng hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {state.members.map((m, i) => (
                  <tr key={m.id}>
                    <td className="cls-stt">{i + 1}</td>
                    <td className="cls-name">{m.name}</td>
                    <td>{m.id}</td>
                    <td className="cls-average">{formatScore(m.average)}</td>
                    <td className="cls-submissions">{m.submissionCount}</td>
                    <td>
                      <span className={`cls-activity cls-activity-${m.activity.level}`}>{m.activity.text}</span>
                      <span className="cls-activity-detail">{m.activity.detail}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="cls-works">
        <h3 className="cls-works-title">TÁC PHẨM MỚI NHẤT CỦA CẢ TỔ</h3>
        <p className="cls-works-desc">Các bài mới nộp gần đây của học viên cùng Tổ và Khóa.</p>
        {state.works.length === 0 ? (
          <p className="cls-empty">Chưa có tác phẩm nào được tìm thấy.</p>
        ) : (
          <WorkGrid works={state.works} detailed />
        )}
      </div>
    </>
  );
}
