"use client";

import { useState } from "react";

import { levelFor } from "@/data/gems";
import { activityStatus, averageScore } from "@/lib/activity";
import { driveThumbnailUrl, driveViewUrl } from "@/lib/drive";
import { formatScore, formatVnDateTime } from "@/lib/format";
import type { StudentPublicProfile, WorkItem } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { ProfileAvatar, backgroundClass } from "./ProfileAvatar";

type Panel = "learning" | "gems" | "items" | null;

/**
 * Hồ sơ học viên: thông tin học tập, linh thạch, vật phẩm, danh sách bài đã nộp.
 * Dữ liệu đã được server lọc; component chỉ hiển thị.
 */
export function StudentProfileView({
  profile,
  works,
  rankLabel = "Điểm xếp hạng",
  showCode = false,
  bannerOnly = false,
}: {
  profile: StudentPublicProfile;
  works: WorkItem[];
  /** Nhãn ô thứ 4 của thông tin học tập: "Điểm xếp hạng" (tra cứu) hoặc "Tổng bài hợp lệ" (nộp bài). */
  rankLabel?: string;
  /** Chỉ hiện mã học viên cho chính chủ (Dashboard); trang tra cứu công khai không hiện. */
  showCode?: boolean;
  /** Chỉ hiện banner hồ sơ (không nút Thông tin học tập / Linh thạch / Vật phẩm, không danh sách bài). Dùng cho Dashboard. */
  bannerOnly?: boolean;
}) {
  const [panel, setPanel] = useState<Panel>("learning");
  const [showWorks, setShowWorks] = useState(false);

  const { stats } = profile;
  const gemTotal = Object.values(profile.wallet).reduce((sum, n) => sum + n, 0);
  const itemTotal = profile.inventory.reduce((sum, item) => sum + item.quantity, 0);
  const status = activityStatus(stats.lastSubmittedAt);
  const average = stats.gradedCount > 0 ? String(averageScore(stats)) : "0";
  // Rank tổng = số bài hợp lệ + tổng điểm các bài hợp lệ đã được chấm (theo trang Hướng dẫn).
  const rankTotal = stats.submissionCount + stats.scoreSum;
  const rankValue =
    rankLabel === "Tổng bài hợp lệ" ? stats.submissionCount : stats.submissionCount + stats.scoreSum;

  const toggle = (name: Exclude<Panel, null>) => setPanel((current) => (current === name ? null : name));

  return (
    <section className="stu-profile" aria-label="Hồ sơ học viên">
      <div className={`stu-profile-inner ${backgroundClass(profile.decor)}`}>
        <div className="stu-profile-main">
          <ProfileAvatar name={profile.name} decor={profile.decor} size={profile.decor.frame === "none" ? 96 : 128} />
          <div className="stu-profile-content">
            <div className="stu-profile-label">HỒ SƠ HỌC VIÊN</div>
            <div className="stu-profile-name">{profile.name || "Học viên"}</div>
            <div className="stu-badges">
              {showCode ? (
                <span className="stu-badge">
                  <Icon name="user" /> Mã {profile.id}
                </span>
              ) : null}
              <span className="stu-badge">
                <Icon name="award" /> Rank {levelFor(rankTotal)} · {formatScore(rankTotal)}
              </span>
              <span className="stu-badge">
                <Icon name="users" /> Tổ {profile.group || "—"}
              </span>
              <span className="stu-badge">
                <Icon name="graduation" /> Khóa {profile.course || "—"}
              </span>
              <span className="stu-badge">
                <Icon name="book" /> {stats.submissionCount} bài
              </span>
            </div>
          </div>
        </div>

        {bannerOnly ? null : (
        <div className="stu-actions">
          <button type="button" className="stu-action" aria-expanded={panel === "learning"} onClick={() => toggle("learning")}>
            <Icon name="chart" />
            <span>Thông tin học tập</span>
          </button>
          <button type="button" className="stu-action" aria-expanded={panel === "gems"} onClick={() => toggle("gems")}>
            <Icon name="gem" />
            <span>Linh thạch</span>
            <span className="stu-action-number">{gemTotal}</span>
          </button>
          <button type="button" className="stu-action" aria-expanded={panel === "items"} onClick={() => toggle("items")}>
            <Icon name="gift" />
            <span>Vật phẩm</span>
            <span className="stu-action-number">{itemTotal}</span>
          </button>
        </div>
        )}
      </div>

      {bannerOnly ? null : (
        <>
      {panel === "learning" ? (
        <div className="stu-panel">
          <div className="stu-panel-title">Thông tin học tập</div>
          <div className="stu-info-grid">
            <div className="stu-info-item">
              <div className="stu-info-label">Tổ</div>
              <div className="stu-info-value">{profile.group || "-"}</div>
            </div>
            <div className="stu-info-item">
              <div className="stu-info-label">Khóa</div>
              <div className="stu-info-value">{profile.course || "-"}</div>
            </div>
            <div className="stu-info-item">
              <div className="stu-info-label">Điểm trung bình</div>
              <div className="stu-info-value stu-green">{average}</div>
            </div>
            <div className="stu-info-item">
              <div className="stu-info-label">{rankLabel}</div>
              <div className="stu-info-value stu-gold">{formatScore(rankValue)}</div>
            </div>
          </div>
          <div className={`stu-status stu-status-${status.level}`}>
            <div className="stu-status-title">{status.text}</div>
            <div>{status.detail}</div>
          </div>
        </div>
      ) : null}

      {panel === "gems" ? (
        <div className="stu-panel">
          <div className="stu-panel-title">Linh thạch hiện có</div>
          {Object.keys(profile.wallet).length === 0 ? (
            <p className="stu-empty">Chưa có linh thạch.</p>
          ) : (
            <div className="stu-card-grid">
              {Object.entries(profile.wallet).map(([key, amount]) => (
                <div className="stu-info-item" key={key}>
                  <div className="stu-info-label">{key}</div>
                  <div className="stu-info-value">{amount}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {panel === "items" ? (
        <div className="stu-panel">
          <div className="stu-panel-title">Vật phẩm đang sở hữu</div>
          {profile.inventory.length === 0 ? (
            <p className="stu-empty">Chưa có vật phẩm.</p>
          ) : (
            <div className="stu-card-grid">
              {profile.inventory.map((item) => (
                <div className="stu-info-item" key={item.id}>
                  <div className="stu-info-label">{item.name}</div>
                  <div className="stu-info-value">× {item.quantity}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="stu-works">
        <button
          type="button"
          className="stu-works-toggle"
          aria-expanded={showWorks}
          onClick={() => setShowWorks((v) => !v)}
        >
          <span>
            <Icon name="book" /> Danh sách bài đã nộp <span className="stu-works-count">({works.length})</span>
          </span>
          <span aria-hidden="true">{showWorks ? "▲" : "▼"}</span>
        </button>
        {showWorks ? (
          works.length === 0 ? (
            <p className="stu-empty">Chưa có bài nộp nào.</p>
          ) : (
            <div className="stu-table-wrap">
              <table className="stu-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Thời gian nộp</th>
                    <th>Ảnh</th>
                    <th>Bài tập</th>
                    <th>Điểm số</th>
                    <th>Nhận xét</th>
                  </tr>
                </thead>
                <tbody>
                  {works.map((work, i) => (
                    <tr key={work.id}>
                      <td>{i + 1}</td>
                      <td>{formatVnDateTime(work.submittedAt)}</td>
                      <td>
                        <WorkThumb work={work} />
                      </td>
                      <td>{work.description || "—"}</td>
                      <td>{work.score === null ? "Chưa chấm" : formatScore(work.score)}</td>
                      <td>{work.comment || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}
      </div>
        </>
      )}
    </section>
  );
}

/** Ảnh nhỏ của bài nộp (thumbnail Google Drive, tạm); bấm để mở ảnh gốc ở tab mới. */
function WorkThumb({ work }: { work: WorkItem }) {
  const thumb = driveThumbnailUrl(work.driveFileId, 160);
  const view = driveViewUrl(work.driveFileId);
  if (!thumb || !view) return <>—</>;
  return (
    <a href={view} target="_blank" rel="noopener noreferrer" className="stu-thumb">
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nhỏ từ Drive, không qua bộ tối ưu của Next */}
      <img src={thumb} alt={`Ảnh bài nộp ${formatVnDateTime(work.submittedAt)}`} width={56} height={70} loading="lazy" />
    </a>
  );
}
