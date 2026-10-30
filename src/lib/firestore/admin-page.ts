import "server-only";

import type { Query, QueryDocumentSnapshot } from "firebase-admin/firestore";

import type { PageInfo, PageRequest } from "@/lib/admin-paging";

/**
 * Lấy MỘT trang theo con trỏ từ truy vấn đã có sắp xếp (`base`, chưa có con trỏ/limit).
 * - Trang đầu / trang sau: startAfter(giá trị con trỏ).limit(size + 1); thừa 1 dòng nghĩa là còn trang sau.
 * - Trang trước: endBefore(giá trị con trỏ).limitToLast(size + 1); thừa 1 dòng nghĩa là còn trang trước nữa.
 * `toValues` đổi chuỗi con trỏ (đã đi qua địa chỉ nên phải kiểm tra) thành các giá trị orderBy; trả null nếu con trỏ sai (coi như trang đầu).
 * Tổng số dòng lấy bằng count() trên `countQuery` (cùng điều kiện lọc, không sắp xếp): đọc rất rẻ so với đọc cả tập.
 */
export async function fetchPage(opts: {
  base: Query;
  countQuery: Query;
  req: PageRequest;
  toValues: (cursor: string) => unknown[] | null;
  cursorOf: (doc: QueryDocumentSnapshot) => string | null;
}): Promise<{ docs: QueryDocumentSnapshot[]; info: PageInfo }> {
  const { base, countQuery, req } = opts;
  const size = req.size;
  const beforeVals = req.before ? opts.toValues(req.before) : null;
  const afterVals = !beforeVals && req.after ? opts.toValues(req.after) : null;

  let docs: QueryDocumentSnapshot[];
  let hasPrev: boolean;
  let hasNext: boolean;
  let p = req.p;
  if (beforeVals) {
    const snap = await base.endBefore(...beforeVals).limitToLast(size + 1).get();
    hasPrev = snap.docs.length > size;
    docs = hasPrev ? snap.docs.slice(1) : snap.docs;
    hasNext = true;
  } else {
    const snap = await (afterVals ? base.startAfter(...afterVals) : base).limit(size + 1).get();
    hasNext = snap.docs.length > size;
    docs = snap.docs.slice(0, size);
    hasPrev = afterVals !== null;
    if (!afterVals) p = 1;
  }
  const total = (await countQuery.count().get()).data().count;
  const pages = Math.max(1, Math.ceil(total / size));
  p = Math.min(Math.max(p, 1), pages);
  const first = docs.length > 0 ? opts.cursorOf(docs[0]) : null;
  const last = docs.length > 0 ? opts.cursorOf(docs[docs.length - 1]) : null;
  return { docs, info: { p, size, total, hasPrev, hasNext, first, last, count: docs.length } };
}
