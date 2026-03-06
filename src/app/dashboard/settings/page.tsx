"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getAuth, setDefaultProductType } from "@/lib/auth";
import { AgentConfig, PaymentSettings, BankAccount, ProductTypeValue } from "@/types";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Agent config form
  const [greeting, setGreeting] = useState("");
  const [tone, setTone] = useState("friendly");
  const [followUpDelay, setFollowUpDelay] = useState(30);
  const [outOfHoursMsg, setOutOfHoursMsg] = useState("");
  const [escalationPhone, setEscalationPhone] = useState("");
  const [useExternalCatalog, setUseExternalCatalog] = useState(false);
  const [externalCatalogUrl, setExternalCatalogUrl] = useState("");
  const [externalCatalogApiKey, setExternalCatalogApiKey] = useState("");
  const [externalOrderWebhookUrl, setExternalOrderWebhookUrl] = useState("");
  const [externalOrderWebhookSecret, setExternalOrderWebhookSecret] = useState("");

  // Payment settings
  const [paySettings, setPaySettings] = useState<PaymentSettings | null>(null);
  const [payLoading, setPayLoading] = useState(true);
  const [paySaving, setPaySaving] = useState(false);
  const [payMessage, setPayMessage] = useState("");
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [hasSubaccount, setHasSubaccount] = useState(false);
  const [payoutBankCode, setPayoutBankCode] = useState("");
  const [payoutBankName, setPayoutBankName] = useState("");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [payoutAccountName, setPayoutAccountName] = useState("");
  const [virtualAccountEnabled, setVirtualAccountEnabled] = useState(false);
  const [manualTransferEnabled, setManualTransferEnabled] = useState(false);

  // Bank accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankLoading, setBankLoading] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  // Business type
  const { defaultProductType: savedType } = getAuth();
  const [businessType, setBusinessType] = useState<ProductTypeValue>(savedType);
  const [typeSaving, setTypeSaving] = useState(false);
  const [typeMessage, setTypeMessage] = useState("");

  const { toast } = useToast();

  // WhatsApp Bridge state
  const [bridgeStatus, setBridgeStatus] = useState<string>("disconnected");
  const [bridgeQr, setBridgeQr] = useState<string | null>(null);
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [isBridgeActive, setIsBridgeActive] = useState(false);

  // Load agent config
  useEffect(() => {
    api
      .get<AgentConfig>("/api/agent-config")
      .then((c) => {
        setConfig(c);
        setGreeting(c.greeting || "");
        setTone(c.tone);
        setFollowUpDelay(c.follow_up_delay_minutes);
        setOutOfHoursMsg(c.out_of_hours_msg || "");
        setEscalationPhone(c.escalation_phone || "");
        setUseExternalCatalog(c.use_external_catalog);
        setExternalCatalogUrl(c.external_catalog_url || "");
        setExternalCatalogApiKey(c.external_catalog_headers?.["X-API-Key"] || "");
        setExternalOrderWebhookUrl(c.external_order_webhook_url || "");
        setExternalOrderWebhookSecret(c.external_order_webhook_secret || "");
      })
      .catch(() => toast("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  // Load payment settings
  useEffect(() => {
    api
      .get<PaymentSettings>("/api/payment-settings")
      .then((ps) => {
        setPaySettings(ps);
        setPaystackEnabled(ps.paystack_enabled);

        // This is a custom field passed from backend via `__dict__` manipulation
        setHasSubaccount((ps as any).has_subaccount || false);

        setVirtualAccountEnabled(ps.virtual_account_enabled);
        setManualTransferEnabled(ps.manual_transfer_enabled);
      })
      .catch(() => toast("Failed to load payment settings"))
      .finally(() => setPayLoading(false));
  }, []);

  // Load bank accounts
  useEffect(() => {
    api
      .get<BankAccount[]>("/api/bank-accounts")
      .then(setBankAccounts)
      .catch(() => toast("Failed to load bank accounts"))
      .finally(() => setBankLoading(false));
  }, []);

  // Poll WhatsApp Bridge status
  useEffect(() => {
    const businessId = typeof window !== "undefined" ? localStorage.getItem("business_id") : null;
    if (!businessId) return;

    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        // Note: In development, the bridge is usually on port 3001
        // We use a proxy or direct call if local
        const res = await fetch(`http://localhost:3001/api/status?id=${businessId}`);
        const data = await res.json();
        setBridgeStatus(data.status);
        setBridgeQr(data.qr);
        if (data.status === "open") {
          setIsBridgeActive(true);
        }
      } catch (err) {
        console.error("Bridge not reachable", err);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  async function handleConnectBridge() {
    const businessId = typeof window !== "undefined" ? localStorage.getItem("business_id") : null;
    if (!businessId) return;

    setBridgeLoading(true);
    try {
      // Tell the backend to use this business_id as its phone_number_id for the bridge
      await api.put("/api/agent-config/use-bridge", { business_id: businessId });
      // The polling will pick up the QR/Status
    } catch (err) {
      alert("Failed to initialize bridge connection.");
    }
    setBridgeLoading(false);
  }

  // Save agent config
  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await api.put<AgentConfig>("/api/agent-config", {
        greeting,
        tone,
        follow_up_delay_minutes: followUpDelay,
        out_of_hours_msg: outOfHoursMsg,
        escalation_phone: escalationPhone,
        use_external_catalog: useExternalCatalog,
        external_catalog_url: externalCatalogUrl,
        external_catalog_headers: externalCatalogApiKey ? { "X-API-Key": externalCatalogApiKey } : null,
        external_order_webhook_url: externalOrderWebhookUrl || null,
        external_order_webhook_secret: externalOrderWebhookSecret || null,
      });
      setConfig(updated);
      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Failed to save settings.");
    }
    setSaving(false);
  }

  // Save payment settings
  async function handleSavePayment(e: React.FormEvent) {
    e.preventDefault();
    setPaySaving(true);
    setPayMessage("");
    try {
      const payload: Record<string, unknown> = {
        paystack_enabled: paystackEnabled,
        virtual_account_enabled: virtualAccountEnabled,
        manual_transfer_enabled: manualTransferEnabled,
      };
      const updated = await api.put<PaymentSettings>("/api/payment-settings", payload);
      setPaySettings(updated);
      setPayMessage("Payment settings saved.");
    } catch {
      setPayMessage("Failed to save payment settings.");
    }
    setPaySaving(false);
  }

  // Create Subaccount
  async function handleCreateSubaccount() {
    if (!payoutBankName || !payoutAccountNumber || !payoutAccountName) {
      alert("Please fill in all bank details.");
      return;
    }
    setPaySaving(true);
    setPayMessage("");
    try {
      await api.post("/api/payment-settings/subaccount", {
        bank_code: payoutBankName, // Can map names to codes later if needed
        account_number: payoutAccountNumber,
        account_name: payoutAccountName,
      });
      setHasSubaccount(true);
      setPayMessage("Bank details saved successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to save bank details.";
      setPayMessage(msg);
    }
    setPaySaving(false);
  }

  // Add bank account
  async function handleAddBank(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await api.post<BankAccount>("/api/bank-accounts", {
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        is_primary: bankAccounts.length === 0,
      });
      setBankAccounts((prev) => [...prev, created]);
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setShowBankForm(false);
    } catch { }
  }

  // Delete bank account
  async function handleDeleteBank(id: string) {
    try {
      await api.delete(`/api/bank-accounts/${id}`);
      setBankAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch { }
  }

  async function handleSaveBusinessType() {
    setTypeSaving(true);
    setTypeMessage("");
    try {
      await api.post("/api/onboarding/set-business-type", {
        default_product_type: businessType,
      });
      setDefaultProductType(businessType);
      setTypeMessage("Business type updated. Reload to see changes.");
    } catch {
      setTypeMessage("Failed to update business type.");
    }
    setTypeSaving(false);
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      {/* =================== BUSINESS TYPE =================== */}
      <div className="mb-8 max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Business Type</h2>
        <p className="mb-3 text-sm text-gray-600">
          What kind of products do you sell? This adapts your dashboard experience.
        </p>
        <div className="space-y-2">
          {([
            { value: "physical" as ProductTypeValue, label: "Physical Products", desc: "Shipped or delivered items", icon: "📦" },
            { value: "digital" as ProductTypeValue, label: "Digital Products", desc: "Downloads, licenses, digital files", icon: "💻" },
            { value: "course" as ProductTypeValue, label: "Courses & Services", desc: "Online courses, coaching, enrollments", icon: "🎓" },
          ]).map((bt) => (
            <button
              key={bt.value}
              onClick={() => setBusinessType(bt.value)}
              className={`w-full rounded-lg border-2 p-3 text-left transition ${businessType === bt.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{bt.icon}</span>
                <div>
                  <div className="text-sm font-medium">{bt.label}</div>
                  <div className="text-xs text-gray-500">{bt.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {businessType !== savedType && (
          <button
            onClick={handleSaveBusinessType}
            disabled={typeSaving}
            className="mt-3 rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {typeSaving ? "Saving..." : "Save Business Type"}
          </button>
        )}
        {typeMessage && (
          <p className={`mt-2 text-sm ${typeMessage.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
            {typeMessage}
          </p>
        )}
      </div>

      {/* =================== WHATSAPP CONNECTION =================== */}
      <div className="mb-8 max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">WhatsApp Connection</h2>

        {isBridgeActive ? (
          <div className="flex items-center space-x-3 rounded-md bg-green-50 p-4 border border-green-100">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-medium text-green-800">WhatsApp is Linked & Active</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Link your WhatsApp account to start using AZERRA. No Meta API setup required for testing.
            </p>

            {bridgeQr ? (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <QRCodeSVG value={bridgeQr} size={200} />
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Scan with WhatsApp</p>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Open WhatsApp on your phone {">"} Linked Devices {">"} Link a Device
                </p>
              </div>
            ) : (
              <button
                onClick={handleConnectBridge}
                disabled={bridgeLoading}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {bridgeLoading ? "Initializing..." : "Link WhatsApp Account"}
              </button>
            )}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          Current Status: <span className="capitalize font-mono">{bridgeStatus}</span>
        </p>
      </div>

      {/* =================== AGENT CONFIG =================== */}
      <div className="max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Agent Configuration</h2>
        {message && (
          <div
            className={`mb-4 rounded p-3 text-sm ${message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
              }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Greeting Message
            </label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              The first message your AI agent sends to new customers.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Follow-up Delay (minutes)
            </label>
            <input
              type="number"
              min={5}
              max={1440}
              value={followUpDelay}
              onChange={(e) => setFollowUpDelay(parseInt(e.target.value) || 30)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              How long to wait before sending a follow-up message to idle customers.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Out of Hours Message
            </label>
            <textarea
              value={outOfHoursMsg}
              onChange={(e) => setOutOfHoursMsg(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Escalation WhatsApp Number
            </label>
            <input
              type="text"
              value={escalationPhone}
              onChange={(e) => setEscalationPhone(e.target.value)}
              placeholder="e.g. +234..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              The number the AI will message when a customer needs human help.
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">External Product Catalog (v2)</h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useExternalCatalog"
                checked={useExternalCatalog}
                onChange={(e) => setUseExternalCatalog(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600"
              />
              <label htmlFor="useExternalCatalog" className="ml-2 block text-sm text-gray-900">
                Use External API Catalog
              </label>
            </div>

            {useExternalCatalog && (
              <div className="space-y-4 pl-6 border-l-2 border-primary-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    External API URL
                  </label>
                  <input
                    type="url"
                    value={externalCatalogUrl}
                    onChange={(e) => setExternalCatalogUrl(e.target.value)}
                    placeholder="https://your-api.com/products"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    The endpoint AZERRA should call to fetch your products.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    API Key (X-API-Key)
                  </label>
                  <input
                    type="password"
                    value={externalCatalogApiKey}
                    onChange={(e) => setExternalCatalogApiKey(e.target.value)}
                    placeholder="Your secret key"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Sent in the header as <code>X-API-Key</code>.
                  </p>
                </div>
              </div>
            )}

            <hr className="my-6 border-gray-200" />
            <h2 className="text-lg font-semibold text-gray-900">External Order Webhook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={externalOrderWebhookUrl}
                  onChange={(e) => setExternalOrderWebhookUrl(e.target.value)}
                  placeholder="https://your-api.com/webhooks/azzera"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-400">
                  AZERRA will POST order data to this URL whenever a purchase is confirmed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Webhook Secret
                </label>
                <input
                  type="password"
                  value={externalOrderWebhookSecret}
                  onChange={(e) => setExternalOrderWebhookSecret(e.target.value)}
                  placeholder="Your webhook secret"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Used to sign the payload (HMAC-SHA256) so you can verify the request is authentic.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary-600 px-6 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>

      {/* =================== PAYMENT SETTINGS =================== */}
      <div className="mt-8 max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Methods</h2>
        {payMessage && (
          <div
            className={`mb-4 rounded p-3 text-sm ${payMessage.includes("saved")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
              }`}
          >
            {payMessage}
          </div>
        )}

        {payLoading ? (
          <p className="text-sm text-gray-400">Loading payment settings...</p>
        ) : (
          <form onSubmit={handleSavePayment} className="space-y-5">
            {/* Paystack */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="paystackEnabled"
                  checked={paystackEnabled}
                  onChange={(e) => setPaystackEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                />
                <label htmlFor="paystackEnabled" className="ml-2 block text-sm font-medium text-gray-900">
                  Paystack (Card / USSD)
                </label>
              </div>

              {paystackEnabled && (
                <div className="space-y-4 pl-6 border-l-2 border-primary-100 mb-6">

                  {hasSubaccount ? (
                    <div className="rounded-md bg-green-50 p-4 border border-green-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 text-green-500">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 text-sm text-green-700">
                          <p className="font-medium">Bank Details Connected</p>
                          <p className="mt-1 text-xs text-green-600">You are ready to receive automatic payouts.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-gray-200 p-4 space-y-4 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-900">Bank Details for Payouts</h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Please provide the Nigerian bank account where earnings will be sent automatically.
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Bank Name (or Code)</label>
                          <input
                            type="text"
                            value={payoutBankName}
                            onChange={(e) => setPayoutBankName(e.target.value)}
                            placeholder="e.g. 058 or Guaranty Trust Bank"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Account Number</label>
                          <input
                            type="text"
                            value={payoutAccountNumber}
                            onChange={(e) => setPayoutAccountNumber(e.target.value)}
                            placeholder="0123456789"
                            maxLength={10}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Account Name</label>
                          <input
                            type="text"
                            value={payoutAccountName}
                            onChange={(e) => setPayoutAccountName(e.target.value)}
                            placeholder="John Doe Enterprises"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateSubaccount}
                          disabled={paySaving || !payoutBankName || !payoutAccountNumber || !payoutAccountName}
                          className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                        >
                          {paySaving ? "Saving..." : "Save Bank Details"}
                        </button>
                      </div>
                    </div>
                  )}

                  <hr className="my-4 border-gray-200" />

                  {/* Virtual Account */}
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="virtualAccountEnabled"
                      checked={virtualAccountEnabled}
                      onChange={(e) => setVirtualAccountEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600"
                    />
                    <label htmlFor="virtualAccountEnabled" className="ml-2 block text-sm text-gray-900">
                      Enable Paystack Virtual Accounts
                    </label>
                  </div>
                  <p className="pl-6 text-xs text-gray-400">
                    Generates a unique bank account per order. Payments are auto-confirmed by Paystack.
                  </p>
                </div>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Manual Transfer */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="manualTransferEnabled"
                checked={manualTransferEnabled}
                onChange={(e) => setManualTransferEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600"
              />
              <label htmlFor="manualTransferEnabled" className="ml-2 block text-sm font-medium text-gray-900">
                Manual Bank Transfer
              </label>
            </div>
            {manualTransferEnabled && (
              <p className="pl-6 text-xs text-gray-400">
                Customers transfer to your bank account and send a receipt. You confirm payments from the Orders page.
              </p>
            )}

            <button
              type="submit"
              disabled={paySaving}
              className="rounded-md bg-primary-600 px-6 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {paySaving ? "Saving..." : "Save Payment Settings"}
            </button>
          </form>
        )}
      </div>

      {/* =================== BANK ACCOUNTS =================== */}
      {manualTransferEnabled && (
        <div className="mt-8 max-w-xl rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
            <button
              onClick={() => setShowBankForm(!showBankForm)}
              className="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700"
            >
              {showBankForm ? "Cancel" : "+ Add Account"}
            </button>
          </div>

          {showBankForm && (
            <form onSubmit={handleAddBank} className="mb-4 space-y-3 rounded border border-gray-200 p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. GTBank"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="John's Business"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                Add Account
              </button>
            </form>
          )}

          {bankLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : bankAccounts.length === 0 ? (
            <p className="text-sm text-gray-500">No bank accounts added yet.</p>
          ) : (
            <ul className="divide-y">
              {bankAccounts.map((acct) => (
                <li key={acct.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{acct.bank_name}</p>
                    <p className="text-xs text-gray-500">
                      {acct.account_number} — {acct.account_name}
                      {acct.is_primary && (
                        <span className="ml-2 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
                          Primary
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBank(acct.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
