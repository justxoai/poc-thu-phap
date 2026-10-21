"use client";

import { useRef, useState } from "react";

import { DriveImage } from "@/components/DriveImage";
import { driveThumbnailUrl, driveViewUrl } from "@/lib/drive";
import type { ExhibitionMeta, ExhibitionPage, ExhibitionSort, ExhibitionWork } from "@/lib/firestore/exhibition";
import { formatVnDateTime } from "@/lib/format";
import { normalizeText } from "@/lib/text";

import "./exhibition.css";

type Props = {
  initial: ExhibitionPage;
  /** Trang đầu không đọc được (chưa kết nối/lỗi) thì hiện thông báo thay vì "chưa có tác phẩm". */
  initialStatus: "ok" | "unconfigured" | "error";
  meta: ExhibitionMeta | null;
};

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
}

/**
 * Phòng triển lãm: trang đầu do server dựng sẵn; đổi bộ lọc/"Xem thêm" gọi /api/trien-lam (CDN cache 60 giây).
 * Ô tìm kiếm chỉ tìm trong các tác phẩm đã tải về trang.
 */
export function ExhibitionGallery({ initial, initialStatus, meta }: Props) {
  const [items, setItems] = useState<ExhibitionWork[]>(initial.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initial.nextCursor);
  const [course, setCourse] = useState("");
  const [group, setGroup] = useState("");
  const [sort, setSort] = useState<ExhibitionSort>("newest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(initialStatus !== "ok");
  const [selected, setSelected] = useState<ExhibitionWork | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ticket = useRef(0);

  const courseOptions = meta?.courses.length ? meta.courses : uniqueSorted(initial.items.map((w) => w.course));
  const groupOptions = meta?.groups.length ? meta.groups : uniqueSorted(initial.items.map((w) => w.group));

  async function load(next: { course: string; group: string; sort: ExhibitionSort }, cursor: string | null) {
    const mine = ++ticket.current;
    setLoading(true);
    setFailed(false);
    try {
      const params = new URLSearchParams();
      if (next.course) params.set("khoa", next.course);
      if (next.group) params.set("to", next.group);
      if (next.sort === "oldest") params.set("sort", "oldest");
      if (cursor) params.set("cursor", cursor);
      const response = await fetch(`/api/trien-lam?${params.toString()}`);
      if (!response.ok) throw new Error("failed");
      const page = (await response.json()) as ExhibitionPage;
      if (mine !== ticket.current) return; // đã có yêu cầu mới hơn
      setItems((prev) => (cursor ? [...prev, ...page.items] : page.items));
      setNextCursor(page.nextCursor);
    } catch {
      if (mine === ticket.current) setFailed(true);
    } finally {
      if (mine === ticket.current) setLoading(false);
    }
  }

  function applyFilters(next: { course: string; group: string; sort: ExhibitionSort }) {
    setCourse(next.course);
    setGroup(next.group);
    setSort(next.sort);
    void load(next, null);
  }

  function reset() {
    setSearch("");
    applyFilters({ course: "", group: "", sort: "newest" });
  }

  function open(work: ExhibitionWork) {
    setSelected(work);
    dialogRef.current?.showModal();
  }

  const needle = normalizeText(search);
  const visible = needle
    ? items.filter((w) => normalizeText(`${w.studentName} ${w.description} ${w.group} ${w.course}`).includes(needle))
    : items;
  const filtering = course !== "" || group !== "" || sort !== "newest";

  let resultText = "";
  if (!failed) {
    if (visible.length === 0) resultText = "";
    else if (!filtering && !needle && meta && meta.works > 0)
      resultText = `Đang xem 1–${visible.length} trong ${meta.works} tác phẩm triển lãm.`;
    else resultText = `Đang xem ${visible.length} tác phẩm${nextCursor ? " (còn nữa, bấm “Xem thêm”)" : ""}.`;
  }

  return (
    <>
      <div className="ex-filters">
        <label className="ex-search">
          <span className="sr-only">Tìm trong các tác phẩm đã tải</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên học viên hoặc tên bài..." autoComplete="off" />
        </label>
        <select aria-label="Khóa" value={course} onChange={(event) => applyFilters({ course: event.target.value, group, sort })}>
          <option value="">Tất cả khóa</option>
          {courseOptions.map((c) => (
            <option key={c} value={c}>{`Khóa ${c}`}</option>
          ))}
        </select>
        <select aria-label="Tổ" value={group} onChange={(event) => applyFilters({ course, group: event.target.value, sort })}>
          <option value="">Tất cả tổ</option>
          {groupOptions.map((g) => (
            <option key={g} value={g}>{`Tổ ${g}`}</option>
          ))}
        </select>
        <select aria-label="Sắp xếp" value={sort} onChange={(event) => applyFilters({ course, group, sort: event.target.value as ExhibitionSort })}>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      <div className="ex-result-row">
        <p className="ex-result" role="status" aria-live="polite">
          {loading ? "Đang tải tác phẩm..." : resultText}
        </p>
        <button type="button" className="ex-reset" onClick={reset}>
          Đặt lại bộ lọc
        </button>
      </div>

      {failed ? (
        <p className="ex-message ex-message-error">
          {initialStatus === "unconfigured" && items.length === 0 ? "Nội dung đang được cập nhật." : "Chưa tải được tác phẩm. Vui lòng thử lại sau."}
        </p>
      ) : null}

      {!failed && !loading && visible.length === 0 ? <p className="ex-message">Chưa có tác phẩm phù hợp với bộ lọc.</p> : null}

      <ul className="ex-grid">
        {visible.map((work, index) => (
          <li key={work.id} className="ex-card">
            <button type="button" className="ex-image-box" onClick={() => open(work)} aria-label={`Xem tác phẩm của ${work.studentName || "học viên"}`}>
              <DriveImage
                id={work.driveFileId}
                alt={work.description ? `${work.description} - ${work.studentName || "Học viên"}` : `Tác phẩm của ${work.studentName || "học viên"}`}
                width={420}
                height={520}
                fetchWidth={600}
                loading={index < 2 ? "eager" : "lazy"}
              />
            </button>
            <div className="ex-card-body">
              <div className="ex-author">{work.studentName || "Học viên"}</div>
              {work.description ? <div className="ex-assignment">{work.description}</div> : null}
              <div className="ex-tags">
                {work.group ? <span>{`Tổ ${work.group}`}</span> : null}
                {work.course ? <span>{`Khóa ${work.course}`}</span> : null}
              </div>
              <time className="ex-date" dateTime={work.submittedAt}>
                {formatVnDateTime(work.submittedAt)}
              </time>
              <button type="button" className="ex-view" onClick={() => open(work)}>
                Xem tác phẩm
              </button>
            </div>
          </li>
        ))}
      </ul>

      {nextCursor && !needle ? (
        <div className="ex-more">
          <button type="button" onClick={() => void load({ course, group, sort }, nextCursor)} disabled={loading}>
            {loading ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        className="ex-dialog"
        aria-label="Xem tác phẩm"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <button type="button" className="ex-close" aria-label="Đóng" onClick={() => dialogRef.current?.close()}>
          ×
        </button>
        {selected && driveThumbnailUrl(selected.driveFileId, 1600) ? (
          <>
            <DriveImage id={selected.driveFileId} alt={selected.description || `Tác phẩm của ${selected.studentName}`} width={1000} height={1250} fetchWidth={1600} className="ex-dialog-image" />
            <div className="ex-dialog-info">
              <strong>{selected.studentName || "Học viên"}</strong>
              {selected.description ? <span>{selected.description}</span> : null}
              <span>
                {[selected.group && `Tổ ${selected.group}`, selected.course && `Khóa ${selected.course}`].filter(Boolean).join(" · ")}
              </span>
              <span>Nộp bài: {formatVnDateTime(selected.submittedAt)}</span>
              {driveViewUrl(selected.driveFileId) ? (
                <a href={driveViewUrl(selected.driveFileId) as string} target="_blank" rel="noopener noreferrer">
                  Mở ảnh gốc
                </a>
              ) : null}
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
