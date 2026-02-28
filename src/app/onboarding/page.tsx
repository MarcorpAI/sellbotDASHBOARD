"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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
  const [catalogFile, setCatalogFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  // Step 3: Agent config
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

  async function importCatalog() {
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
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  s <= step
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>WhatsApp</span>
            <span>Catalog</span>
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
            <h2 className="text-lg font-semibold">Upload Catalog</h2>
            <p className="text-sm text-gray-600">
              Upload a CSV file with columns: name, description, price, image_url
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
                {importResult.errors?.length > 0 && (
                  <p className="mt-1 text-red-600">
                    {importResult.errors.length} errors
                  </p>
                )}
              </div>
            )}
            <button
              onClick={importCatalog}
              disabled={loading}
              className="w-full rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading
                ? "Importing..."
                : catalogFile
                ? "Import & Continue"
                : "Skip & Continue"}
            </button>
          </div>
        )}

        {step === 3 && (
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
