import Link from "next/link";

export function NeedLogin({ title }: { title: string }) {
  return (
    <>
      <h1 className="page-title">{title}</h1>
      <p className="notice">Bạn chưa đăng nhập. Hãy bấm nút Minh Hồng ở góc phải dưới, chọn “Đăng nhập tài khoản” và nhập mã học viên.</p>
      <p>
        <Link href="/">Về trang chủ</Link>
      </p>
    </>
  );
}
