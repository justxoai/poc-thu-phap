import type { Metadata } from "next";
import Link from "next/link";

import { AppCenter } from "@/components/app/AppCenter";
import { AppShell } from "@/components/app/AppShell";
import { AdminLogin } from "@/components/dashboard/AdminLogin";
import { Icon } from "@/components/ui/Icon";
import { GradeTab, NewStudentsTab, PostsTab, WalletTab } from "@/components/dashboard/admin-tabs";
import { ADMIN_NAV, DASH_TABS, ClassesView, type DashTab, KIND_OF_TAB, MarketView, OverviewView, PurchasesView, Result, StudentsView, parseTab } from "@/components/dashboard/views";
import { getAdminViewer } from "@/lib/admin-guard";
import { getViewer } from "@/lib/session";
import { listPendingStudents } from "@/lib/firestore/accounts";
import { getPostForEdit, listAllTransactions, listPostsAdmin, listWorksToGrade } from "@/lib/firestore/admin-content";
import { vnDateString } from "@/lib/admin-input";
import { parsePostId } from "@/lib/post-id";
import { getOverview, listClasses, listMarketItems, listMarketOrders, listPurchases, listStudents, parseStudentFilter } from "@/lib/firestore/admin-data";

import { logoutAction } from "@/app/minh-hong/actions";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

// Luôn dựng theo từng yêu cầu (phụ thuộc cookie đăng nhập), không cache.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

type Params = Record<string, string | string[] | undefined>;

/** Chỉ đọc dữ liệu của MỘT mục đang mở, mỗi mục có limit/phân trang. */
async function TabContent({ tab, params, canWrite }: { tab: DashTab; params: Params; canWrite: boolean }) {
  const cursor = first(params.cursor) ?? null;
  switch (tab) {
    case "tong-quan":
      return <Result result={await getOverview()}>{(data) => <OverviewView data={data} />}</Result>;
    case "lop":
      return <Result result={await listClasses()}>{(rows) => <ClassesView rows={rows} />}</Result>;
    case "hoc-vien": {
      const filter = parseStudentFilter({ group: first(params.group), course: first(params.course), after: first(params.after) });
      return <Result result={await listStudents(filter)}>{(page) => <StudentsView page={page} group={filter.group} course={filter.course} />}</Result>;
    }
    case "hoc-vien-moi":
      return <NewStudentsTab canWrite={canWrite} result={await listPendingStudents()} />;
    case "market":
      return <MarketView items={await listMarketItems()} orders={await listMarketOrders(cursor)} canWrite={canWrite} />;
    case "vi":
      return <WalletTab canWrite={canWrite} ledger={await listAllTransactions(cursor)} />;
    case "cham-bai":
      return <GradeTab canWrite={canWrite} works={await listWorksToGrade()} />;
    case "tin-tuc": {
      const editId = first(params.edit);
      const validEdit = canWrite && editId && parsePostId(editId) ? editId : null;
      const found = validEdit ? await getPostForEdit(validEdit) : null;
      const editing = found && found.status === "ok" ? found.data : null;
      return <PostsTab canWrite={canWrite} posts={await listPostsAdmin()} editing={editing} editingMissing={validEdit !== null && found?.status === "ok" && editing === null} today={vnDateString(new Date())} />;
    }
    default: {
      const kind = KIND_OF_TAB[tab];
      if (!kind) return null;
      return <Result result={await listPurchases(kind, cursor)}>{(page) => <PurchasesView kind={kind} page={page} tab={tab} />}</Result>;
    }
  }
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  // Quyền = tài khoản đăng nhập có role "admin" (đọc từ Firestore mỗi lần). Chưa đăng nhập -> form đăng nhập; học viên thường -> từ chối.
  const admin = await getAdminViewer();
  if (!admin) {
    const viewer = await getViewer();
    return (
      <AppCenter>
        {viewer ? (
          <>
            <h1 className="page-title">Quản trị</h1>
            <p className="dash-notice">Tài khoản {viewer.name || viewer.studentId} không có quyền quản trị.</p>
            <form action={logoutAction}>
              <button type="submit">Đăng xuất để dùng tài khoản khác</button>
            </form>
          </>
        ) : (
          <AdminLogin />
        )}
        <p>
          <Link href="/">← Về trang chủ</Link>
        </p>
      </AppCenter>
    );
  }

  const params: Params = await searchParams;
  const tab = parseTab(first(params.tab));
  const label = DASH_TABS.find((t) => t.id === tab)?.label ?? "Quản trị";
  const canWrite = true; // đã qua getAdminViewer(); giữ tham số để các tab/biểu mẫu không đổi
  const groups = ADMIN_NAV.map((g) => ({
    label: g.label,
    items: g.items.map((i) => ({ id: i.id, icon: i.icon, label: DASH_TABS.find((t) => t.id === i.id)?.label ?? i.id, href: `/admin/dashboard?tab=${i.id}` })),
  }));

  return (
    <AppShell
      brand="Thanh Phong Thư Môn"
      subtitle="Quản trị"
      groups={groups}
      activeId={tab}
      user={{ name: admin.name || "Thầy", note: "Quản trị" }}
      footer={
        <form action={logoutAction}>
          <button type="submit">
            <Icon name="logout" size={18} />
            <span>Đăng xuất</span>
          </button>
        </form>
      }
    >
      <div className="dash">
        <h1 className="page-title">{label}</h1>
        <section className="dash-body" aria-label={label}>
          <TabContent tab={tab} params={params} canWrite={canWrite} />
        </section>
      </div>
    </AppShell>
  );
}
