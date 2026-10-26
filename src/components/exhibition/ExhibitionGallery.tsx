"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import Image from "next/image";

import { DriveImage } from "@/components/DriveImage";
import { ProfileAvatar } from "@/components/student/ProfileAvatar";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_DECOR, normalizeDecor } from "@/data/decor";
import { driveThumbnailUrl, driveViewUrl } from "@/lib/drive";
import { DEFAULT_PAGE_SIZE, matchesSearch, PAGE_SIZES, pageCountFor, pageSlice, pageWindow, sortWorks, isPageSize } from "@/lib/exhibition-view";
import type { ExhibitionMeta, ExhibitionPage, ExhibitionSort, ExhibitionWork } from "@/lib/firestore/exhibition";
import { formatVnDate } from "@/lib/format";

import "./exhibition.css";

type Props = {
  initial: ExhibitionPage;
  /** Trang đầu không đọc được (chưa kết nối/lỗi) thì hiện thông báo thay vì "chưa có tác phẩm". */
  initialStatus: "ok" | "unconfigured" | "error";
  meta: ExhibitionMeta | null;
  /** true: `initial` là bộ MẪU đầy đủ (data/exhibition-sample.ts); lọc, sắp xếp, chia trang làm ngay trên trình duyệt, không gọi API. */
  sample?: boolean;
};

type Filters = { course: string; group: string; sort: ExhibitionSort };

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
}

/** Khung ảnh: ảnh trong public (bộ mẫu) hoặc ảnh Drive; chưa có ảnh nào thì hiện ô giữ chỗ nền giấy + bút lông. */
function Artwork({ work, width, height, fetchWidth, eager, className, sizes }: { work: ExhibitionWork; width: number; height: number; fetchWidth: number; eager?: boolean; className?: string; sizes?: string }) {
  const alt = work.description ? `${work.description} - ${work.studentName || "Học viên"}` : `Tác phẩm của ${work.studentName || "học viên"}`;
  if (work.imageSrc) {
    return <Image src={work.imageSrc} alt={alt} width={width} height={height} sizes={sizes} priority={eager} className={className} />;
  }
  if (driveThumbnailUrl(work.driveFileId, fetchWidth)) {
    return (
      <DriveImage
        id={work.driveFileId}
        alt={alt}
        width={width}
        height={height}
        fetchWidth={fetchWidth}
        loading={eager ? "eager" : "lazy"}
        className={className}
      />
    );
  }
  return (
    <span className="ex-placeholder" role="img" aria-label="Tác phẩm chưa có ảnh">
      <Icon name="brush" size={44} />
      <span>Ảnh đang cập nhật</span>
    </span>
  );
}

function Author({ work, size }: { work: ExhibitionWork; size: number }) {
  return <ProfileAvatar name={work.studentName || "Học viên"} decor={work.decor ? normalizeDecor(work.decor) : DEFAULT_DECOR} size={size} />;
}

/**
 * Phòng triển lãm: bộ lọc (tìm chứa, khóa, tổ, thời gian), phân trang có chọn số tác phẩm mỗi trang, thẻ bấm mở popup.
 * Dữ liệu thật: khóa/tổ/thứ tự do server lọc (cursor Firestore, mỗi lần 24 bài), ô tìm chỉ tìm trong các bài đã tải;
 * "Sau" ở trang cuối tự tải thêm. Dữ liệu mẫu: lọc và chia trang toàn bộ trên trình duyệt.
 */
