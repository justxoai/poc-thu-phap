"use client";

import { useActionState } from "react";

import { lookupStudentAction, type StudentLookupState } from "@/app/tra-cuu/actions";

import { StudentProfileView } from "./StudentProfileView";
import "./student.css";
import { Icon } from "@/components/ui/Icon";

const INITIAL: StudentLookupState = { status: "idle" };

/** Ô nhập Mã học viên + hồ sơ. Dùng ở /tra-cuu/hoc-vien và /nop-bai. */
export function StudentLookup({
  title,
  hint,
  mode = "profile",
}: {
  title: string;
  hint: string;
  mode?: "profile" | "submit";
}) {
  const [state, formAction, pending] = useActionState(lookupStudentAction, INITIAL);

  return (
    <div className="stu">
      <section className="stu-search">
        <h2 className="stu-section-title">{title}</h2>
        <p className="stu-hint">{hint}</p>
        <form action={formAction} className="stu-search-row">
          <label className="sr-only" htmlFor={`stu-code-${mode}`}>
            Mã học viên
          </label>
          <input
            id={`stu-code-${mode}`}
            name="code"
            className="stu-input"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={40}
            placeholder="Nhập Mã học viên..."
            required
          />
          <button type="submit" className="stu-search-btn" disabled={pending}>
            {pending ? "ĐANG TRA..." : "TRA CỨU"}
          </button>
        </form>
        <div className="stu-message" role="status" aria-live="polite">
          {state.status === "error" ? <span className="stu-message-error">{state.message}</span> : null}
        </div>

        {state.status === "ok" ? (
          <>
            <StudentProfileView
              profile={state.profile}
              works={state.works}
              rankLabel={mode === "submit" ? "Tổng bài hợp lệ" : "Điểm xếp hạng"}
            />
            {mode === "submit" ? (
              <div className="stu-submit">
                <button type="button" className="stu-submit-btn" disabled>
                  <Icon name="pen" /> Nộp bài tập
                </button>
                <p className="stu-hint">
                  Chức năng nộp bài đang được chuyển sang hệ thống mới. Trong lúc đó, vui lòng nộp bài tại{" "}
                  <a href="https://www.thudao.com/p/nop-bai.html">trang nộp bài hiện tại</a>.
                </p>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}
