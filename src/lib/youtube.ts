/** Lấy mã video YouTube (11 ký tự) từ đường dẫn hoặc từ chính mã. Không hợp lệ -> "". Chỉ dùng mã đã kiểm tra để dựng URL nhúng. */
const ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeId(input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (ID.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.split("/")[1] ?? "";
    else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "watch") id = url.searchParams.get("v") ?? "";
      else if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) id = parts[1] ?? "";
    }
    return ID.test(id) ? id : "";
  } catch {
    return "";
  }
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
}

export function youtubeThumbUrl(id: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
}
