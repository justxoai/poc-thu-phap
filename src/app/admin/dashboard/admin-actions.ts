"use server";

import { revalidatePath } from "next/cache";

import { findGem, findRarity } from "@/data/gems";
import { findItemImage } from "@/data/item-images";
import { findMerchant } from "@/data/merchants";
import { POST_LABELS, labelSlug } from "@/data/labels";
import { clearCache } from "@/lib/cache";
import { CATALOG_KINDS, CATALOG_TEXT, builtinCatalog, documentCatalogId, type CatalogSeed } from "@/lib/catalog";
import { canAdminWrite, getAdminViewer } from "@/lib/admin-guard";
import { parseNonNegInt, parseSignedInt, parseThumbnail, parseVnDate, slugFromTitle, vnDateString } from "@/lib/admin-input";
import { AdminOpError, ORDER_STATUSES, adjustWallet, restockMarketItem, saveCatalogItem, saveMarketItem, savePost, seedCatalogItems, setOrderStatus } from "@/lib/firestore/admin-write";
import { archiveStudent, placeStudent } from "@/lib/firestore/accounts";
import { listPaidDocuments } from "@/lib/firestore/admin-catalog";
import { normalizeCode } from "@/lib/firestore/students";
import { postDocId, parsePostId, postHref } from "@/lib/post-id";
import { sanitizePostHtml } from "@/lib/sanitize-post";
import { cleanLine, parseIntInRange } from "@/lib/validation";
import { logError } from "@/lib/log-error";

/**
 * Server Action của khu thầy. Mỗi action: (1) kiểm tra quyền GHI trước tiên, (2) kiểm tra lại mọi đầu vào ở server,
 * (3) chỉ trả thông báo tiếng Việt, không lộ chi tiết lỗi. Tiền/điểm chỉ đổi qua lib/wallet.ts (sổ cái).
 */
export type AdminOpState = { status: "idle" } | { status: "ok"; message: string } | { status: "error"; message: string };

const NO_WRITE: AdminOpState = { status: "error", message: "Chỉ tài khoản quản trị (role admin) mới thực hiện được thao tác này. Hãy đăng nhập lại." };
const FAILED: AdminOpState = { status: "error", message: "Chưa thực hiện được. Vui lòng thử lại sau." };
const fail = (message: string): AdminOpState => ({ status: "error", message });

async function guarded(run: () => Promise<AdminOpState>): Promise<AdminOpState> {
  if (!(await canAdminWrite())) return NO_WRITE;
  try {
    const state = await run();
    if (state.status === "ok") revalidatePath("/admin/dashboard");
    return state;
  } catch (error) {
    if (error instanceof AdminOpError) return fail(error.message);
    logError("admin-action", error);
    return FAILED;
  }
}

const SAFE_DOC_ID = /^[A-Za-z0-9_-]{1,120}$/;
const docId = (raw: unknown): string | null => (typeof raw === "string" && SAFE_DOC_ID.test(raw) ? raw : null);

/* ---------- Ngọc ---------- */

const MAX_ADJUST = 100_000;

export async function adjustWalletAction(_prev: AdminOpState, formData: FormData): Promise<AdminOpState> {
  return guarded(async () => {
    const studentId = normalizeCode(formData.get("studentId"));
    if (!studentId) return fail("Mã học viên không hợp lệ.");
    const gem = findGem(typeof formData.get("gem") === "string" ? (formData.get("gem") as string) : "");
    if (!gem) return fail("Hãy chọn loại ngọc.");
    const amount = parseSignedInt(formData.get("amount"), MAX_ADJUST);
    if (amount === null || amount === 0) return fail(`Số lượng phải là số nguyên khác 0, tối đa ${MAX_ADJUST}.`);
    const source = formData.get("source") === "teacher_gift" ? "teacher_gift" : "admin_adjust";
    if (source === "teacher_gift" && amount < 0) return fail("“Thầy tặng” chỉ để cộng. Muốn trừ, chọn “Điều chỉnh”.");
    const note = cleanLine(formData.get("note"), 200);
    if (source === "admin_adjust" && note.length < 3) return fail("Điều chỉnh cần ghi lý do (ít nhất 3 ký tự).");
    const r = await adjustWallet({ studentId, gemKey: gem.key, amount, source, note });
    return { status: "ok", message: `${r.duplicate ? "Thao tác này đã ghi trước đó (không ghi lại). " : ""}${r.name}: ${amount > 0 ? "+" : ""}${amount} ${r.label}. Số dư mới: ${r.balanceAfter}.` };
  });
}

/* ---------- Xếp Tổ/Khóa cho học viên mới ---------- */

