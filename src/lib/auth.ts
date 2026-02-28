import { TokenResponse } from "@/types";

export function saveAuth(data: TokenResponse) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("business_id", data.business_id);
  localStorage.setItem("business_name", data.business_name);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("business_id");
  localStorage.removeItem("business_name");
}

export function getAuth(): { token: string | null; businessId: string | null; businessName: string | null } {
  if (typeof window === "undefined") {
    return { token: null, businessId: null, businessName: null };
  }
  return {
    token: localStorage.getItem("token"),
    businessId: localStorage.getItem("business_id"),
    businessName: localStorage.getItem("business_name"),
  };
}

export function isAuthenticated(): boolean {
  return !!getAuth().token;
}
