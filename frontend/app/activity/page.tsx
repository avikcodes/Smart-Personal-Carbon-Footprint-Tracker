"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// --- Types ---

type ActivityType = "transport" | "food" | "energy";

interface TransportData {
    mode: string;
    distance: string;
}

interface FoodData {
    category: string;
    quantity: string;
    unit: string;
}

interface EnergyData {
    kwh: string;
}

// --- Reusable Components ---

const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">
        {children}
    </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-slate-900 placeholder:text-slate-400"
    />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        {...props}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
    />
);

const Button = ({
    children,
    loading,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => (
    <button
        {...props}
        disabled={props.disabled || loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
    >
        {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        )}
        {children}
    </button>
);

// --- Main Page Component ---

export default function ActivityPage() {
    const [activeTab, setActiveTab] = useState<ActivityType>("transport");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const router = useRouter();

    // Form States
    const [transport, setTransport] = useState<TransportData>({ mode: "", distance: "" });
    const [food, setFood] = useState<FoodData>({ category: "", quantity: "", unit: "kg" });
    const [energy, setEnergy] = useState<EnergyData>({ kwh: "" });

    const resetForms = () => {
        setTransport({ mode: "", distance: "" });
        setFood({ category: "", quantity: "", unit: "kg" });
        setEnergy({ kwh: "" });
    };

    const showFeedback = (text: string, type: "success" | "error") => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let endpoint = "";
        let body = {};

        if (activeTab === "transport") {
            if (!transport.mode || !transport.distance) return setLoading(false);
            endpoint = "/api/transport";
            body = transport;
        } else if (activeTab === "food") {
            if (!food.category || !food.quantity) return setLoading(false);
            endpoint = "/api/food";
            body = food;
        } else {
            if (!energy.kwh) return setLoading(false);
            endpoint = "/api/energy";
            body = energy;
        }

        try {
            // Mock fetch call
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            // Store values in localStorage for the dashboard demo
            const payload = {
                transport_mode: activeTab === "transport" ? transport.mode : "car",
                distance: activeTab === "transport" ? parseFloat(transport.distance) : 0,
                food_type: activeTab === "food" ? food.category : "beef",
                food_quantity: activeTab === "food" ? parseFloat(food.quantity) : 0,
                energy_kwh: activeTab === "energy" ? parseFloat(energy.kwh) : 0
            };
            localStorage.setItem("lastActivityPayload", JSON.stringify(payload));

            // If result is fake-success, show it.
            showFeedback(`Successfully logged your ${activeTab} data!`, "success");
            resetForms();

            // Redirect to dashboard after 1 second
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } catch (error) {
            // Since endpoints don't exist, we'll actually get a 404 or error in real dev.
            // For hackathon UI demo, we'll simulate success if needed or show error.
            showFeedback(`Error: Could not reach ${endpoint}. (Expected without backend)`, "error");
        } finally {
            setLoading(false);
        }
    };

    const tabs: { id: ActivityType; label: string; icon: string }[] = [
        { id: "transport", label: "Transport", icon: "🚗" },
        { id: "food", label: "Food", icon: "🥗" },
        { id: "energy", label: "Energy", icon: "⚡" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Footprint</h1>
                <p className="text-slate-500 max-w-md">Log your daily activities to understand and reduce your environmental impact.</p>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                {/* Tab Switcher */}
                <div className="relative flex border-b border-slate-100 bg-slate-50/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 text-sm font-semibold flex flex-col items-center transition-colors duration-200 relative ${activeTab === tab.id ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            <span className="text-xl mb-1">{tab.icon}</span>
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 transition-all duration-300 transform" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

                        {activeTab === "transport" && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="mode">Mode of Transport</Label>
                                    <Select
                                        id="mode"
                                        value={transport.mode}
                                        onChange={(e) => setTransport({ ...transport, mode: e.target.value })}
                                        required
                                    >
                                        <option value="">Select mode...</option>
                                        <option value="car">Car (Gasoline)</option>
                                        <option value="bus">Bus</option>
                                        <option value="train">Train</option>
                                        <option value="flight">Flight</option>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="distance">Distance Traveled (km)</Label>
                                    <Input
                                        id="distance"
                                        type="number"
                                        placeholder="e.g. 15"
                                        value={transport.distance}
                                        onChange={(e) => setTransport({ ...transport, distance: e.target.value })}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "food" && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="category">Food Category</Label>
                                    <Select
                                        id="category"
                                        value={food.category}
                                        onChange={(e) => setFood({ ...food, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Select food type...</option>
                                        <option value="beef">Beef</option>
                                        <option value="chicken">Chicken</option>
                                        <option value="dairy">Dairy</option>
                                        <option value="veg">Vegetables</option>
                                        <option value="rice">Rice / Grains</option>
                                    </Select>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-[2]">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            placeholder="Amount"
                                            value={food.quantity}
                                            onChange={(e) => setFood({ ...food, quantity: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="unit">Unit</Label>
                                        <Select
                                            id="unit"
                                            value={food.unit}
                                            onChange={(e) => setFood({ ...food, unit: e.target.value })}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="serving">serving</option>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "energy" && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="kwh">Electricity Usage (kWh)</Label>
                                    <Input
                                        id="kwh"
                                        type="number"
                                        placeholder="e.g. 4.5"
                                        value={energy.kwh}
                                        onChange={(e) => setEnergy({ ...energy, kwh: e.target.value })}
                                        required
                                        min="0"
                                    />
                                    <p className="mt-2 text-xs text-slate-400 italic">Check your smart meter or monthly utility bill for this value.</p>
                                </div>
                            </div>
                        )}

                        <Button type="submit" loading={loading}>
                            Log Activity
                        </Button>
                    </form>

                    {/* Feedback Message */}
                    {message && (
                        <div className={`mt-6 p-3 rounded-lg text-sm font-medium text-center animate-in zoom-in-95 duration-200 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 flex gap-6 text-slate-400 text-xs">
                <span className="flex items-center gap-1">🌱 Sustainable Living</span>
                <span className="flex items-center gap-1">📊 Real-time Analysis</span>
                <span className="flex items-center gap-1">🚀 Fast Tracking</span>
            </div>
        </div>
    );
}
