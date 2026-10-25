"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Icon } from "./Icon";
import "./lightbox.css";

/**
 * Ảnh thu nhỏ bấm được: bấm thì ảnh hiện to giữa màn hình (hộp thoại <dialog> gốc của trình duyệt:
 * có nền mờ, Esc để đóng, giữ bàn phím trong hộp). Bấm ra ngoài, bấm vào ảnh hoặc nút đóng để đóng.
 */
export function ImageLightbox({
  src,
  alt,
  width,
  height,
  sizes,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  caption?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button type="button" className="lightbox-trigger" onClick={() => setOpen(true)} aria-label={`Phóng to ảnh: ${alt}`}>
        <Image src={src} alt={alt} width={width} height={height} sizes={sizes} />
        <span className="lightbox-hint" aria-hidden="true">
          Bấm để phóng to
        </span>
      </button>
      <dialog ref={dialogRef} className="lightbox" aria-label={alt} onClose={() => setOpen(false)} onClick={() => setOpen(false)}>
        {open ? (
          <figure className="lightbox-figure">
            <Image className="lightbox-img" src={src} alt={alt} width={width} height={height} sizes="92vw" />
            {caption ? <figcaption>{caption}</figcaption> : null}
          </figure>
        ) : null}
        <button type="button" className="lightbox-close" aria-label="Đóng ảnh" onClick={() => setOpen(false)}>
          <Icon name="close" size={22} />
        </button>
      </dialog>
    </>
  );
}
