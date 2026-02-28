import clsx, { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatKobo(kobo: number): string {
  return formatNaira(kobo / 100);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    waiting_payment: "bg-yellow-100 text-yellow-800",
    pending_payment: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    fulfilled: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    escalated: "bg-red-100 text-red-800",
    abandoned: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
