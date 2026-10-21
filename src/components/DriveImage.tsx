import Image from "next/image";

import { driveThumbnailUrl } from "@/lib/drive";

/**
 * Ảnh từ Google Drive (tạm thời). Dùng `unoptimized` vì Drive đã tạo thumbnail sẵn và để Vercel không phải tải lại ảnh gốc.
 * Không có mã hợp lệ thì không hiển thị gì.
 */
export function DriveImage({
  id,
  alt,
  width,
  height,
  className,
  priority,
  loading,
  fetchWidth,
}: {
  id: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  /** Chiều rộng thumbnail xin từ Drive (mặc định theo `width`). */
  fetchWidth?: number;
}) {
  const src = driveThumbnailUrl(id, fetchWidth ?? width);
  if (!src) return null;
  return (
    <Image src={src} alt={alt} width={width} height={height} className={className} unoptimized priority={priority} loading={priority ? undefined : (loading ?? "lazy")} />
  );
}
