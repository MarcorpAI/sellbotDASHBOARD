"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search } from "lucide-react";

const COMMON_ZONE_NAMES = [
    "Lagos Island",
    "Lagos Mainland",
    "Lekki / Ajah",
    "Ikeja & Environs",
    "Abuja Municipal",
    "Gwarimpa / Kubwa",
    "South East Regional",
    "South West Regional",
    "North Central Regional",
    "National Delivery (NIPOST)",
    "International Shipping",
    "Store Pickup",
];

interface ZoneNameAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function ZoneNameAutocomplete({
    value,
    onChange,
    placeholder = "e.g. Lagos Island",
}: ZoneNameAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredOptions = useMemo(() => {
        if (!value.trim()) return [];
        return COMMON_ZONE_NAMES.filter((name) =>
            name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!mounted) {
        return (
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                disabled
                className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm opacity-50"
            />
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
            />

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-[110] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-xl ring-1 ring-black ring-opacity-5">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase text-gray-400">
                        Common Suggestions
                    </div>
                    {filteredOptions.map((option: string) => (
                        <button
                            key={option}
                            type="button"
                            className="flex w-full items-center px-4 py-2 text-left hover:bg-primary-50 hover:text-primary-700 font-medium"
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                        >
                            <Search size={14} className="mr-2 text-gray-400" />
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
