"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, getAuth, clearAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { CreditBalance, ProductTypeValue } from "@/types";
import { ToastProvider } from "@/components/ui/Toast";
import {
  LayoutDashboard,
  Package,
  Tag,
  Brain,
  Truck,
  MessageSquare,
  Wallet,
  Settings,
  Code2,
  LogOut,
  Menu,
  X,
  Coins,
  Users,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  physicalOnly?: boolean;
}

const allNavItems: (Omit<NavItem, "label"> & { baseId: string })[] = [
  { href: "/dashboard", baseId: "overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", baseId: "orders", icon: Package },
  { href: "/dashboard/products", baseId: "products", icon: Tag },
  { href: "/dashboard/brain", baseId: "brain", icon: Brain },
  { href: "/dashboard/shipping", baseId: "shipping", icon: Truck, physicalOnly: true },
  { href: "/dashboard/conversations", baseId: "conversations", icon: MessageSquare },
  { href: "/dashboard/credits", baseId: "credits", icon: Wallet },
  { href: "/dashboard/settings", baseId: "settings", icon: Settings },
  { href: "/dashboard/developers", baseId: "developers", icon: Code2 },
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

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  useEffect(() => {
    api
      .get<CreditBalance>("/api/credits/balance")
      .then((d) => setCredits(d.balance))
      .catch(() => { });
  }, [pathname]);

  const { businessName, defaultProductType } = getAuth();
  const displayBusinessName = mounted ? businessName || "Dashboard" : "Dashboard";
  const productType: ProductTypeValue = mounted ? defaultProductType : "physical";

  const navItems = allNavItems.filter(
    (item) => !item.physicalOnly || productType === "physical"
  );

  const typeLabel: Record<ProductTypeValue, string> = {
    physical: "Physical",
    digital: "Digital",
    course: "Courses",
  };

  const getNavLabel = (baseId: string): string => {
    switch (baseId) {
      case "overview": return "Overview";
      case "brain": return "Business Brain";
      case "shipping": return "Shipping";
      case "conversations": return "Conversations";
      case "credits": return "Credits";
      case "settings": return "Settings";
      case "developers": return "Developers";
      case "orders":
        return productType === "course" ? "Enrollments" : productType === "digital" ? "Sales" : "Orders";
      case "products":
        return typeLabel[productType];
      default:
        return "Unknown";
    }
  };

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex h-screen font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-surface-900 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-5">
          <span className="text-lg font-black tracking-tight text-white">
            AZ<span className="text-primary-500">ER</span>RA
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-white/40 transition hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-3 flex-1 space-y-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                  ? "bg-primary-500/15 text-primary-400"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {(() => {
                  let SideIcon = Icon;
                  if (item.baseId === "orders" && productType === "course") SideIcon = Users;
                  return <SideIcon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-400" : ""}`} />;
                })()}
                {getNavLabel(item.baseId)}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/5 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-offwhite">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200/70 bg-white px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">
              {displayBusinessName}
            </span>
            {mounted && productType !== "physical" && (
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-600">
                {typeLabel[productType]}
              </span>
            )}
          </div>

          {credits !== null && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700">
              <Coins className="h-3.5 w-3.5" />
              {credits} credits
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
