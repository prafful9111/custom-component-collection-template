import React, { useState, useEffect } from 'react';
import './output.css';

// Icon Components
const EyeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);

const API_BASE_URL = 'https://sop-demo-backend.onrender.com';

interface SopRecord {
    id: string | number;
    idx?: string;
    created_at: string;
    overallScore?: number;
    sop_overall_learning_behavior_status?: string;
    sop_overall_customer_impact_initial_outcome?: string;
    sop_overall_customer_impact_final_outcome?: string;
    sop_overall_initially_before_coaching_level?: string;
    sop_overall_after_coaching_level?: string;
    sop_overall_violations_or_red_flags?: any[];
    sop_overall_help_or_coaching_intensity_level?: string;
}

// Helper functions for color coding
const getLearningBehaviorColor = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('receptive') || s.includes('engaged') || s.includes('proactive')) {
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (s.includes('disinterested') || s.includes('resistant')) {
        return 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200';
};

const getImpactColor = (outcome?: string) => {
    const o = (outcome || '').toLowerCase();
    // Check negative first (including "Strongly Negative")
    if (o.includes('negative')) {
        return 'text-red-700';
    }
    // Then check positive (including "Strongly Positive")
    if (o.includes('positive')) {
        return 'text-emerald-700';
    }
    return 'text-slate-600';
};

const getPerformanceLevelColor = (level?: string) => {
    const l = (level || '').toLowerCase();
    if (l.includes('strong') || l.includes('excellent')) {
        return 'text-emerald-700';
    }
    if (l.includes('weak') || l.includes('incorrect') || l.includes("didn't know")) {
        return 'text-red-700';
    }
    if (l.includes('good') || l.includes('average')) {
        return 'text-amber-700';
    }
    return 'text-slate-600';
};

const getViolationColor = (count: number) => {
    if (count === 0) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (count <= 2) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
};

const getCoachingColor = (level?: string) => {
    const l = (level || '').toLowerCase();
    if (l.includes('none') || l.includes('minimal')) {
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (l.includes('high') || l.includes('intensive')) {
        return 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-amber-100 text-amber-700 border-amber-200';
};

export const SopDataTable = ({ onSelectRecord }: { onSelectRecord: (id: string) => void }) => {
    const [records, setRecords] = useState<SopRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/sop`);
                if (!response.ok) throw new Error('Failed to fetch records');

                const result = await response.json();
                console.log('API Response:', result);

                // Handle both direct array and wrapped { data: [...] } formats
                const recordsData = Array.isArray(result) ? result : (Array.isArray(result.data) ? result.data : []);
                setRecords(recordsData);
            } catch (err) {
                console.error("Error fetching SOP records:", err);
                setError("Failed to load records.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
            <span className="loading-spinner">Loading records...</span>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 text-red-500">
            {error}
        </div>
    );

    return (
        <div className="w-full bg-slate-50 min-h-screen p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900">SOP Evaluation s</h2>
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{records.length} Records</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">Record ID</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Evaluated</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Score</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Learning Behavior</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Impact</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Performance Level</th>

                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Coaching</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.map((record) => (
                                    <tr
                                        key={record.id}
                                        onClick={() => onSelectRecord(String(record.id))}
                                        className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group hover:shadow-md hover:shadow-indigo-100 active:scale-[0.99] active:bg-indigo-100"
                                    >
                                        <td className="p-4 pl-6 text-sm font-mono text-slate-600 font-medium border-l-4 border-transparent group-hover:border-indigo-500 group-hover:bg-indigo-50/50 transition-all duration-200 group-hover:text-indigo-900">
                                            {record.idx || record.id}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-1 whitespace-nowrap">
                                                <span>{new Date(record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                <span className="text-slate-400 text-xs">
                                                    {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {record.overallScore !== undefined ? (
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all duration-200 hover:scale-105 hover:shadow-md ${record.overallScore >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' :
                                                    record.overallScore >= 60 ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' :
                                                        'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                                                    }`}>
                                                    {record.overallScore}/100
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        {/* Learning Behavior */}
                                        <td className="p-4">
                                            {record.sop_overall_learning_behavior_status ? (
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all duration-200 hover:scale-105 hover:shadow-md ${getLearningBehaviorColor(record.sop_overall_learning_behavior_status)}`}>
                                                    {record.sop_overall_learning_behavior_status}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        {/* Customer Impact */}
                                        <td className="p-4 text-sm">
                                            {record.sop_overall_customer_impact_initial_outcome && record.sop_overall_customer_impact_final_outcome ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-semibold text-xs ${getImpactColor(record.sop_overall_customer_impact_initial_outcome)}`}>
                                                        {record.sop_overall_customer_impact_initial_outcome}
                                                    </span>
                                                    <span className="text-slate-400">→</span>
                                                    <span className={`font-semibold text-xs ${getImpactColor(record.sop_overall_customer_impact_final_outcome)}`}>
                                                        {record.sop_overall_customer_impact_final_outcome}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        {/* Performance Level */}
                                        <td className="p-4 text-sm">
                                            {record.sop_overall_initially_before_coaching_level && record.sop_overall_after_coaching_level ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-medium ${getPerformanceLevelColor(record.sop_overall_initially_before_coaching_level)}`}>
                                                        {record.sop_overall_initially_before_coaching_level.split(' ')[0]}
                                                    </span>
                                                    <span className="text-slate-400">→</span>
                                                    <span className={`font-medium ${getPerformanceLevelColor(record.sop_overall_after_coaching_level)}`}>
                                                        {record.sop_overall_after_coaching_level.split(' ')[0]}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">N/A</span>
                                            )}
                                        </td>

                                        {/* Coaching Intensity */}
                                        <td className="p-4">
                                            {record.sop_overall_help_or_coaching_intensity_level ? (
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all duration-200 hover:scale-105 hover:shadow-md ${getCoachingColor(record.sop_overall_help_or_coaching_intensity_level)}`}>
                                                    {record.sop_overall_help_or_coaching_intensity_level}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">N/A</span>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="p-12 text-center text-slate-500 italic">
                                            No records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
