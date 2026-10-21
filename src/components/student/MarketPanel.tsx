"use client";

import { useState } from "react";

import "./student.css";

/** Khung Chợ phiên. Chức năng đổi quà chưa chuyển sang app mới nên chỉ hiện giới thiệu + lối sang trang cũ. */
export function MarketPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="stu stu-market">
      <button type="button" className="stu-market-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="stu-market-icon" aria-hidden="true">
          🏮
        </span>
        <span className="stu-market-text">
          <span className="stu-market-title">Chợ phiên thu đổi linh thạch</span>
          <span className="stu-market-sub">
            Giá đổi được làm mới theo ngày. Giao dịch được xác nhận trực tiếp trên trang.
          </span>
        </span>
        <span aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="stu-market-panel">
          <p className="stu-hint">
            Bạn có thể xem vật phẩm và giá tại <a href="/cho-phien">trang Chợ phiên</a>. Việc đổi quà đang được chuyển sang hệ thống mới; trong lúc đó vui lòng đổi quà tại{" "}
            <a href="https://www.thudao.com/p/tra-cuu.html">trang Chợ phiên cũ</a>.
          </p>
          <details>
            <summary>📜 Giới thiệu</summary>
            <p>
              <strong>Chợ phiên thu đổi linh thạch</strong> là nơi các thương nhân ghé qua mỗi ngày.
            </p>
            <p>
              Vật phẩm được chia thành <strong>6 phẩm cấp</strong> tương ứng với hệ thống phần thưởng.
            </p>
            <p>Việc mua bán vật phẩm trong hệ thống sử dụng Hồng Ngọc.</p>
            <p>
              <a
                href="https://www.thudao.com/2026/09/gioi-thieu-chuc-nang-cho-phien.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tìm hiểu thêm →
              </a>
            </p>
          </details>
          <details>
            <summary>🧭 Hướng dẫn</summary>
            <p>
              <strong>Bước 1:</strong> Nhập Mã học viên.
            </p>
            <p>
              <strong>Bước 2:</strong> Kiểm tra số Hồng Ngọc.
            </p>
            <p>
              <strong>Bước 3:</strong> Chọn vật phẩm hoặc kèo đổi.
            </p>
            <p>
              <strong>Bước 4:</strong> Kiểm tra Phiếu đổi quà.
            </p>
            <p>
              <strong>Bước 5:</strong> Xác nhận giao dịch.
            </p>
          </details>
        </div>
      ) : null}
    </div>
  );
}
