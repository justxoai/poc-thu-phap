import { GEMS, findGem, wealthInHoangNgoc } from "@/data/gems";
import type { TransactionSource } from "@/lib/types";

/** Nhãn hiển thị cho nguồn phát sinh một dòng sổ cái. */
export const SOURCE_LABELS: Record<TransactionSource, string> = {
  study: "Học tập",
  quest: "Nhiệm vụ",
  event: "Sự kiện",
  market: "Chợ phiên",
  mystery_box: "Hộp quà bí ẩn",
  teacher_gift: "Thầy tặng",
  admin_adjust: "Điều chỉnh",
};

export function sourceLabel(source: string): string {
  return (SOURCE_LABELS as Record<string, string>)[source] ?? source;
}

/** Tên hiển thị của một khóa ví: tên ngọc nếu nhận ra, không thì giữ nguyên. */
export function gemLabel(key: string): string {
  return findGem(key)?.name ?? key;
}

export interface WalletLine {
  key: string;
  label: string;
  amount: number;
}

/** Ví theo thứ tự 6 loại ngọc (luôn đủ 6 dòng, thiếu thì 0) rồi tới các khóa lạ nếu có. Tổng tài sản quy ra Hoàng Ngọc. */
export function walletLines(wallet: Record<string, number>): { lines: WalletLine[]; wealth: number } {
  const used = new Set<string>();
  const lines: WalletLine[] = GEMS.map((gem) => {
    let amount = 0;
    for (const [key, value] of Object.entries(wallet)) {
      if (findGem(key)?.key === gem.key) {
        amount += value;
        used.add(key);
      }
    }
    return { key: gem.key, label: gem.name, amount };
  });
  for (const [key, value] of Object.entries(wallet)) if (!used.has(key)) lines.push({ key, label: key, amount: value });
  return { lines, wealth: wealthInHoangNgoc(wallet) };
}

/** Khóa ví đang dùng cho một loại ngọc: nếu ví đã có khóa tương đương (tên hoặc mã) thì dùng lại, không thì dùng mã ngọc. */
export function walletKeyFor(wallet: Record<string, number>, gemKey: string): string {
  for (const key of Object.keys(wallet)) if (findGem(key)?.key === gemKey) return key;
  return gemKey;
}
