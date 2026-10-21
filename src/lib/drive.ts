/**
 * Ảnh bài tập hiện nằm ở Google Drive (tạm thời, xem AGENTS.md). Chỉ nhận mã tệp hợp lệ để không tạo URL tùy ý.
 * Drive không phải CDN: có thể bị giới hạn tốc độ khi nhiều người xem cùng lúc.
 */
const FILE_ID = /^[A-Za-z0-9_-]{10,200}$/;

export function isDriveFileId(id: string): boolean {
  return FILE_ID.test(id);
}

/** Ảnh thu nhỏ do Drive tạo sẵn; width là chiều rộng mong muốn (px). */
export function driveThumbnailUrl(fileId: string, width = 650): string | null {
  if (!isDriveFileId(fileId)) return null;
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${Math.round(width)}`;
}

export function driveViewUrl(fileId: string): string | null {
  if (!isDriveFileId(fileId)) return null;
  return `https://drive.google.com/open?id=${encodeURIComponent(fileId)}`;
}

/**
 * Lấy mã tệp từ thứ học viên dán vào: mã trần hoặc liên kết Google Drive
 * (`/file/d/<mã>/view`, `open?id=<mã>`, `uc?id=<mã>`). Chỉ nhận máy chủ drive.google.com / docs.google.com, https.
 * Trả null nếu không nhận ra, để không lưu địa chỉ tùy ý.
 */
export function extractDriveFileId(raw: string): string | null {
  const text = raw.trim();
  if (isDriveFileId(text)) return text;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || (url.hostname !== "drive.google.com" && url.hostname !== "docs.google.com")) return null;
  const fromPath = /\/d\/([A-Za-z0-9_-]{10,200})(?:\/|$)/.exec(url.pathname);
  const id = fromPath ? fromPath[1] : url.searchParams.get("id");
  return id && isDriveFileId(id) ? id : null;
}
