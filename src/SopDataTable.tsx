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
}

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
                        <h2 className="text-xl font-bold text-slate-900">SOP Evaluation Records</h2>
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{records.length} Records</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">Record ID</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Evaluated</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Score</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.map((record) => (
                                    <tr
                                        key={record.id}
                                        onClick={() => onSelectRecord(String(record.id))}
                                        className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-4 pl-6 text-sm font-mono text-slate-600 font-medium border-l-4 border-transparent group-hover:border-indigo-500">
                                            {record.idx || record.id}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            <span className="text-slate-400 text-xs ml-2">
                                                {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {record.overallScore !== undefined ? (
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${record.overallScore >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    record.overallScore >= 60 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                        'bg-red-100 text-red-700 border-red-200'
                                                    }`}>
                                                    {record.overallScore}/100
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button
                                                className="text-indigo-600 group-hover:bg-indigo-100 p-2 rounded-lg transition-all opacity-80 group-hover:opacity-100"
                                                title="View Details"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-slate-500 italic">
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
