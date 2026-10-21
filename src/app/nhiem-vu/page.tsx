import type { Metadata } from "next";
import Link from "next/link";

import { DriveImage } from "@/components/DriveImage";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { beastSchedule, npcs, questHero } from "@/data/npcs";
import { getBeastResult, listQuests } from "@/lib/firestore/quests";
import { getViewer } from "@/lib/session";

import "./quest.css";

export const metadata: Metadata = {
  title: "Nhiệm vụ",
  description: "Gặp gỡ các nhân vật trong Thanh Phong Thư Môn và xem danh sách nhiệm vụ do Trợ giảng Minh Hồng giao.",
};

// Có thông tin theo người xem (đã đăng nhập hay chưa) nên dựng theo yêu cầu; dữ liệu dùng chung đã có bộ nhớ đệm riêng.
export const dynamic = "force-dynamic";

function formatScore(n: number): string {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(n);
}

export default async function QuestPage() {
  const viewer = await getViewer();
  const [quests, beast] = await Promise.all([listQuests(), getBeastResult()]);

  return (
    <SidebarLayout>
      <article className="qs">
        <header className="qs-hero">
          <p className="qs-kicker">{questHero.kicker}</p>
          <h1>{questHero.title}</h1>
          <p>{questHero.lead}</p>
          {viewer ? (
            <p className="qs-welcome">
              <strong>Xin chào {viewer.name}.</strong> Tiến độ nhiệm vụ của bạn sẽ hiển thị tại đây.
            </p>
          ) : (
            <div className="qs-welcome">
              <strong>{questHero.welcomeTitle}</strong>
              <span>{questHero.welcomeText}</span>
            </div>
          )}
        </header>

        <section className="qs-section" aria-labelledby="qs-event">
          <p className="qs-kicker">Sự kiện tổ</p>
          <h2 id="qs-event">Chinh phục Linh Thú</h2>
          <p className="qs-lead">{beastSchedule}</p>
          {beast.status === "ok" && beast.data ? (
            <>
              {beast.data.dateLabel ? <p className="qs-date">Top 3 tổ chiến thắng {beast.data.dateLabel}</p> : null}
              <ol className="qs-podium">
                {beast.data.teams.map((t, i) => (
                  <li key={t.team}>
                    <span className="qs-pos">Hạng {i + 1}</span>
                    <strong>Tổ {t.team}</strong>
                    <small>
                      {t.finished} học viên hoàn thành
                      <br />
                      {t.correct} câu trả lời đúng · {formatScore(t.score)} điểm
                    </small>
                  </li>
                ))}
              </ol>
              {beast.data.rulesHref ? (
                <p>
                  <Link href={beast.data.rulesHref}>Xem thể lệ sự kiện</Link>
                </p>
              ) : null}
            </>
          ) : null}
        </section>

        <section className="qs-section" aria-labelledby="qs-npc">
          <p className="qs-kicker">Nhân vật</p>
          <h2 id="qs-npc">Gặp gỡ các nhân vật</h2>
          <p className="qs-lead">Nhân vật sẽ phản hồi theo đúng nhiệm vụ bạn đang thực hiện.</p>
          {!viewer ? <p className="qs-login">Nói chuyện với Minh Hồng và nhập mã học viên để bắt đầu.</p> : null}
          <ul className="qs-npcs">
            {npcs.map((npc) => (
              <li key={npc.id}>
                <DriveImage id={npc.imageId} alt={npc.name} width={72} height={72} fetchWidth={200} />
                <div>
                  <strong>{npc.name}</strong>
                  <p>{npc.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="qs-section" aria-labelledby="qs-list">
          <p className="qs-kicker">Lộ trình</p>
          <h2 id="qs-list">Danh sách nhiệm vụ</h2>
          <p className="qs-lead">Mỗi yêu cầu được kiểm tra độc lập. Nhiệm vụ hỗn hợp có thể gồm bài nộp, câu hỏi, vật phẩm và NPC.</p>
          {quests.status === "unconfigured" ? <p className="qs-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
          {quests.status === "error" ? <p className="qs-notice qs-notice-error">Chưa đọc được danh sách nhiệm vụ. Vui lòng thử lại sau.</p> : null}
          {quests.status === "ok" && quests.data.length === 0 ? <p className="qs-empty">Chưa có nhiệm vụ nào được mở.</p> : null}
          {quests.status === "ok" && quests.data.length > 0 ? (
            <ol className="qs-quests">
              {quests.data.map((q, i) => (
                <li key={q.id}>
                  <span className="qs-no">{i + 1}</span>
                  <div>
                    <h3>{q.title}</h3>
                    {q.description ? <p>{q.description}</p> : null}
                    <p className="qs-meta">
                      {q.level > 0 ? `Cấp ${q.level}` : "Mở cho mọi cấp"}
                      {q.rewardAmount > 0 ? ` - Thưởng ${formatScore(q.rewardAmount)}${q.rewardGem ? ` ${q.rewardGem}` : ""}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      </article>
    </SidebarLayout>
  );
}
