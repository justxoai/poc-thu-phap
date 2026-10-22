import type { Metadata } from "next";
import Link from "next/link";

import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { classRooms, isRoomActive, lectureHero, lectureNote, lectureOthers, scheduleLine } from "@/data/lecture";
import { getRoomLinks, listContributions } from "@/lib/firestore/lecture";
import { relativeTimeVi } from "@/lib/relative-time";
import { getViewer } from "@/lib/session";

import "./lecture.css";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Giảng đường",
  description: "Phòng học trực tuyến, phòng thi tốt nghiệp và phòng luyện công của Thanh Phong Thư Môn.",
};

// Giờ học và liên kết phòng phụ thuộc người xem và thời điểm nên dựng theo yêu cầu.
export const dynamic = "force-dynamic";

export default async function LecturePage() {
  const viewer = await getViewer();
  const [links, contributions] = await Promise.all([getRoomLinks(viewer), listContributions()]);
  const roomLinks = links.status === "ok" ? links.data : {};
  const now = new Date();

  return (
    <SidebarLayout>
      <article className="gd">
        <header className="gd-hero">
          <span className="gd-mark" aria-hidden="true">
            {lectureHero.mark}
          </span>
          <h1>{lectureHero.title}</h1>
          <p>{lectureHero.lead}</p>
          <p className="gd-schedule">{scheduleLine}</p>
        </header>

        <section className="gd-section" aria-labelledby="gd-rooms">
          <p className="gd-eyebrow">Phòng học trực tuyến</p>
          <h2 id="gd-rooms">Phòng học</h2>
          <p className="gd-lead">Phòng Hoà Bình học tối Thứ Sáu. Phòng Hạnh Phúc học tối Thứ Bảy.</p>
          <div className="gd-rooms">
            {classRooms.map((room) => {
              const active = isRoomActive(room, now);
              const link = roomLinks[room.id];
              return (
                <div key={room.id} className="gd-room">
                  <span className="gd-icon" aria-hidden="true">
                    <Icon name={room.icon} size={22} />
                  </span>
                  <p className="gd-eyebrow">Phòng học</p>
                  <h3>{room.name}</h3>
                  <p className={`gd-status${active ? " gd-status-on" : ""}`}>{active ? "Đang hoạt động" : "Chưa hoạt động"}</p>
                  <p className="gd-time">
                    {room.dayLabel} • {String(room.startHour).padStart(2, "0")}:00–{String(room.endHour).padStart(2, "0")}:00
                  </p>
                  <p>{room.description}</p>
                  {link ? (
                    <a className="gd-btn" href={link} target="_blank" rel="noopener noreferrer">
                      Vào phòng học
                    </a>
                  ) : (
                    <span className="gd-btn gd-btn-off">{viewer ? "Chưa có liên kết phòng" : "Đăng nhập để vào phòng"}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="gd-others" aria-label="Phòng thi và phòng luyện công">
          {lectureOthers.map((room) => (
            <div key={room.id} className="gd-room">
              <span className="gd-icon" aria-hidden="true">
                <Icon name={room.icon} size={22} />
              </span>
              <p className="gd-eyebrow">{room.eyebrow}</p>
              <h3>{room.name}</h3>
              <p>{room.description}</p>
              <a className="gd-btn" href={room.href}>
                {room.cta}
              </a>
            </div>
          ))}
        </section>

        <p className="gd-note">
          <Icon name="lock" /> {lectureNote}
        </p>

        <section className="gd-section" aria-labelledby="gd-life">
          <p className="gd-eyebrow">Nhịp sống lớp học</p>
          <h2 id="gd-life">Đóng góp Thư viện lâm mô</h2>
          <p className="gd-lead">Những bản lâm học viên vừa góp vào Thư viện lâm mô, kèm lượt thả tim của đồng môn.</p>
          {contributions.status === "unconfigured" ? <p className="gd-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
          {contributions.status === "error" ? <p className="gd-notice gd-notice-error">Chưa đọc được dữ liệu. Vui lòng thử lại sau.</p> : null}
          {contributions.status === "ok" && contributions.data.length === 0 ? <p className="gd-empty">Chưa có bản lâm nào được góp.</p> : null}
          {contributions.status === "ok" && contributions.data.length > 0 ? (
            <ul className="gd-feed">
              {contributions.data.map((c) => (
                <li key={c.id}>
                  <Link href={c.lamMoId ? `/mau-lam-mo?xem=${encodeURIComponent(c.lamMoId)}` : "/mau-lam-mo"}>
                    <span className="gd-heart">
                      <Icon name="heart" /> {c.hearts}
                    </span>
                    <strong>{c.authorName || "Học viên"}</strong>
                    <span className="gd-meta">
                      {c.group ? `Tổ ${c.group}` : ""}
                      {c.group && c.course ? " · " : ""}
                      {c.course ? `Khóa ${c.course}` : ""}
                    </span>
                    <span className="gd-title">“{c.title}”</span>
                    <span className="gd-meta">Góp {relativeTimeVi(c.createdAt, now.getTime())}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="gd-more">
            <Link href="/mau-lam-mo">Xem thêm bản lâm</Link>
          </p>
        </section>
      </article>
    </SidebarLayout>
  );
}
