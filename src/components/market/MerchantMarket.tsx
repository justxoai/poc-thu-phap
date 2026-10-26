"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { MERCHANTS, type Merchant } from "@/data/merchants";

import "./merchant-market.css";

type Box = { x: number; y: number; w: number; h: number };

/** Vị trí theo tọa độ trang (đã cộng cuộn) nên không bị lệch khi trang cuộn lúc hoán đổi. */
function pageBox(el: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
}

function Figure({ merchant, priority }: { merchant: Merchant; priority?: boolean }) {
  return (
    <span className="mm-figure">
      <Image
        src={merchant.image}
        alt=""
        width={merchant.imageWidth}
        height={merchant.imageHeight}
        sizes="(max-width: 700px) 30vw, 280px"
        priority={priority}
        className="mm-figure-img"
      />
    </span>
  );
}

/**
 * Phiên chợ: lưới thương nhân. Chọn một thương nhân thì người đó "bước" lên khu trưng bày phía trên lưới
 * (nhân vật bên trái, vật phẩm bên phải); chọn người khác thì hai người đổi chỗ cho nhau.
 * Hoạt họa dùng kỹ thuật FLIP: đo vị trí trước và sau khi React đổi bố cục, rồi trượt từ vị trí cũ về vị trí mới.
 */
export function MerchantMarket() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const before = useRef<Map<string, Box> | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);

  const setNode = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) nodes.current.set(id, el);
      else nodes.current.delete(id);
    },
    [],
  );

  function choose(next: string | null) {
    if (next === selectedId) return;
    const snapshot = new Map<string, Box>();
    nodes.current.forEach((el, id) => snapshot.set(id, pageBox(el)));
    before.current = snapshot;
    setSelectedId(next);
  }

  useLayoutEffect(() => {
    const snapshot = before.current;
    before.current = null;
    if (!snapshot) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nodes.current.forEach((el, id) => {
      const from = snapshot.get(id);
      if (!from || reduce || typeof el.animate !== "function") return;
      const to = pageBox(el);
      const dx = from.x - to.x;
      const dy = from.y - to.y;
      const scale = to.w > 0 ? from.w / to.w : 1;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(scale - 1) < 0.01) return;
      const moving = id === selectedId || from.w !== to.w;
      el.style.zIndex = moving ? "5" : "4";
      const run = el.animate(
        [
          { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
          { transformOrigin: "top left", transform: "translate(0, 0) scale(1)" },
        ],
        { duration: 620, easing: "cubic-bezier(0.22, 0.8, 0.24, 1)" },
      );
      const done = () => {
        el.style.zIndex = "";
      };
      run.onfinish = done;
      run.oncancel = done;
    });
    if (selectedId && stageRef.current && !reduce) stageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedId]);

  const selected = MERCHANTS.find((m) => m.id === selectedId) ?? null;
  const others = MERCHANTS.filter((m) => m.id !== selectedId);

  return (
    <div className="mm">
      {selected ? (
        <section className="mm-stage" ref={stageRef} aria-label={`Quầy hàng của ${selected.name}`}>
          <div className="mm-stage-left">
            <div ref={setNode(selected.id)} className="mm-card is-stage" aria-current="true">
              <Figure merchant={selected} priority />
              <span className="mm-card-text">
                <span className="mm-name">{selected.name}</span>
                <span className="mm-shop">{selected.shop}</span>
              </span>
            </div>
          </div>
          <div className="mm-stage-right" key={selected.id}>
            <p className="mm-quote">{selected.greeting}</p>
            <div className="mm-items-head">
              <h2>Món đồ của {selected.name}</h2>
              <button type="button" className="mm-close" onClick={() => choose(null)}>
                <Icon name="close" size={16} /> Thu quầy
              </button>
            </div>
            <ul className="mm-items">
              {selected.items.map((item) => (
                <li key={item.id} className="mm-item">
                  <span className="mm-item-art" role="img" aria-label={`${item.name} (ảnh vật phẩm đang cập nhật)`}>
                    <Icon name={item.icon} size={34} />
                  </span>
                  <span className="mm-item-name">{item.name}</span>
                  <span className="mm-item-price">
                    <Icon name="gem" size={14} /> {item.price}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mm-draft">Vật phẩm và giá đang là bản nháp để xem giao diện; chưa thể đổi quà tại đây.</p>
          </div>
        </section>
      ) : null}

      <div className="mm-grid-head">
        <h2>{selected ? "Ghé quầy thương nhân khác" : "Chọn một thương nhân để xem quầy hàng"}</h2>
        <p>{selected ? `${others.length} thương nhân còn lại` : `${MERCHANTS.length} thương nhân đang mở quầy`}</p>
      </div>

      <ul className={selected ? "mm-grid is-compact" : "mm-grid"}>
        {others.map((m, i) => (
          <li key={m.id}>
            <button type="button" ref={setNode(m.id)} className="mm-card" onClick={() => choose(m.id)} aria-label={`Xem quầy của ${m.name}: ${m.shop}`}>
              <Figure merchant={m} priority={i < 3} />
              <span className="mm-card-text">
                <span className="mm-name">{m.name}</span>
                <span className="mm-shop">{m.shop}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
