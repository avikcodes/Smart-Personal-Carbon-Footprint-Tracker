"use client";

import React, { useState, useEffect } from "react";
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// --- Types ---

interface Badge {
    id: string;
    name: string;
    description: string;
}

interface DemoResponse {
    transport_emission: number;
    food_emission: number;
    energy_emission: number;
    total_emission: number;
    daily_score: number;
    badges: Badge[];
    recommendation_prompt: string;
}

// --- Components ---

const Card = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${className}`}>
        <h3 className="text-lg font-semibold text-slate-800 mb-6">{title}</h3>
        {children}
    </div>
);

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="text-slate-500 font-medium">Analyzing your impact...</p>
    </div>
);

export default function DashboardPage() {
    const [data, setData] = useState<DemoResponse | null>(null);
    const [ecoScore, setEcoScore] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Read from localStorage
                const stored = localStorage.getItem("lastActivityPayload");
                const payload = stored ? JSON.parse(stored) : {
                    transport_mode: "train",
                    distance: 50.0,
                    food_type: "vegetables",
                    food_quantity: 2.0,
                    energy_kwh: 5.0
                };

                const response = await fetch("http://localhost:8000/api/demo-run", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error("Failed to fetch dashboard data");

                const result = await response.json();
                setData(result);
                setEcoScore(result.daily_score);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
            <LoadingSpinner />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center max-w-md">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
                <p className="text-slate-500 mb-6">{error}. Make sure your FastAPI backend is running on port 8000.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );

    if (!data) return null;

    // Transform dynamic data for charts
    const categoryChartData = [
        { name: "Transport", value: data.transport_emission, color: "#10b981" },
        { name: "Food", value: data.food_emission, color: "#f59e0b" },
        { name: "Energy", value: data.energy_emission, color: "#3b82f6" },
    ];

    // Dummy trend for visualization (API returns current snapshot)
    const weeklyTrendData = [
        { day: "Mon", kg: 12.5 },
        { day: "Tue", kg: 15.2 },
        { day: "Wed", kg: 8.4 },
        { day: "Thu", kg: 22.1 },
        { day: "Fri", kg: 14.8 },
        { day: "Sat", kg: 5.2 },
        { day: "Today", kg: data.total_emission },
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-10 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-slate-900">Your Sustainability Dashboard</h1>
                    <p className="mt-2 text-slate-500">Real-time insights powered by your activity logs.</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Card 1: Carbon by Category (Pie Chart) */}
                    <Card title="Carbon by Category" className="lg:col-span-1">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="mt-4 text-xs text-center text-slate-400 italic">Values shown in kg CO2e</p>
                    </Card>

                    {/* Card 2: Weekly Trend (Line Chart) */}
                    <Card title="Weekly Carbon Trend" className="lg:col-span-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="kg"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="mt-4 text-xs text-center text-slate-400 italic">Trend over the last 7 active days</p>
                    </Card>
                </div>

                {/* Card 3 & 4: Score and Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-lg shadow-emerald-200/50 flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-emerald-100 font-medium mb-1">Eco Score</p>
                                <h2 className="text-6xl font-extrabold">{ecoScore}</h2>
                                <p className="mt-2 text-emerald-50 text-sm opacity-80">
                                    {data.badges.length > 0 ? `Earned ${data.badges.length} badges today!` : "Keep logging to earn badges!"}
                                </p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                                <span className="text-2xl">🌱</span>
                            </div>
                        </div>
                        <div className="mt-8 h-2 w-full bg-emerald-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-1000"
                                style={{ width: `${ecoScore}%` }}
                            />
                        </div>
                        {data.badges.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {data.badges.map(badge => (
                                    <span key={badge.id} className="bg-white/10 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">
                                        🏆 {badge.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <Card title="Impact Summary">
                        <div className="flex items-center gap-6 mb-2">
                            <div className="text-4xl font-bold text-slate-900">{data.total_emission.toFixed(1)}</div>
                            <div className="text-sm text-slate-500 font-medium">kg CO2e logged<br />in this demo run</div>
                        </div>
                        <div className="h-px w-full bg-slate-100 my-6" />
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-tight">AI Recommendation Preview</h4>
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                                {data.recommendation_prompt.split('\n')[0]}...
                            </p>
                            <button className="text-emerald-600 text-sm font-bold hover:underline">View Full Analysis →</button>
                        </div>
                    </Card>

                </div>

                {/* Footer info */}
                <div className="mt-12 text-center text-slate-400 text-sm">
                    Built with precision for the Carbon Hackathon 2026.
                </div>

            </div>
        </div>
    );
}
