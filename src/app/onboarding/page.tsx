"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatNaira } from "@/lib/utils";
import LocationAutocomplete from "@/components/ui/LocationAutocomplete";
import ZoneNameAutocomplete from "@/components/ui/ZoneNameAutocomplete";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: WhatsApp
  const [wabaId, setWabaId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Step 2: Catalog
  const [catalogType, setCatalogType] = useState<"file" | "api">("file");
  const [catalogFile, setCatalogFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [externalApiKey, setExternalApiKey] = useState("");
  const [importResult, setImportResult] = useState<any>(null);

  // Step 3: Shipping
  const [shippingName, setShippingName] = useState("Local Delivery");
  const [baseRate, setBaseRate] = useState("1500");
  const [perKgRate, setPerKgRate] = useState("200");
  const [shippingAreas, setShippingAreas] = useState<string[]>([]);

  // Step 4: Agent config
  const [greeting, setGreeting] = useState(
    "Hello! Welcome to our store. How can I help you today?"
  );
  const [tone, setTone] = useState("friendly");

  async function connectWhatsApp() {
    setError("");
    setLoading(true);
    try {
      const res = await api.post<any>("/api/onboarding/connect-whatsapp", {
        waba_id: wabaId,
        phone_number_id: phoneNumberId,
        access_token: accessToken,
        whatsapp_number: whatsappNumber || null,
      });
      if (res.status === "error") {
        setError(res.message);
      } else {
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function setupCatalog() {
    if (catalogType === "api") {
      if (!externalUrl) {
        setStep(3);
        return;
      }
      setError("");
      setLoading(true);
      try {
        await api.put("/api/agent-config", {
          use_external_catalog: true,
          external_catalog_url: externalUrl,
          external_catalog_headers: externalApiKey ? { "X-API-Key": externalApiKey } : null,
        });
        setStep(3);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!catalogFile) {
      setStep(3);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.upload<any>("/api/onboarding/import-catalog", catalogFile);
      setImportResult(res);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveShipping() {
    setError("");
    setLoading(true);
    try {
      await api.post("/api/shipping-zones", {
        name: shippingName,
        base_rate: parseFloat(baseRate),
        per_kg_rate: parseFloat(perKgRate),
        areas: shippingAreas,
      });
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    setError("");
    setLoading(true);
    try {
      await api.put("/api/agent-config", { greeting, tone });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${s <= step
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-500"
                  }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-gray-500">
            <span>WhatsApp</span>
            <span>Catalog</span>
            <span>Shipping</span>
            <span>Configure</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Connect WhatsApp</h2>
            <p className="text-sm text-gray-600">
              Enter your Meta WhatsApp Business credentials.
            </p>
            <input
              placeholder="WABA ID"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Phone Number ID"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              type="password"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="WhatsApp Number (optional, e.g. +2348012345678)"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={connectWhatsApp}
              disabled={loading || !wabaId || !phoneNumberId || !accessToken}
              className="w-full rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Connect"}
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full text-sm text-gray-500 hover:underline"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Product Catalog</h2>
            <div className="flex rounded-md bg-gray-100 p-1">
              <button
                onClick={() => setCatalogType("file")}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium ${catalogType === "file" ? "bg-white shadow-sm" : "text-gray-500"
                  }`}
              >
                CSV Upload
              </button>
              <button
                onClick={() => setCatalogType("api")}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium ${catalogType === "api" ? "bg-white shadow-sm" : "text-gray-500"
                  }`}
              >
                External API (v2)
              </button>
            </div>

            {catalogType === "file" ? (
              <>
                <p className="text-sm text-gray-600">
                  Upload a CSV file with columns: name, description, price, image_url, weight_kg
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCatalogFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm"
                />
                {importResult && (
                  <div className="rounded bg-green-50 p-3 text-sm text-green-700">
                    Imported {importResult.products_created} products.
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Connect your own API to sync products in real-time.
                </p>
                <input
                  placeholder="API URL (e.g. Supabase function)"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  placeholder="API Key (X-API-Key header)"
                  value={externalApiKey}
                  onChange={(e) => setExternalApiKey(e.target.value)}
                  type="password"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            <button
              onClick={setupCatalog}
              disabled={loading}
              className="w-full rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading
                ? "Setting up..."
                : (catalogType === "file" && !catalogFile) || (catalogType === "api" && !externalUrl)
                  ? "Skip & Continue"
                  : "Save & Continue"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Set Up Delivery</h2>
            <p className="text-sm text-gray-600">
              How do you charge for delivery? You can add more zones later.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Zone Name</label>
              <div className="mt-1">
                <ZoneNameAutocomplete
                  value={shippingName}
                  onChange={setShippingName}
                  placeholder="e.g. Lagos Island"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Rate (₦)</label>
                <input
                  type="number"
                  value={baseRate}
                  onChange={(e) => setBaseRate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Per KG (₦)</label>
                <input
                  type="number"
                  value={perKgRate}
                  onChange={(e) => setPerKgRate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Areas Covered</label>
              <div className="mt-1">
                <LocationAutocomplete
                  selectedAreas={shippingAreas}
                  onChange={setShippingAreas}
                  placeholder="Search States or LGAs (e.g. Lagos, Ikeja...)"
                />
              </div>
            </div>
            <button
              onClick={saveShipping}
              disabled={loading}
              className="w-full rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Configure Agent</h2>
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
            <button
              onClick={saveConfig}
              disabled={loading}
              className="w-full rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Go to Dashboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
