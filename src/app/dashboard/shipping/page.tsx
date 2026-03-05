"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNaira } from "@/lib/utils";
import { ShippingZone, AgentConfig } from "@/types";
import LocationAutocomplete from "@/components/ui/LocationAutocomplete";
import ZoneNameAutocomplete from "@/components/ui/ZoneNameAutocomplete";

export default function ShippingPage() {
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editZone, setEditZone] = useState<ShippingZone | null>(null);

    // Form state for local zones
    const [name, setName] = useState("");
    const [baseRate, setBaseRate] = useState("");
    const [perKgRate, setPerKgRate] = useState("");
    const [areas, setAreas] = useState<string[]>([]);
    const [formLoading, setFormLoading] = useState(false);

    // External API state
    const [config, setConfig] = useState<AgentConfig | null>(null);
    const [useExternal, setUseExternal] = useState(false);
    const [externalUrl, setExternalUrl] = useState("");
    const [externalApiKey, setExternalApiKey] = useState("");
    const [configSaving, setConfigSaving] = useState(false);
    const [configMessage, setConfigMessage] = useState("");

    // Field mapping state
    const [fieldMap, setFieldMap] = useState<Record<string, string>>({
        zone_name: "name",
        base_rate: "base_rate",
        per_kg_rate: "per_kg_rate",
        areas: "areas",
        area_name: "area_name",
    });
    const [detectedFields, setDetectedFields] = useState<string[]>([]);
    const [sampleZone, setSampleZone] = useState<Record<string, unknown> | null>(null);
    const [testing, setTesting] = useState(false);
    const [testMessage, setTestMessage] = useState("");

    useEffect(() => {
        loadZones();
        loadConfig();
    }, []);

    function loadZones() {
        api
            .get<ShippingZone[]>("/api/shipping-zones")
            .then(setZones)
            .catch(() => { })
            .finally(() => setLoading(false));
    }

    function loadConfig() {
        api
            .get<AgentConfig>("/api/agent-config")
            .then((c) => {
                setConfig(c);
                setUseExternal(c.use_external_shipping);
                setExternalUrl(c.external_shipping_url || "");
                setExternalApiKey(c.external_shipping_headers?.["X-API-Key"] || "");
                if (c.external_shipping_field_map) {
                    setFieldMap((prev) => ({ ...prev, ...c.external_shipping_field_map }));
                }
            })
            .catch(() => { });
    }

    async function handleSaveConfig(e: React.FormEvent) {
        e.preventDefault();
        setConfigSaving(true);
        setConfigMessage("");
        try {
            const updated = await api.put<AgentConfig>("/api/agent-config", {
                use_external_shipping: useExternal,
                external_shipping_url: externalUrl,
                external_shipping_headers: externalApiKey ? { "X-API-Key": externalApiKey } : null,
                external_shipping_field_map: useExternal ? fieldMap : null,
            });
            setConfig(updated);
            setConfigMessage("External shipping settings saved.");
            loadZones();
        } catch {
            setConfigMessage("Failed to save external shipping settings.");
        }
        setConfigSaving(false);
    }

    async function handleTestConnection() {
        if (!externalUrl) return;
        setTesting(true);
        setTestMessage("");
        setSampleZone(null);
        setDetectedFields([]);
        try {
            const result = await api.post<{
                success: boolean;
                zone_count: number;
                sample_zone: Record<string, unknown>;
                scalar_fields: { key: string; value: unknown; type: string }[];
                list_fields: { key: string; sample: unknown[]; type: string }[];
            }>("/api/shipping-zones/test-external", {
                url: externalUrl,
                headers: externalApiKey ? { "X-API-Key": externalApiKey } : null,
            });

            setSampleZone(result.sample_zone);
            const allKeys = Object.keys(result.sample_zone);
            setDetectedFields(allKeys);
            setTestMessage(`Connected! Found ${result.zone_count} zones. Map your fields below.`);
        } catch (err: any) {
            setTestMessage(err?.message || "Failed to connect to API.");
        }
        setTesting(false);
    }

    function openAdd() {
        setEditZone(null);
        setName("");
        setBaseRate("");
        setPerKgRate("");
        setAreas([]);
        setShowForm(true);
    }

    function openEdit(z: ShippingZone) {
        setEditZone(z);
        setName(z.name);
        setBaseRate(String(z.base_rate));
        setPerKgRate(String(z.per_kg_rate));
        setAreas(z.areas.map((a) => a.area_name));
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editZone) {
                const updated = await api.put<ShippingZone>(
                    `/api/shipping-zones/${editZone.id}`,
                    {
                        name,
                        base_rate: parseFloat(baseRate),
                        per_kg_rate: parseFloat(perKgRate),
                    }
                );
                await api.put(`/api/shipping-zones/${editZone.id}/areas`, areas);
                loadZones();
            } else {
                const created = await api.post<ShippingZone>("/api/shipping-zones", {
                    name,
                    base_rate: parseFloat(baseRate),
                    per_kg_rate: parseFloat(perKgRate),
                    areas: areas,
                });
                setZones((prev) => [...prev, created]);
            }
            setShowForm(false);
        } catch { }
        setFormLoading(false);
    }

    async function toggleStatus(zone: ShippingZone) {
        try {
            const updated = await api.patch<ShippingZone>(
                `/api/shipping-zones/${zone.id}/toggle`,
                {}
            );
            setZones((prev) =>
                prev.map((z) => (z.id === updated.id ? updated : z))
            );
        } catch { }
    }

    async function deleteZone(id: string) {
        if (!confirm("Are you sure you want to delete this shipping zone?")) return;
        try {
            await api.delete(`/api/shipping-zones/${id}`);
            setZones((prev) => prev.filter((z) => z.id !== id));
        } catch (err: any) {
            alert(err.message || "Failed to delete shipping zone. Ensure no active orders are using it.");
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Shipping Management</h1>
                    <p className="text-sm text-gray-500">
                        Configure how delivery fees are calculated for your customers.
                    </p>
                </div>
            </div>

            {/* External API Config */}
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">External Shipping API</h2>
                {configMessage && (
                    <div className={`mb-4 rounded p-3 text-sm ${configMessage.includes("saved") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {configMessage}
                    </div>
                )}
                <form onSubmit={handleSaveConfig} className="space-y-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="useExternal"
                            checked={useExternal}
                            onChange={(e) => setUseExternal(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600"
                        />
                        <label htmlFor="useExternal" className="ml-2 block text-sm text-gray-900 font-medium">
                            Use External API for Shipping Zones
                        </label>
                    </div>

                    {useExternal && (
                        <div className="space-y-4 pl-6 border-l-2 border-primary-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">API URL</label>
                                <input
                                    type="url"
                                    value={externalUrl}
                                    onChange={(e) => setExternalUrl(e.target.value)}
                                    placeholder="https://your-api.com/shipping-zones"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">API Key (X-API-Key)</label>
                                <input
                                    type="password"
                                    value={externalApiKey}
                                    onChange={(e) => setExternalApiKey(e.target.value)}
                                    placeholder="your-secret-key"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            {/* Test Connection */}
                            <button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={testing || !externalUrl}
                                className="rounded-md border border-primary-600 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 disabled:opacity-50"
                            >
                                {testing ? "Testing..." : "Test Connection & Detect Fields"}
                            </button>

                            {testMessage && (
                                <div className={`rounded p-3 text-sm ${testMessage.includes("Connected") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                    {testMessage}
                                </div>
                            )}

                            {/* Field Mapping */}
                            {(detectedFields.length > 0 || config?.external_shipping_field_map) && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-800">Field Mapping</h3>
                                    <p className="text-xs text-gray-500">
                                        Tell SellBOT which fields in your API correspond to each value.
                                        {detectedFields.length > 0 && " We detected the fields from your API — select the right ones."}
                                    </p>

                                    {[
                                        { label: "Zone Name", key: "zone_name", hint: "The field containing the zone/area name" },
                                        { label: "Base Rate (₦)", key: "base_rate", hint: "The base delivery fee" },
                                        { label: "Per KG Rate (₦)", key: "per_kg_rate", hint: "The additional fee per kilogram" },
                                        { label: "Areas List", key: "areas", hint: "The field containing coverage areas (array)" },
                                        { label: "Area Name (inside each area)", key: "area_name", hint: "The name field within each area object" },
                                    ].map(({ label, key, hint }) => (
                                        <div key={key} className="grid grid-cols-3 items-center gap-3">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">{label}</span>
                                                <p className="text-xs text-gray-400">{hint}</p>
                                            </div>
                                            <div className="col-span-2">
                                                {detectedFields.length > 0 ? (
                                                    <select
                                                        value={fieldMap[key] || ""}
                                                        onChange={(e) => setFieldMap((prev) => ({ ...prev, [key]: e.target.value }))}
                                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                                    >
                                                        <option value="">-- Select field --</option>
                                                        {detectedFields.map((f) => (
                                                            <option key={f} value={f}>
                                                                {f}
                                                                {sampleZone && sampleZone[f] !== undefined
                                                                    ? ` (e.g. ${String(sampleZone[f]).slice(0, 40)})`
                                                                    : ""}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={fieldMap[key] || ""}
                                                        onChange={(e) => setFieldMap((prev) => ({ ...prev, [key]: e.target.value }))}
                                                        placeholder={key}
                                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Sample Data Preview */}
                                    {sampleZone && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                                                View sample zone data from your API
                                            </summary>
                                            <pre className="mt-2 max-h-48 overflow-auto rounded bg-white p-3 text-xs text-gray-600 border">
                                                {JSON.stringify(sampleZone, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={configSaving}
                        className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                        {configSaving ? "Saving..." : "Save External Settings"}
                    </button>
                </form>
            </div>

            <div className="border-t pt-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {useExternal ? "External Zones (Read-Only)" : "Manual Shipping Zones"}
                    </h2>
                    {!useExternal && (
                        <button
                            onClick={openAdd}
                            className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
                        >
                            + Add Zone
                        </button>
                    )}
                </div>

                {loading ? (
                    <p className="text-gray-500">Loading zones...</p>
                ) : zones.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed p-12 text-center">
                        <p className="text-gray-500">No shipping zones found.</p>
                        {!useExternal && (
                            <button
                                onClick={openAdd}
                                className="mt-4 text-primary-600 hover:underline"
                            >
                                Create your first zone
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {zones.map((zone) => (
                            <div
                                key={zone.id}
                                className="flex flex-col rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Base: {formatNaira(zone.base_rate)} +{" "}
                                            {formatNaira(zone.per_kg_rate)}/kg
                                        </p>
                                    </div>
                                    <div
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${zone.is_active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {zone.is_active ? "Active" : "Inactive"}
                                    </div>
                                </div>

                                <div className="mb-6 flex-1">
                                    <span className="text-xs font-medium uppercase text-gray-400">
                                        Areas Covered
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {zone.areas.length > 0 ? (
                                            zone.areas.map((area) => (
                                                <span
                                                    key={area.id}
                                                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                                                >
                                                    {area.area_name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs italic text-gray-400">
                                                No areas defined
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!useExternal && (
                                    <div className="mt-auto flex gap-3 border-t pt-4">
                                        <button
                                            onClick={() => openEdit(zone)}
                                            className="text-xs font-medium text-primary-600 hover:underline"
                                        >
                                            Edit Settings
                                        </button>
                                        <button
                                            onClick={() => deleteZone(zone.id)}
                                            className="text-xs font-medium text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(zone)}
                                            className="ml-auto text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            {zone.is_active ? "Deactivate" : "Activate"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form Modal for Local Zones */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold">
                            {editZone ? "Edit Shipping Zone" : "New Shipping Zone"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Zone Name
                                </label>
                                <div className="mt-1">
                                    <ZoneNameAutocomplete
                                        value={name}
                                        onChange={setName}
                                        placeholder="e.g. Lagos Island"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Base Rate (₦)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="1500"
                                        value={baseRate}
                                        onChange={(e) => setBaseRate(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Per KG Rate (₦)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="200"
                                        value={perKgRate}
                                        onChange={(e) => setPerKgRate(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Areas Covered
                                </label>
                                <div className="mt-1">
                                    <LocationAutocomplete
                                        selectedAreas={areas}
                                        onChange={setAreas}
                                        placeholder="Search States or LGAs (e.g. Lagos, Ikeja...)"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-400">
                                    The AI will match customer locations against these keywords.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {formLoading ? "Saving..." : "Save Zone"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