export function ExhibitionGallery({ initial, initialStatus, meta, sample = false }: Props) {
  const [items, setItems] = useState<ExhibitionWork[]>(initial.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initial.nextCursor);
  const [filters, setFilters] = useState<Filters>({ course: "", group: "", sort: "newest" });
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(initialStatus !== "ok" && !sample);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const ticket = useRef(0);

  const courseOptions = meta?.courses.length ? meta.courses : uniqueSorted(initial.items.map((w) => w.course));
  const groupOptions = meta?.groups.length ? meta.groups : uniqueSorted(initial.items.map((w) => w.group));

  // Danh sách sau khi lọc. Dữ liệu thật đã được server lọc/sắp xếp; dữ liệu mẫu thì lọc ở đây.
  const filtered = useMemo(() => {
    let base = items;
    if (sample) {
      base = items.filter((w) => (!filters.course || w.course === filters.course) && (!filters.group || w.group === filters.group));
      base = sortWorks(base, filters.sort);
    }
    return search.trim() ? base.filter((w) => matchesSearch(w, search)) : base;
  }, [items, sample, filters, search]);

  const pageCount = pageCountFor(filtered.length, pageSize);
  const current = Math.min(page, pageCount);
  const pageItems = pageSlice(filtered, current, pageSize);
  const hasMore = !sample && nextCursor !== null;
  const filtering = filters.course !== "" || filters.group !== "" || filters.sort !== "newest" || search.trim() !== "";
  const first = filtered.length === 0 ? 0 : (current - 1) * pageSize + 1;
  const last = Math.min(current * pageSize, filtered.length);

  async function fetchBatch(next: Filters, cursor: string | null): Promise<ExhibitionPage> {
    const params = new URLSearchParams();
    if (next.course) params.set("khoa", next.course);
    if (next.group) params.set("to", next.group);
    if (next.sort === "oldest") params.set("sort", "oldest");
    if (cursor) params.set("cursor", cursor);
    const response = await fetch(`/api/trien-lam?${params.toString()}`);
    if (!response.ok) throw new Error("failed");
    return (await response.json()) as ExhibitionPage;
  }

  /** Đổi bộ lọc phía server (khóa/tổ/thứ tự): tải lại từ đầu. */
  async function applyFilters(next: Filters) {
    setFilters(next);
    setPage(1);
    if (sample) return;
    const mine = ++ticket.current;
    setLoading(true);
    setFailed(false);
    try {
      const batch = await fetchBatch(next, null);
      if (mine !== ticket.current) return; // đã có yêu cầu mới hơn
      setItems(batch.items);
      setNextCursor(batch.nextCursor);
    } catch {
      if (mine === ticket.current) setFailed(true);
    } finally {
      if (mine === ticket.current) setLoading(false);
    }
  }

  /** Tải thêm cho đến khi đủ `need` tác phẩm (hoặc hết). Trả về số tác phẩm đã có. */
  async function loadUntil(need: number): Promise<number> {
    let have = items.length;
    let cursor = nextCursor;
    const mine = ++ticket.current;
    setLoading(true);
    setFailed(false);
    try {
      let acc = items;
      while (cursor && have < need) {
        const batch = await fetchBatch(filters, cursor);
        if (mine !== ticket.current) return have;
        acc = [...acc, ...batch.items];
        have = acc.length;
        cursor = batch.nextCursor;
        setItems(acc);
        setNextCursor(cursor);
      }
    } catch {
      if (mine === ticket.current) setFailed(true);
    } finally {
      if (mine === ticket.current) setLoading(false);
    }
    return have;
  }

  function scrollToList() {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function goTo(n: number) {
    if (n < 1) return;
    if (n > pageCount && hasMore && !search.trim()) {
      const have = await loadUntil(n * pageSize);
      if (have === 0) return;
    }
    setPage(n);
    scrollToList();
  }

  function changePageSize(size: number) {
    if (!isPageSize(size)) return;
    setPageSize(size);
    setPage(1);
  }

  function clearAll() {
    setSearch("");
    setPageSize(DEFAULT_PAGE_SIZE);
    if (filters.course !== "" || filters.group !== "" || filters.sort !== "newest") void applyFilters({ course: "", group: "", sort: "newest" });
    else setPage(1);
  }

  // Popup
  const selectedIndex = selectedId ? pageItems.findIndex((w) => w.id === selectedId) : -1;
  const selected = selectedIndex >= 0 ? pageItems[selectedIndex] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  function step(delta: number) {
    const target = pageItems[selectedIndex + delta];
    if (target) setSelectedId(target.id);
  }

  function onDialogKey(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
  }

  let totalText = "";
  if (!failed && filtered.length > 0) {
    if (sample || !hasMore) totalText = `Hiển thị ${first}–${last} trong ${filtered.length} tác phẩm`;
    else if (!filtering && meta && meta.works > 0) totalText = `Hiển thị ${first}–${last} trong ${meta.works} tác phẩm`;
    else totalText = `Hiển thị ${first}–${last} (đã tải ${filtered.length}, còn nữa)`;
  }

  return (
    <div className="ex" ref={listRef}>
      {sample ? (
        <p className="ex-sample" role="note">
          <Icon name="bookmark" size={16} /> Đang hiển thị dữ liệu mẫu để xem giao diện (chưa có tác phẩm thật; mọi thẻ dùng chung một ảnh mẫu).
        </p>
      ) : null}

      <div className="ex-filters">
        <label className="ex-search">
          <span className="sr-only">Tìm theo tên học viên, tên bài, tổ hoặc khóa</span>
          <Icon name="search" size={18} className="ex-search-icon" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={sample ? "Tìm theo tên, tên bài, tổ, khóa..." : "Tìm trong các tác phẩm đã tải..."}
            autoComplete="off"
          />
        </label>
        <select aria-label="Khóa" value={filters.course} onChange={(event) => void applyFilters({ ...filters, course: event.target.value })}>
          <option value="">Tất cả khóa</option>
          {courseOptions.map((c) => (
            <option key={c} value={c}>{`Khóa ${c}`}</option>
          ))}
        </select>
        <select aria-label="Tổ" value={filters.group} onChange={(event) => void applyFilters({ ...filters, group: event.target.value })}>
          <option value="">Tất cả tổ</option>
          {groupOptions.map((g) => (
            <option key={g} value={g}>{`Tổ ${g}`}</option>
          ))}
        </select>
        <select aria-label="Thời gian" value={filters.sort} onChange={(event) => void applyFilters({ ...filters, sort: event.target.value as ExhibitionSort })}>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
        <button type="button" className="ex-reset" onClick={clearAll} disabled={!filtering && pageSize === DEFAULT_PAGE_SIZE}>
          <Icon name="close" size={16} /> Xóa bộ lọc
        </button>
      </div>

      <div className="ex-result-row">
        <p className="ex-result" role="status" aria-live="polite">
          {loading ? "Đang tải tác phẩm..." : totalText}
        </p>
        <label className="ex-size">
          <span>Mỗi trang</span>
          <select aria-label="Số tác phẩm mỗi trang" value={pageSize} onChange={(event) => changePageSize(Number(event.target.value))}>
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>{`${n} tác phẩm`}</option>
            ))}
          </select>
        </label>
      </div>

      {failed ? (
        <p className="ex-message ex-message-error">
          {initialStatus === "unconfigured" && items.length === 0 ? "Nội dung đang được cập nhật." : "Chưa tải được tác phẩm. Vui lòng thử lại sau."}
        </p>
      ) : null}

      {!failed && !loading && filtered.length === 0 ? <p className="ex-message">Chưa có tác phẩm phù hợp với bộ lọc.</p> : null}

      <ul className="ex-grid">
        {pageItems.map((work, index) => (
          <li key={work.id} className="ex-card">
            <button type="button" className="ex-card-btn" onClick={() => setSelectedId(work.id)} aria-label={`Tác phẩm của ${work.studentName || "học viên"}${work.description ? `: ${work.description}` : ""}`}>
              <span className="ex-thumb">
                <Artwork work={work} width={488} height={600} fetchWidth={600} eager={index < 2} className="ex-thumb-img" sizes="(max-width: 700px) 50vw, 260px" />
              </span>
              <span className="ex-card-body">
                <span className="ex-author-row">
                  <Author work={work} size={40} />
                  <span className="ex-author-text">
                    <span className="ex-author">{work.studentName || "Học viên"}</span>
                    <time className="ex-date" dateTime={work.submittedAt}>
                      {formatVnDate(work.submittedAt)}
                    </time>
                  </span>
                </span>
                <span className="ex-tags">
                  {work.group ? <span>{`Tổ ${work.group}`}</span> : null}
                  {work.course ? <span>{`Khóa ${work.course}`}</span> : null}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {pageCount > 1 || hasMore ? (
        <nav className="ex-pager" aria-label="Phân trang">
          <button type="button" className="ex-page-btn" onClick={() => void goTo(current - 1)} disabled={current <= 1 || loading}>
            <Icon name="arrow-left" size={16} /> Trước
          </button>
          <ol>
            {pageWindow(current, pageCount).map((n, i) =>
              n === "…" ? (
                <li key={`gap-${i}`} className="ex-gap" aria-hidden="true">
                  …
                </li>
              ) : (
                <li key={n}>
                  <button type="button" className={n === current ? "ex-page-num is-current" : "ex-page-num"} aria-current={n === current ? "page" : undefined} aria-label={`Trang ${n}`} onClick={() => void goTo(n)} disabled={loading}>
                    {n}
                  </button>
                </li>
              ),
            )}
            {hasMore ? (
              <li className="ex-gap" aria-hidden="true">
                …
              </li>
            ) : null}
          </ol>
          <button type="button" className="ex-page-btn" onClick={() => void goTo(current + 1)} disabled={loading || (current >= pageCount && !hasMore)}>
            Sau <Icon name="chevron-right" size={16} />
          </button>
        </nav>
      ) : null}

      <dialog
        ref={dialogRef}
        className="ex-dialog"
        aria-label="Xem tác phẩm"
        onClose={() => setSelectedId(null)}
        onKeyDown={onDialogKey}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <button type="button" className="ex-close" aria-label="Đóng" onClick={() => dialogRef.current?.close()}>
          <Icon name="close" size={20} />
        </button>
        {selected ? (
          <div className="ex-dialog-grid">
            <div className="ex-dialog-art">
              <Artwork work={selected} width={488} height={600} fetchWidth={1600} className="ex-dialog-image" sizes="(max-width: 700px) 94vw, 520px" />
            </div>
            <div className="ex-dialog-info">
              <p className="ex-dialog-mark">TÁC PHẨM TRIỂN LÃM</p>
              <div className="ex-dialog-author">
                <Author work={selected} size={64} />
                <div>
                  <h2>{selected.studentName || "Học viên"}</h2>
                  <p className="ex-dialog-sub">Học viên Thanh Phong Thư Môn</p>
                </div>
              </div>
              <dl className="ex-facts">
                <div>
                  <dt>Tổ</dt>
                  <dd>{selected.group || "—"}</dd>
                </div>
                <div>
                  <dt>Khóa</dt>
                  <dd>{selected.course || "—"}</dd>
                </div>
                <div>
                  <dt>Ngày nộp</dt>
                  <dd>{formatVnDate(selected.submittedAt) || "—"}</dd>
                </div>
              </dl>
              {selected.description ? (
                <div className="ex-dialog-work">
                  <span>Bài tập</span>
                  <strong>{selected.description}</strong>
                </div>
              ) : null}
              {driveViewUrl(selected.driveFileId) ? (
                <a className="ex-more-link" href={driveViewUrl(selected.driveFileId) as string} target="_blank" rel="noopener noreferrer">
                  Mở ảnh gốc
                  <Icon name="chevron-right" size={16} />
                </a>
              ) : null}
              <div className="ex-dialog-nav">
                <button type="button" onClick={() => step(-1)} disabled={selectedIndex <= 0}>
                  <Icon name="arrow-left" size={16} /> Trước
                </button>
                <span>
                  {selectedIndex + 1} / {pageItems.length}
                </span>
                <button type="button" onClick={() => step(1)} disabled={selectedIndex >= pageItems.length - 1}>
                  Sau <Icon name="chevron-right" size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
