"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AgentConfig, FAQItem } from "@/types";

export default function BusinessBrainPage() {
    const [config, setConfig] = useState<AgentConfig | null>(null);
    const [aboutBusiness, setAboutBusiness] = useState("");
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api
            .get<AgentConfig>("/api/agent-config")
            .then((data) => {
                setConfig(data);
                setAboutBusiness(data.about_business || "");
                setFaqs(data.faqs || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    async function handleSave() {
        setSaving(true);
        try {
            await api.put("/api/agent-config", {
                about_business: aboutBusiness,
                faqs: faqs,
            });
            alert("Business Brain updated successfully!");
        } catch (err: any) {
            alert("Failed to save: " + (err.message || "Unknown error"));
        } finally {
            setSaving(false);
        }
    }

    function addFaq() {
        setFaqs([...faqs, { question: "", answer: "" }]);
    }

    function updateFaq(index: number, field: keyof FAQItem, value: string) {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    }

    function removeFaq(index: number) {
        setFaqs(faqs.filter((_, i) => i !== index));
    }

    if (loading) return <p className="text-gray-500">Loading...</p>;

    return (
        <div className="max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Business Brain</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="space-y-8">
                {/* About Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">About Your Business</h2>
                    <p className="mb-4 text-sm text-gray-500">
                        Tell the AI about your business. Where are you located? What is your mission?
                        What makes you unique? This helps the AI answer general "Who are you?" questions.
                    </p>
                    <textarea
                        value={aboutBusiness}
                        onChange={(e) => setAboutBusiness(e.target.value)}
                        className="h-32 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Example: We are a premium fashion brand based in Lekki, Lagos. We specialize in handmade leather bags and accessories..."
                    />
                </div>

                {/* FAQ Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
                        <button
                            onClick={addFaq}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                            + Add FAQ
                        </button>
                    </div>
                    <p className="mb-6 text-sm text-gray-500">
                        Add common questions and answers. The AI will use these to respond to customers
                        without needing a human.
                    </p>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="relative rounded-md border border-gray-100 bg-gray-50 p-4">
                                <button
                                    onClick={() => removeFaq(index)}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                                    title="Remove FAQ"
                                >
                                    ✕
                                </button>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Question
                                        </label>
                                        <input
                                            type="text"
                                            value={faq.question}
                                            onChange={(e) => updateFaq(index, "question", e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            placeholder="e.g. Do you have a physical store?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Answer
                                        </label>
                                        <textarea
                                            value={faq.answer}
                                            onChange={(e) => updateFaq(index, "answer", e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            placeholder="e.g. Yes, we are located at 123 Victoria Island, Lagos. We are open Mon-Sat, 9am - 6pm."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {faqs.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-400">No FAQs added yet.</p>
                                <button
                                    onClick={addFaq}
                                    className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-900"
                                >
                                    Add your first FAQ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 rounded-md bg-blue-50 p-4 text-sm text-blue-700">
                <p className="font-semibold">✨ AI Integration Tip:</p>
                <p className="mt-1">
                    The information you provide here is automatically fed into your AI agent's "Brain".
                    Try to be clear and concise. The AI works best when given specific facts!
                </p>
            </div>
        </div>
    );
}
