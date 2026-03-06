"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNaira } from "@/lib/utils";
import { AnalyticsOverview, ProductTypeValue } from "@/types";
import { getAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { TrendingUp, ShoppingBag, MessageCircle } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [productType, setProductType] = useState<ProductTypeValue>("physical");
  const { toast } = useToast();

  useEffect(() => {
    const { defaultProductType } = getAuth();
    if (defaultProductType) {
      setProductType(defaultProductType);
    }

    api
      .get<AnalyticsOverview>("/api/analytics/overview")
      .then(setData)
      .catch(() => toast("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-gray-500">Failed to load analytics.</div>;
  }

  // Determine the correct term for Orders based on product type
  const orderTerm = productType === "course" ? "Enrollments" : productType === "digital" ? "Sales" : "Orders";

  const cards = [
    { label: "Revenue Today", value: formatNaira(data.revenue_today), icon: TrendingUp, tint: "bg-primary-50 text-primary-600" },
    { label: "Revenue This Week", value: formatNaira(data.revenue_week), icon: TrendingUp, tint: "bg-primary-50 text-primary-600" },
    { label: "Revenue This Month", value: formatNaira(data.revenue_month), icon: TrendingUp, tint: "bg-primary-50 text-primary-600" },
    { label: `${orderTerm} Today`, value: data.orders_today, icon: ShoppingBag, tint: "bg-blue-50 text-blue-600" },
    { label: `${orderTerm} This Week`, value: data.orders_week, icon: ShoppingBag, tint: "bg-blue-50 text-blue-600" },
    { label: `${orderTerm} This Month`, value: data.orders_month, icon: ShoppingBag, tint: "bg-blue-50 text-blue-600" },
    { label: "Conversations Today", value: data.conversations_today, icon: MessageCircle, tint: "bg-purple-50 text-purple-600" },
    { label: "Conversations This Week", value: data.conversations_week, icon: MessageCircle, tint: "bg-purple-50 text-purple-600" },
    { label: "Conversations This Month", value: data.conversations_month, icon: MessageCircle, tint: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-gray-900">Overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.tint}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
