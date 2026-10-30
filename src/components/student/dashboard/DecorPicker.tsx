"use client";

import { useActionState, useState } from "react";

import { saveDecorAction, type SaveDecorState } from "@/app/student/dashboard/trang-tri/actions";
import { ProfileAvatar, backgroundClass } from "@/components/student/ProfileAvatar";
import { AVATARS, BACKGROUNDS, FRAMES, isDecorOwned, type Decor, type DecorKind } from "@/data/decor";

const IDLE: SaveDecorState = { status: "idle" };

/** Dòng trạng thái dưới mỗi mục. POC: mọi mục đều đã sở hữu; mục chưa sở hữu bị khóa (sẽ mua ở Phiên chợ). */
function Own({ kind, id }: { kind: DecorKind; id: string }) {
  const owned = isDecorOwned(kind, id);
  return <span className={owned ? "dc-own" : "dc-own is-no"}>{owned ? "Đã sở hữu" : "Chưa sở hữu"}</span>;
}

/** Chọn Avatar, Khung, Nền hồ sơ, có xem trước. Server kiểm tra lại mã và quyền sở hữu trước khi lưu. */
export function DecorPicker({ name, initial }: { name: string; initial: Decor }) {
  const [decor, setDecor] = useState<Decor>(initial);
  const [state, formAction, pending] = useActionState(saveDecorAction, IDLE);
  const pick = (key: keyof Decor) => (value: string) => setDecor((d) => ({ ...d, [key]: value }));

  return (
    <form action={formAction} className="dc-picker">
      <div className={`dc-preview ${backgroundClass(decor)}`} aria-label="Xem trước hồ sơ">
        <ProfileAvatar name={name} decor={decor} size={132} />
        <div className="dc-preview-text">
          <strong>{name || "Học viên"}</strong>
          <small>Xem trước hồ sơ</small>
        </div>
      </div>

      <fieldset className="dc-group">
        <legend>Avatar</legend>
        <div className="dc-options">
          {AVATARS.map((a) => {
            const owned = isDecorOwned("avatar", a.id);
            return (
              <label key={a.id} className={owned ? "dc-option" : "dc-option is-locked"}>
                <input type="radio" name="avatar" value={a.id} checked={decor.avatar === a.id} disabled={!owned} onChange={() => pick("avatar")(a.id)} />
                <span className="dc-thumb">
                  <ProfileAvatar name={name} decor={{ avatar: a.id, frame: "none", background: "paper" }} size={76} />
                </span>
                <span className="dc-name">{a.label}</span>
                <Own kind="avatar" id={a.id} />
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="dc-group">
        <legend>Khung</legend>
        <div className="dc-options">
          {FRAMES.map((f) => {
            const owned = isDecorOwned("frame", f.id);
            return (
              <label key={f.id} className={owned ? "dc-option" : "dc-option is-locked"}>
                <input type="radio" name="frame" value={f.id} checked={decor.frame === f.id} disabled={!owned} onChange={() => pick("frame")(f.id)} />
                <span className="dc-thumb">
                  <ProfileAvatar name={name} decor={{ avatar: decor.avatar, frame: f.id, background: "paper" }} size={84} />
                </span>
                <span className="dc-name">{f.label}</span>
                <Own kind="frame" id={f.id} />
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="dc-group">
        <legend>Nền hồ sơ</legend>
        <div className="dc-options dc-options-wide">
          {BACKGROUNDS.map((b) => {
            const owned = isDecorOwned("background", b.id);
            return (
              <label key={b.id} className={owned ? "dc-option" : "dc-option is-locked"}>
                <input type="radio" name="background" value={b.id} checked={decor.background === b.id} disabled={!owned} onChange={() => pick("background")(b.id)} />
                <span className={`dc-swatch dc-bg-${b.id}`} aria-hidden="true" />
                <span className="dc-name">{b.label}</span>
                <Own kind="background" id={b.id} />
              </label>
            );
          })}
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
