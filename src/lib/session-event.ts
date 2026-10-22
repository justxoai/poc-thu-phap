/** Sự kiện trình duyệt phát ra khi đăng nhập/đăng xuất ở một nơi trên trang, để khung Minh Hồng hỏi lại trạng thái. */
export const SESSION_EVENT = "thudao:session-changed";

export function announceSessionChange(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EVENT));
}
