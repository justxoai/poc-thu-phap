import "server-only";

/**
 * Đọc cấu hình Firebase từ biến môi trường (KHÔNG hardcode).
 * Tên biến dùng camelCase đúng như Firebase Console cấp: apiKey, authDomain, projectId...
 * Chỉ chạy ở server. Khi cần cho client (đăng nhập sau này), truyền qua props từ Server Component.
 */

const WEB_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

const ADMIN_KEYS = ["projectId", "clientEmail", "privateKey"] as const;

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

/** Tên các biến web còn thiếu (rỗng nghĩa là đủ). */
export function missingWebEnv(): string[] {
  return WEB_KEYS.filter((key) => !process.env[key]);
}

/** Tên các biến service account còn thiếu (rỗng nghĩa là đủ). */
export function missingAdminEnv(): string[] {
  return ADMIN_KEYS.filter((key) => !process.env[key]);
}

/** Cấu hình web của Firebase, hoặc null nếu thiếu biến bắt buộc. */
export function getFirebaseWebConfig(): FirebaseWebConfig | null {
  if (missingWebEnv().length > 0) return null;
  return {
    apiKey: process.env.apiKey as string,
    authDomain: process.env.authDomain as string,
    projectId: process.env.projectId as string,
    storageBucket: process.env.storageBucket as string,
    messagingSenderId: process.env.messagingSenderId as string,
    appId: process.env.appId as string,
    measurementId: process.env.measurementId || undefined,
  };
}
