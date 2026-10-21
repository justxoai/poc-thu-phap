import "server-only";

import { FieldPath, FieldValue } from "firebase-admin/firestore";

import { getDb } from "@/lib/firebase/admin";
import type { CurrencyKey, TransactionSource } from "@/lib/types";

/**
 * MỌI thay đổi số dư của học viên đi qua `changeBalance`.
 * Một Firestore transaction làm đồng thời 3 việc:
 *   1) đọc số dư hiện tại, từ chối nếu kết quả âm;
 *   2) cập nhật `students/{id}.wallet.{currency}`;
 *   3) ghi một bản ghi bất biến vào `transactions` (sổ cái).
 * Bản ghi trong `transactions` không bao giờ được sửa hoặc xóa từ code ứng dụng.
 *
 * Tiền/điểm được coi là số nguyên (cộng là dương, trừ là âm).
 * `idempotencyKey` (tùy chọn) làm ID của bản ghi sổ cái: gọi lại cùng khóa sẽ không cộng/trừ lần nữa.
 * Ví dụ khóa: `quest:{questId}:{studentId}` hoặc `order:{orderId}`.
 */

export interface WalletChange {
  studentId: string;
  currency: CurrencyKey;
  /** Số nguyên khác 0. Dương = cộng, âm = trừ. */
  amount: number;
  source: TransactionSource;
  /** Mã đối tượng liên quan: id đơn hàng, nhiệm vụ, sự kiện... */
  refId?: string;
  note?: string;
  idempotencyKey?: string;
}

export interface WalletChangeResult {
  transactionId: string;
  balanceAfter: number;
  /** true nếu khóa idempotency đã được xử lý trước đó (không thay đổi gì thêm). */
  duplicate: boolean;
}

export class StudentNotFoundError extends Error {
  constructor(studentId: string) {
    super(`Không tìm thấy học viên: ${studentId}`);
    this.name = "StudentNotFoundError";
  }
}

export class InsufficientBalanceError extends Error {
  constructor(
    studentId: string,
    currency: CurrencyKey,
    balance: number,
    required: number,
  ) {
    super(
      `Số dư không đủ (học viên ${studentId}, ${currency}: có ${balance}, cần ${required})`,
    );
    this.name = "InsufficientBalanceError";
  }
}

const SAFE_ID = /^[A-Za-z0-9_:-]{1,120}$/;

function assertValid(change: WalletChange): void {
  const { studentId, currency, amount, idempotencyKey } = change;

  if (!SAFE_ID.test(studentId) || studentId.startsWith("__")) {
    throw new Error("studentId không hợp lệ");
  }
  if (typeof currency !== "string" || currency.length === 0 || currency.length > 60) {
    throw new Error("currency không hợp lệ");
  }
  if (!Number.isSafeInteger(amount) || amount === 0) {
    throw new Error("amount phải là số nguyên khác 0");
  }
  if (
    idempotencyKey !== undefined &&
    (!SAFE_ID.test(idempotencyKey) || idempotencyKey.startsWith("__"))
  ) {
    throw new Error("idempotencyKey không hợp lệ");
  }
}

export async function changeBalance(change: WalletChange): Promise<WalletChangeResult> {
  assertValid(change);

  const { studentId, currency, amount, source, refId, note, idempotencyKey } = change;
  const db = getDb();
  const studentRef = db.collection("students").doc(studentId);
  const ledger = db.collection("transactions");
  const txRef = idempotencyKey ? ledger.doc(idempotencyKey) : ledger.doc();

  return db.runTransaction(async (t) => {
    // Firestore yêu cầu mọi lần đọc phải nằm trước các lần ghi.
    const studentSnap = await t.get(studentRef);
    const existing = idempotencyKey ? await t.get(txRef) : null;

    if (existing?.exists) {
      return {
        transactionId: txRef.id,
        balanceAfter: Number(existing.get("balanceAfter")),
        duplicate: true,
      };
    }

    if (!studentSnap.exists) throw new StudentNotFoundError(studentId);

    const balanceBefore = Number(studentSnap.get(new FieldPath("wallet", currency)) ?? 0);
    if (!Number.isFinite(balanceBefore)) {
      throw new Error(`Số dư không hợp lệ trong dữ liệu (học viên ${studentId}, ${currency})`);
    }

    const balanceAfter = balanceBefore + amount;
    if (balanceAfter < 0) {
      throw new InsufficientBalanceError(studentId, currency, balanceBefore, -amount);
    }

    t.update(
      studentRef,
      new FieldPath("wallet", currency),
      balanceAfter,
      "updatedAt",
      FieldValue.serverTimestamp(),
    );

    t.set(txRef, {
      studentId,
      currency,
      amount,
      balanceAfter,
      source,
      refId: refId ?? null,
      note: note ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { transactionId: txRef.id, balanceAfter, duplicate: false };
  });
}
