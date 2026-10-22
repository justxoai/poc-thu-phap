/** Nội dung và lịch Giảng đường (chép từ trang cũ, có chỉnh câu chữ cho phù hợp luồng đăng nhập mới). */
import type { IconName } from "@/components/ui/Icon";


export interface ClassRoom {
  id: "hoa-binh" | "hanh-phuc";
  icon: IconName;
  name: string;
  /** 0 = Chủ nhật ... 5 = Thứ Sáu, 6 = Thứ Bảy. */
  weekday: number;
  dayLabel: string;
  startHour: number;
  endHour: number;
  description: string;
}

export const lectureHero = {
  mark: "學",
  title: "Giảng đường",
  lead: "Không gian học tập trực tuyến dành cho học viên. Sau khi đăng nhập, hệ thống sẽ mở đúng phòng học của bạn.",
};

export const classRooms: ClassRoom[] = [
  {
    id: "hoa-binh",
    icon: "bird",
    name: "Phòng học Hoà Bình",
    weekday: 5,
    dayLabel: "Thứ Sáu",
    startHour: 19,
    endHour: 21,
    description: "Không gian học thư pháp dành cho học viên các khóa được phân vào Phòng học Hoà Bình.",
  },
  {
    id: "hanh-phuc",
    icon: "flower",
    name: "Phòng học Hạnh Phúc",
    weekday: 6,
    dayLabel: "Thứ Bảy",
    startHour: 19,
    endHour: 21,
    description: "Không gian học thư pháp dành cho học viên được phân vào Phòng học Hạnh Phúc.",
  },
];

export const scheduleLine = "Hoà Bình: Thứ Sáu 19:00–21:00 • Hạnh Phúc: Thứ Bảy 19:00–21:00";

export const lectureOthers = [
  {
    id: "thi",
    icon: "graduation",
    eyebrow: "Kỳ thi tốt nghiệp",
    name: "Phòng Thi Tốt Nghiệp",
    description: "Khu vực dành cho học viên đủ điều kiện tham gia kỳ thi tốt nghiệp OCD.",
    cta: "Vào phòng thi",
    // Trang này chưa được dựng ở site mới nên vẫn trỏ về site cũ.
    href: "https://www.thudao.com/p/ocd-phong-thi-tot-nghiep-graduation.html",
  },
  {
    id: "luyen-cong",
    icon: "shield",
    eyebrow: "Luyện tập nhóm",
    name: "Phòng Luyện Công",
    description: "Cùng đồng môn vào phòng, làm bộ đề riêng và nhận thưởng theo thành tích chung.",
    cta: "Vào phòng luyện công",
    href: "https://www.thudao.com/p/luyen-cong.html",
  },
] as const;

export const lectureNote = "Mã học viên chỉ dùng để xác minh quyền vào lớp. Giảng đường không công khai mã học viên, điểm số hoặc nội dung nhận xét.";

/**
 * Phòng đang trong giờ học (giờ Việt Nam) hay chưa. Trang cũ hiển thị "CHƯA HOẠT ĐỘNG" ngoài giờ.
 * Dùng múi giờ cố định UTC+7 (Việt Nam không có giờ mùa hè).
 */
export function isRoomActive(room: ClassRoom, now = new Date()): boolean {
  const vn = new Date(now.getTime() + 7 * 3600_000);
  return vn.getUTCDay() === room.weekday && vn.getUTCHours() >= room.startHour && vn.getUTCHours() < room.endHour;
}
