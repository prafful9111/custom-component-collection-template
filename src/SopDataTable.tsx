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

// Inject styles for animation since tailwind build might not be picking it up
const pulseStyle = `
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
}
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;

const TableSkeleton = () => (
    <div className="w-full bg-slate-50 p-8 font-sans min-h-screen">
        <style>{pulseStyle}</style>
        <div className="max-w-7xl mx-auto animate-pulse">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header Skeleton */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="h-8 w-48 bg-slate-200 rounded"></div>
                    <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {['Record ID', 'Date Evaluated', 'Overall Score', 'Learning Behavior', 'Customer Impact', 'Performance Level', 'Coaching'].map((header, i) => (
                                    <th key={i} className={`p-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${i === 0 ? 'pl-6' : ''}`}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <tr key={i}>
                                    <td className="p-4 pl-6">
                                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                            <div className="h-3 w-16 bg-slate-200 rounded"></div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="h-6 w-16 bg-slate-200 rounded"></div>
                                    </td>
                                    <td className="p-4">
                                        <div className="h-6 w-24 bg-slate-200 rounded"></div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-20 bg-slate-200 rounded"></div>
                                            <div className="h-4 w-4 bg-slate-200 rounded"></div>
                                            <div className="h-4 w-20 bg-slate-200 rounded"></div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-16 bg-slate-200 rounded"></div>
                                            <div className="h-4 w-4 bg-slate-200 rounded"></div>
                                            <div className="h-4 w-16 bg-slate-200 rounded"></div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="h-6 w-20 bg-slate-200 rounded"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
);

const SearchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);

const ArrowUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 15-6-6-6 6" /></svg>
);

const ArrowDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
);

const ChevronsUpDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
);

export const SopDataTable = ({ onSelectRecord }: { onSelectRecord: (id: string) => void }) => {
    const [records, setRecords] = useState<SopRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter & Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof SopRecord | string; direction: 'asc' | 'desc' } | null>(null);


    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/sop?limit=1000`);
                if (!response.ok) throw new Error('Failed to fetch records');

                const result = await response.json();

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

    // Filter and Sort Logic
    const processedRecords = React.useMemo(() => {
        let data = [...records];



        // 2. Global Search
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            data = data.filter(item => {
                // Flatten values to search
                const searchableValues = [
                    item.idx,
                    item.id,
                    item.sop_overall_learning_behavior_status,
                    item.sop_overall_customer_impact_initial_outcome,
                    item.sop_overall_customer_impact_final_outcome,
                    item.sop_overall_initially_before_coaching_level,
                    item.sop_overall_after_coaching_level,
                    item.sop_overall_help_or_coaching_intensity_level,
                    new Date(item.created_at).toLocaleDateString(),
                    item.overallScore
                ].map(v => String(v || '').toLowerCase());

                return searchableValues.some(val => val.includes(query));
            });
        }

        // 3. Sorting
        if (sortConfig) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof SopRecord];
                const bValue = b[sortConfig.key as keyof SopRecord];

                // Handle missing values
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        } else {
            // Default Sort: Newest First
            data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return data;
    }, [records, searchQuery, sortConfig]);


    const handleSort = (key: keyof SopRecord | string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === 'asc' ? { key, direction: 'desc' } : null;
            }
            return { key, direction: 'asc' };
        });
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig?.key === columnKey) {
            return sortConfig.direction === 'asc'
                ? <ArrowUpIcon className="w-4 h-4 text-indigo-600" />
                : <ArrowDownIcon className="w-4 h-4 text-indigo-600" />
        }
        return <ChevronsUpDownIcon className="w-4 h-4 text-slate-300 group-hover/header:text-slate-400 opacity-0 group-hover/header:opacity-100 transition-all" />
    };

    const HeaderCell = ({ label, columnKey, className = "" }: { label: string, columnKey: string, className?: string }) => (
        <th
            className={`p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer group/header hover:bg-slate-50 transition-colors select-none ${className}`}
            onClick={() => handleSort(columnKey)}
        >
            <div className="flex items-center gap-1">
                {label}
                <SortIcon columnKey={columnKey} />
            </div>
        </th>
    );

    if (loading) return <TableSkeleton />;

    if (error) return (
        <div className="flex items-center justify-center py-12 bg-slate-50 text-red-500">
            {error}
        </div>
    );

    return (
        <div className="w-full bg-slate-50 px-12 py-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-6">
                    {/* Header & Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">SOP Evaluation</h2>
                            <p className="text-slate-500 text-sm mt-1">Review and analyze staff performance records</p>
                        </div>
                        {/* Global Search */}
                        <div className="relative w-[200px] ml-auto">
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full transition-all shadow-sm placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-medium">
                            <span>Showing {processedRecords.length} of {records.length} records</span>
                            {sortConfig && (
                                <button onClick={() => setSortConfig(null)} className="text-indigo-600 hover:text-indigo-700 hover:underline">
                                    Clear Sort
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto px-4">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-slate-200">
                                        <HeaderCell label="Record ID" columnKey="idx" className="pl-6" />
                                        <HeaderCell label="Date Evaluated" columnKey="created_at" />
                                        <HeaderCell label="Overall Score" columnKey="overallScore" />
                                        <HeaderCell label="Learning Behavior" columnKey="sop_overall_learning_behavior_status" />
                                        <HeaderCell label="Customer Impact" columnKey="sop_overall_customer_impact_final_outcome" />
                                        <HeaderCell label="Performance Level" columnKey="sop_overall_after_coaching_level" />
                                        <HeaderCell label="Coaching" columnKey="sop_overall_help_or_coaching_intensity_level" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {processedRecords.map((record) => (
                                        <tr
                                            key={record.id}
                                            onClick={() => onSelectRecord(String(record.id))}
                                            className="hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group active:scale-[0.99]"
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
                                                        <span className={`font-medium text-xs ${getPerformanceLevelColor(record.sop_overall_initially_before_coaching_level)}`}>
                                                            {record.sop_overall_initially_before_coaching_level}
                                                        </span>
                                                        <span className="text-slate-400">→</span>
                                                        <span className={`font-medium text-xs ${getPerformanceLevelColor(record.sop_overall_after_coaching_level)}`}>
                                                            {record.sop_overall_after_coaching_level}
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
                                    {processedRecords.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="p-12 text-center text-slate-500 italic">
                                                <div className="flex flex-col items-center gap-2">
                                                    <SearchIcon className="w-8 h-8 text-slate-300" />
                                                    <p>No matching records found.</p>
                                                    <button onClick={() => { setSearchQuery(''); }} className="text-indigo-600 hover:underline text-sm font-medium">
                                                        Clear filters
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
