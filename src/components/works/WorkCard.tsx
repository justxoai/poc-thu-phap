import Image from "next/image";

import { driveThumbnailUrl, driveViewUrl } from "@/lib/drive";
import { formatScore, formatVnDateTime } from "@/lib/format";
import type { WorkItem } from "@/lib/types";

import "./works.css";
import { Icon } from "@/components/ui/Icon";

/** Thẻ một tác phẩm. Ảnh là thumbnail Google Drive (tạm), mở ảnh gốc ở tab mới. */
export function WorkCard({
  work,
  index,
  detailed = false,
  priority = false,
}: {
  work: WorkItem;
  index: number;
  detailed?: boolean;
  priority?: boolean;
}) {
  const thumb = driveThumbnailUrl(work.driveFileId, 650);
  const view = driveViewUrl(work.driveFileId);
  const alt = work.studentName ? `Tác phẩm của ${work.studentName}` : "Tác phẩm";

  return (
    <article className="work-card">
      <div className="work-image-box">
        <div className="work-number">{index}</div>
        {thumb && view ? (
          <a className="work-link" href={view} target="_blank" rel="noopener noreferrer">
            <Image
              src={thumb}
              alt={alt}
              width={650}
              height={812}
              unoptimized
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          </a>
        ) : null}
      </div>
      <div className="work-info">
        <div className="work-name">{work.studentName || "Học viên"}</div>
        <div className="work-meta">
          {work.group ? <span className="work-chip">
              <Icon name="users" /> Tổ {work.group}
            </span> : null}
          {work.course ? <span className="work-chip">
              <Icon name="graduation" /> Khóa {work.course}
            </span> : null}
        </div>
        {detailed ? (
          <div className={work.score === null ? "work-score work-score-none" : "work-score"}>
            {work.score === null ? "Chưa chấm điểm" : `Điểm: ${formatScore(work.score)}`}
          </div>
        ) : null}
        <time className="work-time" dateTime={work.submittedAt}>
          {formatVnDateTime(work.submittedAt)}
        </time>
      </div>
    </article>
  );
}

export function WorkGrid({ works, detailed = false }: { works: WorkItem[]; detailed?: boolean }) {
  return (
    <div className="work-grid">
      {works.map((work, i) => (
        <WorkCard key={work.id} work={work} index={i + 1} detailed={detailed} priority={i < 2} />
      ))}
    </div>
  );
}
