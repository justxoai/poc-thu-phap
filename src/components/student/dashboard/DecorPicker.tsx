"use client";

import { useActionState, useState } from "react";

import { saveDecorAction, type SaveDecorState } from "@/app/student/dashboard/trang-tri/actions";
import { ProfileAvatar, backgroundClass } from "@/components/student/ProfileAvatar";
import { AVATARS, BACKGROUNDS, FRAMES, type Decor } from "@/data/decor";
import { Icon } from "@/components/ui/Icon";

const IDLE: SaveDecorState = { status: "idle" };

/** Chọn Avatar, Khung, Nền hồ sơ, có xem trước. Server kiểm tra lại mã trước khi lưu. */
export function DecorPicker({ name, initial }: { name: string; initial: Decor }) {
  const [decor, setDecor] = useState<Decor>(initial);
  const [state, formAction, pending] = useActionState(saveDecorAction, IDLE);
  const pick = (key: keyof Decor) => (value: string) => setDecor((d) => ({ ...d, [key]: value }));

  return (
    <form action={formAction} className="dc-picker">
      <div className={`dc-preview ${backgroundClass(decor)}`} aria-label="Xem trước hồ sơ">
        <ProfileAvatar name={name} decor={decor} size={84} />
        <div>
          <strong>{name || "Học viên"}</strong>
          <small>Xem trước hồ sơ</small>
        </div>
      </div>

      <fieldset className="dc-group">
        <legend>Avatar</legend>
        <div className="dc-options">
          {AVATARS.map((a) => (
            <label key={a.id} className="dc-option">
              <input type="radio" name="avatar" value={a.id} checked={decor.avatar === a.id} onChange={() => pick("avatar")(a.id)} />
              <span className="dc-avatar dc-frame-none" style={{ width: 44, height: 44 }} aria-hidden="true">
                {a.icon ? <Icon name={a.icon} size={22} /> : (name.trim().charAt(0).toUpperCase() || "A")}
              </span>
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="dc-group">
        <legend>Khung</legend>
        <div className="dc-options">
          {FRAMES.map((f) => (
            <label key={f.id} className="dc-option">
              <input type="radio" name="frame" value={f.id} checked={decor.frame === f.id} onChange={() => pick("frame")(f.id)} />
              <span className={`dc-avatar dc-frame-${f.id}`} style={{ width: 40, height: 40, margin: 4 }} aria-hidden="true" />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="dc-group">
        <legend>Nền hồ sơ</legend>
        <div className="dc-options">
          {BACKGROUNDS.map((b) => (
            <label key={b.id} className="dc-option">
              <input type="radio" name="background" value={b.id} checked={decor.background === b.id} onChange={() => pick("background")(b.id)} />
              <span className={`dc-swatch dc-bg-${b.id}`} aria-hidden="true" />
              {b.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div role="status" aria-live="polite">
        {state.status === "error" ? <p className="sd-err">{state.message}</p> : null}
        {state.status === "ok" ? <p className="sd-ok">Đã lưu trang trí hồ sơ.</p> : null}
      </div>
      <button type="submit" className="dc-save" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu trang trí"}
      </button>
    </form>
  );
}
