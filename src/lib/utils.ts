import clsx, { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNaira(amount: number): string {
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₦${formatted}`;
}

export function formatKobo(kobo: number): string {
  return formatNaira(kobo / 100);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${h}:${m}`;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    waiting_payment: "bg-yellow-100 text-yellow-800",
    pending_payment: "bg-yellow-100 text-yellow-800",
    awaiting_confirmation: "bg-orange-100 text-orange-800",
    paid: "bg-blue-100 text-blue-800",
    fulfilled: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    escalated: "bg-red-100 text-red-800",
    abandoned: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
    interested: "bg-purple-100 text-purple-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
