"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, getAuth, clearAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { CreditBalance } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/orders", label: "Orders", icon: "📦" },
  { href: "/dashboard/products", label: "Products", icon: "🏷️" },
  { href: "/dashboard/brain", label: "Business Brain", icon: "🧠" },
  { href: "/dashboard/shipping", label: "Shipping", icon: "🚚" },
  { href: "/dashboard/conversations", label: "Conversations", icon: "💬" },
  { href: "/dashboard/credits", label: "Credits", icon: "💳" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    api
      .get<CreditBalance>("/api/credits/balance")
      .then((d) => setCredits(d.balance))
      .catch(() => { });
  }, [pathname]);

  const { businessName } = getAuth();
  const displayBusinessName = mounted ? (businessName || "Dashboard") : "Dashboard";

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <span className="text-lg font-bold text-primary-600">SellBOT</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${pathname === item.href
                ? "bg-primary-50 text-primary-700"
                : "text-gray-700 hover:bg-gray-100"
                }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            ☰
          </button>
          <div className="text-sm font-medium text-gray-700">
            {displayBusinessName}
          </div>
          <div className="flex items-center gap-4">
            {credits !== null && (
              <div className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                {credits} credits
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