export async function placeStudentAction(_prev: AdminOpState, formData: FormData): Promise<AdminOpState> {
  return guarded(async () => {
    const studentId = normalizeCode(formData.get("studentId"));
    if (!studentId) return fail("Mã học viên không hợp lệ.");
    const group = parseIntInRange(formData.get("group"), 1, 99);
    const course = parseIntInRange(formData.get("course"), 1, 99);
    if (group === null) return fail("Tổ phải là số từ 1 đến 99.");
    if (course === null) return fail("Khóa phải là số từ 1 đến 99.");
    if ((await placeStudent(studentId, String(group), String(course))) === "missing") return fail("Không tìm thấy học viên với mã này.");
    return { status: "ok", message: `Đã xếp ${studentId} vào Khóa ${course}, Tổ ${group}.` };
  });
}

/* ---------- Xóa mềm học viên ---------- */

export async function deleteStudentAction(_prev: AdminOpState, formData: FormData): Promise<AdminOpState> {
  return guarded(async () => {
    const admin = await getAdminViewer();
    if (!admin) return NO_WRITE;
    const studentId = normalizeCode(formData.get("studentId"));
    if (!studentId) return fail("Mã học viên không hợp lệ.");
    if (studentId === admin.studentId) return fail("Không thể xóa chính tài khoản đang đăng nhập.");
    const result = await archiveStudent(studentId, admin.studentId);
    if (result === "missing") return fail("Không tìm thấy học viên (có thể đã được xóa).");
    if (result === "protected") return fail("Không xóa được tài khoản quản trị.");
    return { status: "ok", message: `Đã xóa ${studentId}. Hồ sơ được lưu ở studentsArchive nên có thể khôi phục.` };
  });
}

/* ---------- Chợ phiên ---------- */

export async function saveMarketItemAction(_prev: AdminOpState, formData: FormData): Promise<AdminOpState> {
  return guarded(async () => {
    const text = (key: string): string => {
      const v = formData.get(key);
      return typeof v === "string" ? v : "";
    };
    const rawId = text("id");
    const id = rawId !== "" ? docId(rawId) : null;
    if (rawId !== "" && !id) return fail("Mã vật phẩm không hợp lệ.");
    const name = cleanLine(formData.get("name"), 80);
    if (name.length < 2) return fail("Tên vật phẩm quá ngắn.");
    const merchant = findMerchant(text("merchantId"));
    if (!merchant) return fail("Hãy chọn người bán (một trong các thương nhân).");
    const rarity = findRarity(text("rarity"));
    if (!rarity) return fail("Hãy chọn hạng vật phẩm.");
    // Giá tính bằng loại ngọc gắn với hạng vật phẩm (xem RARITIES), không cho chọn riêng.
    const gem = findGem(rarity.gem);
    if (!gem) return fail("Hạng vật phẩm chưa có loại ngọc định giá.");
    const price = parseNonNegInt(text("price"), 1_000_000);
    if (price === null) return fail("Giá trị phải là số nguyên từ 0 đến 1.000.000.");
    const promo = text("promo") === "yes";
    let promoPercent = 0;
    if (promo) {
      const n = parseNonNegInt(text("promoPercent"), 99);
      if (n === null || n < 1) return fail("Giá trị khuyến mãi là phần trăm giảm, từ 1 đến 99.");
      promoPercent = n;
    }
    const stockRaw = text("stock").trim();
    const stock = stockRaw === "" ? null : parseNonNegInt(stockRaw, 100_000);
    if (stockRaw !== "" && stock === null) return fail("Tồn kho phải là số nguyên từ 0 đến 100.000 (để trống = không giới hạn).");
    const imageRaw = text("image").trim();
    if (imageRaw !== "" && !findItemImage(imageRaw)) return fail("Ảnh không có trong danh sách ảnh vật phẩm.");
    const result = await saveMarketItem({
      id,
      name,
      description: cleanLine(formData.get("description"), 160),
      price,
      currency: gem.name,
      rarity: rarity.key,
      stock,
      image: imageRaw,
      merchantId: merchant.id,
      promo,
      promoPercent,
      active: formData.get("active") === "on",
    });
    clearCache("market:list");
    revalidatePath("/cho-phien");
    revalidatePath("/phien-cho");
    return { status: "ok", message: result.created ? `Đã thêm “${name}” cho ${merchant.name}.` : `Đã lưu “${name}”.` };
  });
}

export async function restockAction(_prev: AdminOpState, formData: FormData): Promise<AdminOpState> {
  return guarded(async () => {
    const id = docId(formData.get("id"));
    if (!id) return fail("Mã vật phẩm không hợp lệ.");
    const delta = parseSignedInt(formData.get("delta"), 100_000);
    if (delta === null || delta === 0) return fail("Số lượng nhập thêm phải là số nguyên khác 0.");
    const next = await restockMarketItem(id, delta);
    clearCache("market:list");
    revalidatePath("/cho-phien");
    return { status: "ok", message: `Tồn kho mới: ${next}.` };
  });
}

