import { TokenResponse, ProductTypeValue } from "@/types";

export function saveAuth(data: TokenResponse) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("business_id", data.business_id);
  localStorage.setItem("business_name", data.business_name);
  localStorage.setItem("default_product_type", data.default_product_type || "physical");
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("business_id");
  localStorage.removeItem("business_name");
  localStorage.removeItem("default_product_type");
}

export function getAuth(): {
  token: string | null;
  businessId: string | null;
  businessName: string | null;
  defaultProductType: ProductTypeValue;
} {
  if (typeof window === "undefined") {
    return { token: null, businessId: null, businessName: null, defaultProductType: "physical" };
  }
  return {
    token: localStorage.getItem("token"),
    businessId: localStorage.getItem("business_id"),
    businessName: localStorage.getItem("business_name"),
    defaultProductType: (localStorage.getItem("default_product_type") as ProductTypeValue) || "physical",
  };
}

export function setDefaultProductType(type: ProductTypeValue) {
  localStorage.setItem("default_product_type", type);
}

export function isAuthenticated(): boolean {
  return !!getAuth().token;
}
