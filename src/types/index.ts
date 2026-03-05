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
  shipping_fee: number | null;
  shipping_zone_name: string | null;
  delivery_address: string | null;
  payment_mode: string | null;
  payment_link: string | null;
  payment_ref: string | null;
  payment_proof_url: string | null;
  paystack_ref: string | null;
  virtual_account_no: string | null;
  virtual_bank_name: string | null;
  delivery_info: Record<string, string> | null;
  created_at: string;
  paid_at: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export interface FAQItem {
  question: string;
  answer: string;
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
  external_shipping_url: string | null;
  external_shipping_headers: Record<string, string> | null;
  use_external_shipping: boolean;
  external_shipping_field_map: Record<string, string> | null;
  external_order_webhook_url: string | null;
  external_order_webhook_secret: string | null;
  about_business: string | null;
  faqs: FAQItem[] | null;
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

export interface PaymentSettings {
  id: string;
  business_id: string;
  paystack_enabled: boolean;
  paystack_public_key: string | null;
  virtual_account_enabled: boolean;
  manual_transfer_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  business_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_primary: boolean;
  created_at: string;
}
