"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNaira } from "@/lib/utils";
import { ShippingZone } from "@/types";
import LocationAutocomplete from "@/components/ui/LocationAutocomplete";
import ZoneNameAutocomplete from "@/components/ui/ZoneNameAutocomplete";

export default function ShippingPage() {
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editZone, setEditZone] = useState<ShippingZone | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [baseRate, setBaseRate] = useState("");
    const [perKgRate, setPerKgRate] = useState("");
    const [areas, setAreas] = useState<string[]>([]);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        loadZones();
    }, []);

    function loadZones() {
        api
            .get<ShippingZone[]>("/api/shipping-zones")
            .then(setZones)
            .catch(() => { })
            .finally(() => setLoading(false));
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
                // Bulk update areas
                await api.put(`/api/shipping-zones/${editZone.id}/areas`, areas);

                loadZones(); // Refresh everything to get nested areas right
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
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Shipping Zones</h1>
                    <p className="text-sm text-gray-500">
                        Define your delivery areas and rates based on weight.
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
                >
                    Add Shipping Zone
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : zones.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-12 text-center">
                    <p className="text-gray-500">No shipping zones configured yet.</p>
                    <button
                        onClick={openAdd}
                        className="mt-4 text-primary-600 hover:underline"
                    >
                        Create your first zone
                    </button>
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
                                <button
                                    onClick={() => toggleStatus(zone)}
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${zone.is_active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {zone.is_active ? "Active" : "Inactive"}
                                </button>
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
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
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
