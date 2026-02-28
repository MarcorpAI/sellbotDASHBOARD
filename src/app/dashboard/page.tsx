"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNaira } from "@/lib/utils";
import { AnalyticsOverview } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AnalyticsOverview>("/api/analytics/overview")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-gray-500">Failed to load analytics.</div>;
  }

  const cards = [
    { label: "Revenue Today", value: formatNaira(data.revenue_today) },
    { label: "Revenue This Week", value: formatNaira(data.revenue_week) },
    { label: "Revenue This Month", value: formatNaira(data.revenue_month) },
    { label: "Orders Today", value: data.orders_today },
    { label: "Orders This Week", value: data.orders_week },
    { label: "Orders This Month", value: data.orders_month },
    { label: "Conversations Today", value: data.conversations_today },
    { label: "Conversations This Week", value: data.conversations_week },
    { label: "Conversations This Month", value: data.conversations_month },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
