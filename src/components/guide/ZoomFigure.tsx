"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { GuideImage } from "@/data/guide";

/** Ảnh hướng dẫn: bấm để phóng to trong hộp thoại. Ảnh lớn chỉ nạp khi mở. */
export function ZoomFigure({ image }: { image: GuideImage }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  function closeOnBackdrop(event: { target: unknown; currentTarget: HTMLDialogElement }) {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  function show() {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  return (
    <figure className={image.narrow ? "guide-figure guide-narrow" : "guide-figure"}>
      <button type="button" className="guide-zoom" onClick={show} aria-label={`Phóng to: ${image.alt}`}>
        <Image src={image.src} alt={image.alt} width={image.w} height={image.h} sizes="(min-width: 1200px) 760px, 100vw" />
      </button>
      <figcaption>{image.alt}</figcaption>
      <dialog
        ref={dialogRef}
        className="guide-dialog"
        onClose={() => setOpen(false)}
        onClick={closeOnBackdrop}
      >
        <button type="button" className="guide-close" onClick={() => dialogRef.current?.close()}>
          Đóng ảnh
        </button>
        {open ? <Image src={image.src} alt={image.alt} width={image.w} height={image.h} sizes="95vw" /> : null}
      </dialog>
    </figure>
  );
}
