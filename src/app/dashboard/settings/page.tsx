"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AgentConfig } from "@/types";

export default function SettingsPage() {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form
  const [greeting, setGreeting] = useState("");
  const [tone, setTone] = useState("friendly");
  const [followUpDelay, setFollowUpDelay] = useState(30);
  const [outOfHoursMsg, setOutOfHoursMsg] = useState("");
  const [escalationPhone, setEscalationPhone] = useState("");
  const [useExternalCatalog, setUseExternalCatalog] = useState(false);
  const [externalCatalogUrl, setExternalCatalogUrl] = useState("");
  const [externalCatalogApiKey, setExternalCatalogApiKey] = useState("");

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
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
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
      });
      setConfig(updated);
      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Failed to save settings.");
    }
    setSaving(false);
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="max-w-xl rounded-lg bg-white p-6 shadow-sm">
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

        <form onSubmit={handleSave} className="space-y-4">
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
                    The endpoint SellBOT should call to fetch your products.
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
    </div>
  );
}
