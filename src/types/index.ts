export interface Business {
  id: string;
  name: string;
  email: string;
  whatsapp_number: string | null;
  waba_id: string | null;
  phone_number_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  weight_kg: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

export interface ZoneArea {
  id: string;
  zone_id: string;
  area_name: string;
}

export interface ShippingZone {
  id: string;
  business_id: string;
  name: string;
  base_rate: number;
  per_kg_rate: number;
  is_active: boolean;
  areas: ZoneArea[];
}

export interface Customer {
  id: string;
  business_id: string;
  phone_number: string;
  name: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string;
  status: string;
  started_at: string;
  last_message_at: string | null;
  resolved_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "customer" | "agent" | "system";
  content: string;
  sent_at: string;
}

export interface Order {
  id: string;
  business_id: string;
  conversation_id: string;
  customer_id: string;
  status: string;
  total_amount: number;
  payment_link: string | null;
  payment_ref: string | null;
  delivery_info: Record<string, string> | null;
  created_at: string;
  paid_at: string | null;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export interface AgentConfig {
  id: string;
  business_id: string;
  greeting: string | null;
  tone: string;
  business_hours: Record<string, unknown> | null;
  out_of_hours_msg: string | null;
  human_handoff_triggers: string[] | null;
  escalation_phone: string | null;
  external_catalog_url: string | null;
  external_catalog_headers: Record<string, string> | null;
  use_external_catalog: boolean;
  follow_up_delay_minutes: number;
}

export interface CreditBalance {
  balance: number;
}

export interface CreditTransaction {
  id: string;
  business_id: string;
  type: string;
  amount: number;
  description: string | null;
  reference_id: string | null;
  paystack_ref: string | null;
  created_at: string;
}

export interface CreditBundle {
  id: string;
  name: string;
  price_kobo: number;
  credits: number;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  business_id: string;
  business_name: string;
}

export interface AnalyticsOverview {
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  orders_today: number;
  orders_week: number;
  orders_month: number;
  conversations_today: number;
  conversations_week: number;
  conversations_month: number;
}
