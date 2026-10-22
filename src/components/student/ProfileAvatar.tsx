import { AVATARS, normalizeDecor, type Decor } from "@/data/decor";
import { Icon } from "@/components/ui/Icon";

import "./decor.css";

/** Avatar + khung của học viên. Hiển thị bằng CSS theo mã trong `data/decor.ts`; mã lạ rơi về mặc định. */
export function ProfileAvatar({ name, decor, size = 72 }: { name: string; decor: Decor | { avatar: string; frame: string; background: string }; size?: number }) {
  const d = normalizeDecor(decor);
  const option = AVATARS.find((a) => a.id === d.avatar) ?? AVATARS[0];
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span className={`dc-avatar dc-frame-${d.frame}${size < 48 ? " dc-sm" : ""}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }} aria-hidden="true">
      {option.icon ? <Icon name={option.icon} size={Math.round(size * 0.5)} /> : initial || <Icon name="user" size={Math.round(size * 0.5)} />}
    </span>
  );
}

/** Tên lớp nền hồ sơ (gắn vào khối bao hồ sơ). */
export function backgroundClass(decor: Decor | { avatar: string; frame: string; background: string }): string {
  return `dc-bg-${normalizeDecor(decor).background}`;
}
