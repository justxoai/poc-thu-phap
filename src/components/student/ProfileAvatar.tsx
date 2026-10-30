import Image from "next/image";

import { AVATARS, BACKGROUNDS, FRAMES, normalizeDecor, type Decor } from "@/data/decor";
import { Icon } from "@/components/ui/Icon";

import "./decor.css";

/** Dưới cỡ này (thanh bên, danh sách nhỏ) không vẽ khung vì chi tiết khung bị mất. */
const MIN_FRAME_SIZE = 48;
/** Avatar phóng to nhẹ so với lỗ khung để mép avatar nằm dưới viền khung, không hở. */
const HOLE_GROW = 1.06;

/**
 * Avatar + khung của học viên. `size` là cạnh của cả khối (gồm khung). Avatar nằm TRONG khung, khung đè lên mép avatar.
 * Mã lạ rơi về mặc định (xem data/decor.ts). Avatar mặc định là chữ cái đầu của tên.
 */
export function ProfileAvatar({ name, decor, size = 72 }: { name: string; decor: Decor | { avatar: string; frame: string; background: string }; size?: number }) {
  const d = normalizeDecor(decor);
  const avatar = AVATARS.find((a) => a.id === d.avatar) ?? AVATARS[0];
  const frame = FRAMES.find((f) => f.id === d.frame) ?? FRAMES[0];
  const framed = frame.src !== null && frame.hole !== null && size >= MIN_FRAME_SIZE;

  // Vùng đặt avatar, theo phần trăm của khối.
  let box = { left: 0, top: 0, width: 100, height: 100 };
  if (framed && frame.hole) {
    const { x, y, r } = frame.hole;
    const rr = r * HOLE_GROW;
    box = { left: ((x - rr) / 300) * 100, top: ((y - rr) / 300) * 100, width: ((2 * rr) / 300) * 100, height: ((2 * rr) / 300) * 100 };
  }
  const inner = Math.round((size * box.width) / 100);
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <span className={`dc-box${size < MIN_FRAME_SIZE ? " dc-sm" : ""}`} style={{ width: size, height: size }} aria-hidden="true">
      <span className="dc-in" style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}>
        {avatar.src ? (
          <Image className="dc-img" src={avatar.src} alt="" width={inner} height={inner} />
        ) : (
          <span className={`dc-letter${framed ? "" : " dc-letter-ring"}`} style={{ fontSize: Math.round(inner * 0.42) }}>
            {initial || <Icon name="user" size={Math.round(inner * 0.5)} />}
          </span>
        )}
      </span>
      {framed && frame.src ? <Image className="dc-frame" src={frame.src} alt="" width={size} height={size} /> : null}
    </span>
  );
}

/** Tên lớp nền hồ sơ (gắn vào khối bao hồ sơ). Nền ảnh có thêm `dc-bg-image` để khối chữ có lớp mờ cho dễ đọc. */
export function backgroundClass(decor: Decor | { avatar: string; frame: string; background: string }): string {
  const id = normalizeDecor(decor).background;
  const option = BACKGROUNDS.find((b) => b.id === id);
  return `dc-bg-${id}${option?.src ? " dc-bg-image" : ""}`;
}
