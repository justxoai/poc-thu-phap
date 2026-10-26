import type { Metadata } from "next";

import { MerchantMarket } from "@/components/market/MerchantMarket";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { PageBanner } from "@/components/ui/PageBanner";
import { MERCHANTS } from "@/data/merchants";

export const metadata: Metadata = {
  title: "Phiên chợ",
  description: "Phiên chợ hôm nay: ghé quầy của chín thương nhân và xem các món đồ họ đang bán.",
};

// Ngày trên banner là ngày hiện tại (giờ Việt Nam); dựng lại tối đa mỗi 10 phút.
export const revalidate = 600;

const vnDate = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" });

export default function MarketSessionPage() {
  return (
    <SidebarLayout>
      <PageBanner title="Phiên chợ" lead={`Ngày ${vnDate.format(new Date())} · ${MERCHANTS.length} thương nhân đang mở quầy`} />
      <MerchantMarket />
    </SidebarLayout>
  );
}
