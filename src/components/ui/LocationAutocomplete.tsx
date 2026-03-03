"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Search } from "lucide-react";
import rawData from "@/data/nigeria-locations.json";

// The new data structure is { "State Name": ["LGA1", "LGA2", ...] }
const locationsData = rawData as Record<string, string[]>;

interface LocationAutocompleteProps {
    selectedAreas: string[];
    onChange: (areas: string[]) => void;
    placeholder?: string;
}

export default function LocationAutocomplete({
    selectedAreas,
    onChange,
    placeholder = "Search States or LGAs...",
}: LocationAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Flatten the data for easier searching
    const allOptions = useMemo(() => {
        const options: string[] = [];
        Object.entries(locationsData).forEach(([state, lgas]) => {
            options.push(state);
            // Special case for Abuja
            if (state === "Federal Capital Territory") {
                options.push("Abuja");
            }
            lgas.forEach((lga) => {
                options.push(`${lga} (${state})`);
                // If it's FCT, also allow search with (Abuja)
                if (state === "Federal Capital Territory") {
                    options.push(`${lga} (Abuja)`);
                }
            });
        });
        return Array.from(new Set(options)); // Unique options
    }, []);

    const filteredOptions = useMemo(() => {
        if (query.trim() === "") return [];
        const lowerQuery = query.toLowerCase();
        return allOptions
            .filter(opt => opt.toLowerCase().includes(lowerQuery))
            .filter(opt => !selectedAreas.includes(opt))
            .slice(0, 10);
    }, [query, allOptions, selectedAreas]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addArea = (area: string) => {
        if (!selectedAreas.includes(area)) {
            onChange([...selectedAreas, area]);
        }
        setQuery("");
        setIsOpen(false);
    };

    const removeArea = (area: string) => {
        onChange(selectedAreas.filter((a) => a !== area));
    };

    // Prevent hydration error by not rendering until mounted
    if (!mounted) {
        return (
            <div className="min-h-[42px] w-full rounded-md border border-gray-300 bg-gray-50 p-1.5 opacity-50">
                <div className="flex flex-wrap gap-1.5">
                    <input
                        type="text"
                        className="flex-1 min-w-[120px] border-none bg-transparent p-1 text-sm outline-none placeholder:text-gray-400"
                        placeholder={placeholder}
                        disabled
                        value=""
                        readOnly
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            <div className="min-h-[42px] w-full rounded-md border border-gray-300 bg-white p-1.5 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
                <div className="flex flex-wrap gap-1.5">
                    {selectedAreas.map((area) => (
                        <span
                            key={area}
                            className="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700"
                        >
                            {area}
                            <button
                                type="button"
                                onClick={() => removeArea(area)}
                                className="hover:text-primary-900"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        className="flex-1 min-w-[120px] border-none bg-transparent p-1 text-sm outline-none placeholder:text-gray-400"
                        placeholder={selectedAreas.length === 0 ? placeholder : ""}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                    />
                </div>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-xl ring-1 ring-black ring-opacity-5">
                    {filteredOptions.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className="flex w-full items-center px-4 py-2 text-left hover:bg-primary-50 hover:text-primary-700 font-medium"
                            onClick={() => addArea(option)}
                        >
                            <Search size={14} className="mr-2 text-gray-400" />
                            {option}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query.length > 2 && filteredOptions.length === 0 && (
                <div className="absolute z-[100] mt-1 w-full rounded-md bg-white p-4 text-sm text-gray-500 shadow-xl ring-1 ring-black ring-opacity-5">
                    <p>Location not found in our Nigerian database.</p>
                    <button
                        type="button"
                        className="mt-2 text-primary-600 hover:underline font-semibold"
                        onClick={() => addArea(query)}
                    >
                        Add "{query}" manually
                    </button>
                </div>
            )}
        </div>
    );
}
