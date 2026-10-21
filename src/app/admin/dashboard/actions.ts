"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE, ADMIN_COOKIE_PATH, ADMIN_SESSION_MS, checkAdminKey, createSessionValue, isAdminAuthConfigured } from "@/lib/admin-auth";

export type AdminLoginState = { status: "idle" } | { status: "error"; message: string };

/** Mọi lần sai đều trả cùng một thông báo và chờ một chút để làm chậm việc dò khóa (chưa thay được giới hạn tần suất thật). */
const FAIL_DELAY_MS = 800;

export async function adminLoginAction(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  if (!isAdminAuthConfigured()) return { status: "error", message: "Trang quản trị chưa được cấu hình." };

  const input = formData.get("key");
  if (typeof input !== "string" || input.length === 0 || input.length > 200 || !checkAdminKey(input)) {
    await new Promise((resolve) => setTimeout(resolve, FAIL_DELAY_MS));
    return { status: "error", message: "Khóa không đúng." };
  }

  const value = createSessionValue();
  if (!value) return { status: "error", message: "Trang quản trị chưa được cấu hình." };
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: ADMIN_COOKIE_PATH,
    maxAge: Math.floor(ADMIN_SESSION_MS / 1000),
  });
  redirect("/admin/dashboard");
}

export async function adminLogoutAction(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", { httpOnly: true, path: ADMIN_COOKIE_PATH, maxAge: 0 });
  redirect("/admin/dashboard");
}
