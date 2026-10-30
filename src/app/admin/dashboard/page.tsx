import type { Metadata } from "next";
import Link from "next/link";

import { AppCenter } from "@/components/app/AppCenter";
import { AppShell } from "@/components/app/AppShell";
import { AdminLogin } from "@/components/dashboard/AdminLogin";
import { Icon } from "@/components/ui/Icon";
import { PostsView, WalletTab } from "@/components/dashboard/admin-tabs";
import { CatalogView, parseSub, type CatalogDialog } from "@/components/dashboard/catalog-views";
import { CATALOG_TAB } from "@/lib/catalog";
import { getCatalogItem, listCatalog } from "@/lib/firestore/admin-catalog";
import { ClassesListView, NewStudentsView, StudentsListView } from "@/components/dashboard/student-views";
import { MarketView, type MarketDialog } from "@/components/dashboard/market-views";
import { ADMIN_NAV, DASH_TABS, type DashTab, KIND_OF_TAB, OverviewView, Result, parseTab } from "@/components/dashboard/views";
import { getAdminViewer } from "@/lib/admin-guard";
import { getViewer } from "@/lib/session";
import { listPendingPage } from "@/lib/firestore/accounts";
import { parsePageRequest, sliceMemoryPage } from "@/lib/admin-paging";
import { getStudentAdminDetail, listStudentsPage, parseStudentList } from "@/lib/firestore/admin-students";
import { normalizeCode } from "@/lib/firestore/students";
import { getPostForEdit, listAllTransactions, listPostsPage, parsePostList } from "@/lib/firestore/admin-content";
import { vnDateString } from "@/lib/admin-input";
import { parsePostId } from "@/lib/post-id";
import { getMarketItem, getOverview, listClasses, listMarketItems, listPurchasesPage } from "@/lib/firestore/admin-data";
import { listMarketHistory, parseMarketHistory } from "@/lib/firestore/admin-market";
import { findMerchant } from "@/data/merchants";

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
    case "lop": {
      const req = parsePageRequest(params);
      const course = first(params.course) && /^[0-9A-Za-z_-]{1,10}$/.test(first(params.course) as string) ? (first(params.course) as string) : null;
      const all = await listClasses();
      const result = all.status === "ok" ? ({ status: "ok", data: sliceMemoryPage(all.data.filter((c) => !course || c.course === course), req) } as const) : all;
      return <ClassesListView result={result} course={course} size={req.size} />;
    }
    case "hoc-vien": {
      const list = parseStudentList(params);
      const viewId = normalizeCode(first(params.view));
      const keep = { size: list.size, p: list.p, after: list.after, before: list.before, q: list.q, course: list.course, group: list.group };
      const [result, detail] = await Promise.all([listStudentsPage(list), viewId ? getStudentAdminDetail(viewId) : null]);
      return <StudentsListView result={result} params={list} keep={keep} detail={detail} />;
    }
    case "hoc-vien-moi": {
      const req = parsePageRequest(params);
      const viewId = normalizeCode(first(params.view));
      const keep = { size: req.size, p: req.p, after: req.after, before: req.before };
      const [result, detail] = await Promise.all([listPendingPage(req), viewId ? getStudentAdminDetail(viewId) : null]);
      return <NewStudentsView result={result} keep={keep} size={req.size} detail={detail} />;
    }
    case "market": {
      const historyParams = parseMarketHistory(params);
      const merchantRaw = first(params.merchant);
      const selected = merchantRaw === "none" ? "none" : (findMerchant(merchantRaw ?? "")?.id ?? null);
      const editRaw = first(params.edit);
      const editId = editRaw && /^[A-Za-z0-9_-]{1,40}$/.test(editRaw) ? editRaw : null;
      const dialog: MarketDialog | null = first(params.add) === "1" ? { mode: "add" } : editId ? { mode: "edit", item: await getMarketItem(editId) } : null;
      const [items, history] = await Promise.all([listMarketItems(), listMarketHistory(historyParams)]);
      return <MarketView items={items} selected={selected} dialog={dialog} history={history} historyParams={historyParams} />;
    }
    case "vi":
      return <WalletTab canWrite={canWrite} ledger={await listAllTransactions(cursor)} />;
    case "tin-tuc": {
      const list = parsePostList(params);
      const editRaw = first(params.edit);
      const editId = editRaw && parsePostId(editRaw) ? editRaw : null;
      const wantsNew = first(params.new) === "1";
      const savedRaw = first(params.saved);
      const saved = savedRaw === "new" || savedRaw === "edit" ? savedRaw : null;
      // Màn hình soạn bài. ?edit= sai định dạng bị bỏ qua (coi như mở danh sách).
      if (editId || wantsNew) {
        const found = editId ? await getPostForEdit(editId) : null;
        const editing = found && found.status === "ok" ? found.data : null;
        return <PostsView list={null} params={list} saved={null} form={{ editing, editingMissing: editId !== null && found?.status === "ok" && editing === null, today: vnDateString(new Date()) }} />;
      }
      return <PostsView list={await listPostsPage(list)} params={list} saved={saved} form={null} />;
    }
    default: {
      const kind = KIND_OF_TAB[tab];
      const catalogKind = CATALOG_TAB[tab];
      if (!kind || !catalogKind) return null;
      const sub = parseSub(first(params.sub));
      const req = parsePageRequest(params);
      const editRaw = first(params.edit);
      const editId = editRaw && /^[A-Za-z0-9_-]{1,80}$/.test(editRaw) ? editRaw : null;
      const dialog: CatalogDialog | null = sub !== "ban" ? null : first(params.add) === "1" ? { mode: "add" } : editId ? { mode: "edit", item: await getCatalogItem(editId) } : null;
      const [catalog, buyers] = await Promise.all([sub === "ban" ? listCatalog(catalogKind) : null, sub === "mua" ? listPurchasesPage(kind, req) : null]);
      return <CatalogView tab={tab} kind={catalogKind} sub={sub} req={req} catalog={catalog} dialog={dialog} buyers={buyers} />;
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