export async function orderStatusAction(_prev: AdminOpState, formData: FormData): Promise<AdminOpState> {
  return guarded(async () => {
    const id = docId(formData.get("id"));
    const status = ORDER_STATUSES.find((s) => s === formData.get("status"));
    if (!id || !status) return fail("Dữ liệu đơn không hợp lệ.");
    await setOrderStatus(id, status);
    return { status: "ok", message: "Đã cập nhật trạng thái." };
  });
}

/* ---------- Tin tức ---------- */

const LABEL_SET: ReadonlySet<string> = new Set(POST_LABELS);
const MAX_HTML = 200_000;

export async function savePostAction(_prev: AdminOpState, formData: FormData): Promise<AdminOpState> {
  return guarded(async () => {
    const editing = typeof formData.get("id") === "string" && formData.get("id") !== "" ? (formData.get("id") as string) : null;
    if (editing && !parsePostId(editing)) return fail("Mã bài không hợp lệ.");
    const title = cleanLine(formData.get("title"), 150);
    if (title.length < 3) return fail("Tiêu đề quá ngắn.");
    const date = parseVnDate(formData.get("date"));
    if (!date) return fail("Ngày đăng không hợp lệ.");
    const html = typeof formData.get("html") === "string" ? (formData.get("html") as string) : "";
    if (html.length > MAX_HTML) return fail("Nội dung quá dài.");
    const thumbnail = parseThumbnail(formData.get("thumbnail"));
    if (thumbnail === null) return fail("Ảnh đại diện phải là mã/liên kết Google Drive hoặc địa chỉ https (hoặc để trống).");
    const labels = formData.getAll("labels").filter((x): x is string => typeof x === "string" && LABEL_SET.has(x)).slice(0, 5);

    let id = editing;
    if (!id) {
      const slugRaw = cleanLine(formData.get("slug"), 80);
      const slug = slugFromTitle(slugRaw || title);
      const ym = vnDateString(date);
      id = slug ? postDocId(ym.slice(0, 4), ym.slice(5, 7), slug) : null;
      if (!id) return fail("Không tạo được đường dẫn từ tiêu đề. Hãy nhập đường dẫn (chữ không dấu, số, dấu gạch ngang).");
    }
    await savePost({
      id,
      isNew: editing === null,
      title,
      summary: cleanLine(formData.get("summary"), 300),
      thumbnail,
      labels,
      publishedAt: date,
      html: sanitizePostHtml(html),
      status: formData.get("status") === "published" ? "published" : "draft",
    });
    clearCache();
    revalidatePath("/tin-tuc");
    for (const label of labels) revalidatePath(`/nhan/${labelSlug(label)}`);
    const href = postHref(id);
    if (href) revalidatePath(href);
    return { status: "ok", message: `Đã lưu bài${href ? ` (${href})` : ""}.` };
  });
}

/* ---------- Danh mục bán ---------- */

const kindOf = (raw: unknown) => CATALOG_KINDS.find((k) => k === raw) ?? null;

export async function saveCatalogItemAction(_prev: AdminOpState, formData: FormData): Promise<AdminOpState> {
  return guarded(async () => {
    const rawId = formData.get("id");
    const id = typeof rawId === "string" && rawId !== "" ? docId(rawId) : null;
    if (typeof rawId === "string" && rawId !== "" && !id) return fail("Mã mục không hợp lệ.");
    const kind = kindOf(formData.get("kind"));
    if (!kind) return fail("Loại danh mục không hợp lệ.");
    const name = cleanLine(formData.get("name"), 120);
    if (name.length < 2) return fail("Tên quá ngắn.");
    const priceRaw = formData.get("price");
    const price = parseNonNegInt(priceRaw, 1_000_000_000);
    if (price === null) return fail("Giá phải là số nguyên từ 0 đến 1.000.000.000 (đồng).");
    const result = await saveCatalogItem({ id, kind, name, description: cleanLine(formData.get("description"), 300), price, active: formData.get("active") === "on" });
    return { status: "ok", message: result.created ? `Đã thêm “${name}”.` : `Đã lưu “${name}”.` };
  });
}

export async function seedCatalogAction(_prev: AdminOpState, formData: FormData): Promise<AdminOpState> {
  return guarded(async () => {
    const kind = kindOf(formData.get("kind"));
    if (!kind) return fail("Loại danh mục không hợp lệ.");
    let seeds: CatalogSeed[] = builtinCatalog(kind);
    if (kind === "document") seeds = await listPaidDocumentSeeds();
    const added = await seedCatalogItems(seeds);
    const noun = CATALOG_TEXT[kind].noun;
    if (seeds.length === 0) return { status: "ok", message: `Không có ${noun} có sẵn để nạp.` };
    return { status: "ok", message: added === 0 ? `Các ${noun} có sẵn đã có trong danh mục.` : `Đã nạp thêm ${added} ${noun}.` };
  });
}

async function listPaidDocumentSeeds(): Promise<CatalogSeed[]> {
  const rows = await listPaidDocuments();
  return rows.map((d) => ({ id: documentCatalogId(d.id), kind: "document" as const, name: d.title, description: d.description, price: 0 }));
}
