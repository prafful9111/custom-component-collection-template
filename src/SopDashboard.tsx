/** eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { SopDataTable } from './SopDataTable';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { CallRecordingCard } from './CallRecordingCard';
// import sampleAudio from './audio/sample.mp3';
const sampleAudio = 'https://dcs-spotify.megaphone.fm/WAYW6918246177.mp3?key=c0f202b20175e6b49fa3c7d48ea9d43f&request_event_id=d3f3e2b3-c3cd-4fce-9e7b-2badda8c370b&session_id=b7b62590-fc2a-4faf-be63-8139d7f13491&timetoken=1768052624_F02AA3BD0243CD8475CD6B43118B2615';
import './output.css'; // Utilizing the confirmed working CSS file

// --- Type Definitions ---
interface Window {
    Retool?: {
        subscribe: (callback: (model: any) => void) => () => void;
    };
}

// --- Icon Components (SVG) ---
const AlertTriangleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
);
const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
);
const ChevronUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 15-6-6-6 6" /></svg>
);
const FileTextIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);
const BrainIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>
);
const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
);

// --- Data Parsing Helper ---
const parseTranscriptString = (str: string) => {
    // 1. Try JSON parse first
    try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {
        // Ignore
    }

    // 2. Try Regex for timestamped format: [HH:MM:SS] SPEAKER: Content
    // Example: [17:11:48] USER: Hey there hello
    const timestampPattern = /\[(\d{2}:\d{2}:\d{2})\]\s*([^:]+):/g;
    const matches = [...str.matchAll(timestampPattern)];

    if (matches.length > 0) {
        const result = [];
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const timestamp = match[1];
            let speaker = match[2].trim();

            // Normalize Speaker Names
            if (speaker.toUpperCase() === 'USER') speaker = 'CUSTOMER';

            const start = match.index! + match[0].length;
            const end = i < matches.length - 1 ? matches[i + 1].index : str.length;
            const text = str.substring(start, end).trim();

            if (text) {
                result.push({ time: timestamp, speaker, text });
            }
        }
        return result;
    }

    // 3. Fallback: Split by newlines if it looks like a script
    // AGENT: Hello
    // CUSTOMER: Hi
    const scriptPattern = /^(AGENT|CUSTOMER|USER|SPEAKER \d+):/im;
    if (scriptPattern.test(str)) {
        return str.split('\n').filter(line => line.trim()).map(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const speaker = parts[0].trim();
                const text = parts.slice(1).join(':').trim();
                return { speaker: speaker === 'USER' ? 'CUSTOMER' : speaker, text };
            }
            return { speaker: 'UNKNOWN', text: line };
        });
    }

    return str; // Return original string if no format detected
};

const processDbData = (data: any[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data: expected non-empty array');
    }

    const record = data[0];

    // Safely parse analysis - handle string, object, or missing
    let parsedAnalysis: any = {};
    try {
        if (typeof record?.analysis === 'string') {
            parsedAnalysis = JSON.parse(record.analysis);
        } else if (record?.analysis && typeof record.analysis === 'object') {
            parsedAnalysis = record.analysis;
        }
    } catch (e) {
        console.warn('Failed to parse analysis:', e);
        parsedAnalysis = {};
    }

    // Safe accessor for nested properties with fallback
    const safeGet = (obj: any, path: string, fallback: any = 'N/A') => {
        try {
            return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? fallback;
        } catch {
            return fallback;
        }
    };

    // Safely process transcript
    let processedTranscript = 'No transcript available';
    try {
        if (typeof record?.transcription === 'string') {
            processedTranscript = record.transcription.replace(/^"|"$/g, '');
        } else if (Array.isArray(record?.transcription)) {
            processedTranscript = record.transcription;
        }
    } catch (e) {
        console.warn('Failed to process transcript:', e);
    }

    return {
        staffContext: {
            name: "Rajesh Kumar",
            id: "EMP-4521",
            role: "Senior Sales Executive",
            department: "International Sales",
            tenure: "3.5 Years",
            managerName: "Amit Sharma",
            sopName: "Inbound Lead Conversion SOP",
            sopId: record?.idx ? `ID: ${record.idx}` : "Data Not Available",
            sopVersion: "v4.2",
            callType: "Coaching Call",
            dateTime: record?.created_at ? new Date(record.created_at).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }) : "Data Not Available",
            duration: "6:22",
            callLevel: "High",
            overallScore: record?.overallScore || "N/A",
            status: record?.status || "Data Not Available",
        },
        reportData: {
            SOP_Overall: {
                Initially_Before_Coaching: safeGet(parsedAnalysis, 'SOP_Overall.Initially_Before_Coaching', { level: 'N/A', note: 'Data not available' }),
                After_Coaching: safeGet(parsedAnalysis, 'SOP_Overall.After_Coaching', { level: 'N/A', note: 'Data not available' }),
                Learning_Behavior: safeGet(parsedAnalysis, 'SOP_Overall.Learning_Behavior', { status: 'N/A', note: 'Data not available' }),
                Initial_Communication_And_Clarity: safeGet(parsedAnalysis, 'SOP_Overall.Initial_Communication_And_Clarity', { note: 'Data not available' }),
                Final_Communication_And_Clarity: safeGet(parsedAnalysis, 'SOP_Overall.Final_Communication_And_Clarity', { note: 'Data not available' }),
                Logical_Order_Initial: safeGet(parsedAnalysis, 'SOP_Overall.Logical_Order_Initial', { status: 'N/A', note: 'Data not available' }),
                Logical_Order_Final: safeGet(parsedAnalysis, 'SOP_Overall.Logical_Order_Final', { status: 'N/A', note: 'Data not available' }),
                Customer_Impact_Initial: safeGet(parsedAnalysis, 'SOP_Overall.Customer_Impact_Initial', { outcome: 'N/A', note: 'Data not available' }),
                Customer_Impact_Final: safeGet(parsedAnalysis, 'SOP_Overall.Customer_Impact_Final', { outcome: 'N/A', note: 'Data not available' }),
                Violations_or_Red_Flags: Array.isArray(parsedAnalysis?.SOP_Overall?.Violations_or_Red_Flags)
                    ? parsedAnalysis.SOP_Overall.Violations_or_Red_Flags
                    : [],
                Strengths: Array.isArray(parsedAnalysis?.SOP_Overall?.Strengths)
                    ? parsedAnalysis.SOP_Overall.Strengths
                    : [],
                Weaknesses: Array.isArray(parsedAnalysis?.SOP_Overall?.Weaknesses)
                    ? parsedAnalysis.SOP_Overall.Weaknesses
                    : [],
            },
            SOP_Steps: Array.isArray(parsedAnalysis?.SOP_Steps)
                ? parsedAnalysis.SOP_Steps.map((step: any) => ({
                    ...step,
                    Step_Name: step?.Step_Name || 'Unknown Step',
                    Initial_Status: step?.Initial_Status || 'N/A',
                    Final_Status: step?.Final_Status || 'N/A',
                    Evidence: step?.Evidence || 'No evidence available',
                    AI_Support_Provided: step?.AI_Support_Provided || { summary: 'No support information' },
                    Specifics_Mentioned: Array.isArray(step?.Specifics_Mentioned) ? step.Specifics_Mentioned : [],
                    Note: step?.Note || step?.Notes || step?.Coaching_Note || 'No notes available',
                }))
                : []
        },
        audioUrl: record?.signed_audio_url || null,
        transcript: parseTranscriptString(processedTranscript),
        metadata: {
            idx: record?.idx ?? 'N/A',
            created_at: record?.created_at || new Date().toISOString(),
            updated_at: record?.updated_at || new Date().toISOString()
        }
    };
};

const EMPTY_DATA = {
    staffContext: {
        name: "Data Not Available",
        id: "Data Not Available",
        role: "Data Not Available",
        department: "Data Not Available",
        tenure: "Data Not Available",
        managerName: "Data Not Available",
        sopName: "Data Not Available",
        sopId: "Data Not Available",
        sopVersion: "Data Not Available",
        callType: "Data Not Available",
        dateTime: "Data Not Available",
        duration: "Data Not Available",
        callLevel: "N/A",
        overallScore: "N/A",
        status: "Data Not Available",
    },
    reportData: {
        SOP_Overall: {
            Initially_Before_Coaching: { level: 'N/A', note: 'Data not available' },
            After_Coaching: { level: 'N/A', note: 'Data not available' },
            Learning_Behavior: { status: 'N/A', note: 'Data not available' },
            Initial_Communication_And_Clarity: { note: 'Data not available' },
            Final_Communication_And_Clarity: { note: 'Data not available' },
            Logical_Order_Initial: { status: 'N/A', note: 'Data not available' },
            Logical_Order_Final: { status: 'N/A', note: 'Data not available' },
            Customer_Impact_Initial: { outcome: 'N/A', note: 'Data not available' },
            Customer_Impact_Final: { outcome: 'N/A', note: 'Data not available' },
            Violations_or_Red_Flags: [],
            Strengths: [],
            Weaknesses: [],
        },
        SOP_Steps: []
    },
    audioUrl: null,
    transcript: "No transcript available",
    metadata: {
        idx: 'N/A',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
};

// Production API URL
const API_BASE_URL = 'https://sop-demo-backend.onrender.com';

// Inject styles for animation
const pulseStyle = `
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
}
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;

const DashboardSkeleton = () => (
    <div className="bg-slate-50 font-sans text-slate-800 pb-12 relative min-h-screen">
        <style>{pulseStyle}</style>
        <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-slate-200"></div>
                                <div className="space-y-2">
                                    <div className="h-6 w-48 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-64 bg-slate-200"></div>
                    <div className="lg:col-span-4 space-y-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-64 bg-slate-200"></div>
                </div>
                {/* Bottom Full Width Sections */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-64 bg-slate-200"></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-64 bg-slate-200"></div>
            </div>
        </div>
    </div>
);

export const SopDashboard = () => {
    // View State
    const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('table');

    // Dashboard States
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [expandedRisk, setExpandedRisk] = useState<number | null>(0);
    // const [isPlaying, setIsPlaying] = useState(false); // Managed in custom player

    // Data States
    const [staffContext, setStaffContext] = useState(EMPTY_DATA.staffContext);
    const [reportData, setReportData] = useState(EMPTY_DATA.reportData);
    const [transcript, setTranscript] = useState<any>(EMPTY_DATA.transcript);
    const [metadata, setMetadata] = useState(EMPTY_DATA.metadata);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [realDuration, setRealDuration] = useState<string | null>(null);

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isSopModalOpen, setIsSopModalOpen] = useState(false);

    // Transcript State
    const transcriptRef = React.useRef<HTMLDivElement>(null);
    const [isTranscriptTruncated, setIsTranscriptTruncated] = useState(false);
    const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

    // Check truncation
    useEffect(() => {
        if (transcriptRef.current && !isLoading) {
            const { scrollHeight, clientHeight } = transcriptRef.current;
            setIsTranscriptTruncated(scrollHeight > clientHeight);
        }
    }, [transcript, isLoading]);

    // Fetch Single Record
    const fetchData = async (id: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/api/sop/${id}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('Record not found');
                throw new Error('Failed to fetch data');
            }

            const json = await response.json();
            if (!json) throw new Error('No data returned');

            // Handle wrapped response { data: ... } or direct object
            const responseData = json.data || json;

            // Process data using our helper
            const processed = processDbData(Array.isArray(responseData) ? responseData : [responseData]);

            setStaffContext(processed.staffContext);
            setReportData(processed.reportData);
            setTranscript(processed.transcript);
            setMetadata(processed.metadata);
            setAudioUrl(processed.audioUrl);
            // Reset real duration on new fetch
            setRealDuration(null);

            setViewMode('dashboard');
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    // Initial Load Logic
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sopId = params.get('id');

        if (sopId) {
            fetchData(sopId);
        } else {
            setViewMode('table');
            setIsLoading(false);
        }

        // Retool Integration
        const win = window as unknown as Window;
        if (win.Retool) {
            win.Retool.subscribe((model: any) => {
                if (model?.sopId) fetchData(model.sopId);
            });
        }
    }, []);

    // Navigation Handlers
    const handleSelectRecord = (id: string) => {
        // Update URL
        const newUrl = `${window.location.pathname}?id=${id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        fetchData(id);
    };

    const handleBackToTable = () => {
        // Clear ID from URL
        const newUrl = window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
        setViewMode('table');
        setError(null);
    };

    const handleDurationChange = (durationSeconds: number) => {
        if (!durationSeconds || isNaN(durationSeconds)) return;
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = Math.floor(durationSeconds % 60);
        const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        setRealDuration(formatted);
    };

    // --- Render Views ---

    // 1. Table View


    // Unified Color Helper for Sentiment/Status
    const getSentimentColor = (status: string) => {
        const s = (status || '').toLowerCase().trim();
        // Dark Red (Didn't Know / Incorrect / Strongly Negative)
        if (s.includes("didn't know") || s.includes("incorrect") || s === 'strongly negative')
            return 'bg-red-200 text-red-900 border-red-300';
        // Light Red (Weak / Negative)
        if (s === 'weak' || s === 'negative')
            return 'bg-red-50 text-red-700 border-red-100';
        // Gray/Neutral (Average / Neutral)
        if (s === 'average' || s === 'neutral')
            return 'bg-slate-100 text-slate-600 border-slate-200';
        // Yellow (Good)
        if (s === 'good')
            return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        // Light Green (Positive)
        if (s === 'positive')
            return 'bg-lime-50 text-lime-700 border-lime-100';
        // Green (Strong / Strongly Positive)
        if (s === 'strong' || s === 'strongly positive')
            return 'bg-emerald-100 text-emerald-800 border-emerald-200';

        return 'bg-slate-50 text-slate-500 border-slate-100';
    };

    const hasViolations = reportData.SOP_Overall.Violations_or_Red_Flags && Array.isArray(reportData.SOP_Overall.Violations_or_Red_Flags) && reportData.SOP_Overall.Violations_or_Red_Flags.length > 0;

    // Helper for Dynamic Impact/Order/Communication Coloring
    const getDynamicStatusColor = (text: string, defaultColor: 'blue' | 'yellow' = 'blue') => {
        const t = (text || '').toLowerCase();

        // Red conditions: Out of order, Negative, No improvement, Weak, Incorrect
        if (t.includes('out of order') || t.includes('negative') || t.includes('incorrect') || t.includes('weak') || t.includes('no improvement')) {
            return {
                bg: 'bg-red-50',
                border: 'border-red-100',
                text: 'text-red-900',
                dot: 'bg-red-500',
                title: 'text-red-700'
            };
        }

        // Green conditions: Positive, Strong, Good, Logical
        if (t.includes('positive') || t.includes('strong') || t.includes('good') || t.includes('logical')) {
            return {
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                text: 'text-emerald-900',
                dot: 'bg-emerald-500',
                title: 'text-emerald-700'
            };
        }

        // Default Fallback (Blue or Yellow)
        if (defaultColor === 'yellow') {
            return {
                bg: 'bg-yellow-50',
                border: 'border-yellow-100',
                text: 'text-yellow-900',
                dot: 'bg-yellow-400',
                title: 'text-yellow-700'
            };
        }

        return {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-900',
            dot: 'bg-blue-400',
            title: 'text-blue-700'
        };
    };

    const initialImpactColor = getDynamicStatusColor(reportData.SOP_Overall.Customer_Impact_Initial.outcome, 'blue');
    const finalImpactColor = getDynamicStatusColor(reportData.SOP_Overall.Customer_Impact_Final.outcome, 'blue');

    const initialCommColor = getDynamicStatusColor(reportData.SOP_Overall.Initial_Communication_And_Clarity.note, 'blue');
    const finalCommColor = getDynamicStatusColor(reportData.SOP_Overall.Final_Communication_And_Clarity.note, 'blue');

    const initialOrderColor = getDynamicStatusColor(reportData.SOP_Overall.Logical_Order_Initial.status, 'yellow');
    const finalOrderColor = getDynamicStatusColor(reportData.SOP_Overall.Logical_Order_Final.status, 'blue');

    return (
        <>
            {/* Table View - Always mounted, hidden when in dashboard mode */}
            <div style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
                <SopDataTable onSelectRecord={(id) => fetchData(id)} />
            </div>

            {/* Dashboard View - Only visible in dashboard mode */}
            <div
                style={{ display: viewMode === 'dashboard' ? 'block' : 'none' }}
                className="bg-slate-50 font-sans text-slate-800 pb-12 relative min-h-screen"
            >
                {isLoading && viewMode === 'dashboard' ? (
                    <DashboardSkeleton />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                            <AlertTriangleIcon className="w-8 h-8 mx-auto mb-2" />
                            <h3 className="text-lg font-bold">Error Loading Data</h3>
                            <p>{error}</p>
                        </div>
                        <button onClick={handleBackToTable} className="text-indigo-600 hover:underline">
                            Return to Table
                        </button>
                    </div>
                ) : (
                    // --- Main Dashboard Content ---
                    <div className="bg-slate-50 font-sans text-slate-800 pb-12 relative">


                        {/* --- Top Navigation / Header (Context) --- */}
                        <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                            <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        {/* Back Button */}
                                        <button
                                            onClick={handleBackToTable}
                                            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                            title="Back to Record List"
                                        >
                                            <ArrowLeftIcon className="w-6 h-6" />
                                        </button>

                                        {/* Staff Info */}
                                        <div className="relative group">
                                            {staffContext && (
                                                <>
                                                    <div
                                                        className="flex items-center gap-4 p-2 bg-transparent rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                                        onClick={() => setIsStaffModalOpen(!isStaffModalOpen)}
                                                    >
                                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <UserIcon className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <h1 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                                                {staffContext.name}
                                                            </h1>
                                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                                <span className="flex items-center gap-1"><FileTextIcon className="h-3 w-3" /> {staffContext.id}</span>
                                                                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                                                <span>{staffContext.role}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Staff Details Popover */}
                                                    {isStaffModalOpen && (
                                                        <div className="absolute top-full left-0 mt-2 z-50 w-[400px] bg-white rounded-xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                                                                <h3 className="font-bold text-slate-800">Staff Profile</h3>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setIsStaffModalOpen(false); }}
                                                                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                                </button>
                                                            </div>
                                                            <div className="p-5 space-y-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                                        <UserIcon className="h-8 w-8" />
                                                                    </div>
                                                                    <div>
                                                                        <h2 className="text-lg font-bold text-slate-900 leading-tight">{staffContext.name}</h2>
                                                                        <p className="text-sm text-slate-500">{staffContext.role}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                                    <div className="p-2.5 bg-slate-50 rounded-lg">
                                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">ID</p>
                                                                        <p className="font-mono text-slate-700">{staffContext.id}</p>
                                                                    </div>
                                                                    <div className="p-2.5 bg-slate-50 rounded-lg">
                                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Dept</p>
                                                                        <p className="font-medium text-slate-700 truncate" title={staffContext.department}>{staffContext.department}</p>
                                                                    </div>
                                                                    <div className="p-2.5 bg-slate-50 rounded-lg">
                                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Tenure</p>
                                                                        <p className="font-medium text-slate-700">{staffContext.tenure}</p>
                                                                    </div>
                                                                    <div className="p-2.5 bg-slate-50 rounded-lg">
                                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Manager</p>
                                                                        <p className="font-medium text-slate-700 truncate" title={staffContext.managerName}>{staffContext.managerName}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <div className="relative">
                                            {staffContext && (
                                                <>
                                                    <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                                        <div className="relative">
                                                            <div
                                                                className="flex items-center gap-1.5 font-medium text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
                                                                onClick={() => setIsSopModalOpen(!isSopModalOpen)}
                                                            >
                                                                <BrainIcon className="h-4 w-4 text-indigo-500" />
                                                                {staffContext.sopName}
                                                            </div>
                                                            {/* SOP Details Popover - Anchored to Name */}
                                                            {isSopModalOpen && (
                                                                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-left" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
                                                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                                                                        <h3 className="font-bold text-slate-800">SOP Details</h3>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setIsSopModalOpen(false); }}
                                                                            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded transition-colors"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                                        </button>
                                                                    </div>
                                                                    <div className="p-5 space-y-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                                                                <BrainIcon className="h-6 w-6" />
                                                                            </div>
                                                                            <div>
                                                                                <h2 className="text-base font-bold text-slate-900 leading-tight">{staffContext.sopName}</h2>
                                                                                <span className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-100">
                                                                                    Active Version
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-2 text-xs">
                                                                            <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-100">
                                                                                <span className="text-slate-500">SOP ID</span>
                                                                                <span className="font-mono text-slate-700 font-medium">{staffContext.sopId}</span>
                                                                            </div>
                                                                            <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-100">
                                                                                <span className="text-slate-500">Version</span>
                                                                                <span className="font-mono text-slate-700 font-medium">{staffContext.sopVersion}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                                                            <h4 className="text-[10px] font-bold text-indigo-800 uppercase mb-1">Description</h4>
                                                                            <p className="text-xs text-indigo-700 leading-relaxed">
                                                                                Standard Operating Procedure for handling inbound leads and converting them into sales opportunities.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="h-4 w-px bg-slate-300"></span>
                                                        <span className="flex items-center gap-1.5" title="Date of Call">
                                                            <CalendarIcon className="h-3.5 w-3.5 text-slate-400" /> {staffContext.dateTime}
                                                        </span>
                                                        <span className="h-4 w-px bg-slate-300"></span>
                                                        <span className="flex items-center gap-1.5 font-medium text-slate-700" title="Duration">
                                                            <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                                                            <span>{realDuration || staffContext.duration}</span>
                                                        </span>

                                                    </div>


                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                            {/* TOP SECTION: Grid Layout for Summary & Audio (Moved from Left Column) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* LEFT: Evaluation Summary & Violations */}
                                <div className="lg:col-span-8 space-y-8">
                                    {/* 1. At-a-Glance Diagnosis Map */}
                                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-[420px] flex flex-col">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                Evaluate Summary
                                            </h2>
                                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100 shadow-sm">
                                                Final Score: {staffContext.overallScore}/100
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                                            {/* 1. Overall Growth */}
                                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow overflow-y-auto">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                                            <TrendingUpIcon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overall Growth</h3>
                                                            <p className="text-xs text-slate-400 font-medium mt-0.5">Performance Trajectory</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 flex-1">
                                                    {/* Initial State */}
                                                    <div className="relative pl-4 border-l-2 border-slate-200">
                                                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Starting Point</p>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${getSentimentColor(reportData.SOP_Overall.Initially_Before_Coaching.level)}`}>
                                                                {reportData.SOP_Overall.Initially_Before_Coaching.level}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 line-clamp-2 italic">
                                                            "{reportData.SOP_Overall.Initially_Before_Coaching.note}"
                                                        </p>
                                                    </div>

                                                    {/* Final State */}
                                                    <div className="relative pl-4 border-l-2 border-emerald-400">
                                                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                                                        <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Current Status</p>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${getSentimentColor(reportData.SOP_Overall.After_Coaching.level)}`}>
                                                                {reportData.SOP_Overall.After_Coaching.level}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                                            {reportData.SOP_Overall.After_Coaching.note}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Coachability */}
                                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow overflow-y-auto">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                                            <BrainIcon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Coachability</h3>
                                                            <p className="text-xs text-slate-400 font-medium mt-0.5">Receptiveness & Adaptability</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex flex-col gap-4">
                                                    <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Observed Behavior</p>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <CheckCircleIcon className="w-5 h-5 text-indigo-500" />
                                                            <span className="text-indigo-900 font-bold text-lg leading-none">{reportData.SOP_Overall.Learning_Behavior.status}</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Coach's Observation</p>
                                                        <p className="text-sm text-slate-600 leading-7">
                                                            {reportData.SOP_Overall.Learning_Behavior.note}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Violations & Red Flags */}
                                    {reportData.SOP_Overall.Violations_or_Red_Flags && Array.isArray(reportData.SOP_Overall.Violations_or_Red_Flags) && reportData.SOP_Overall.Violations_or_Red_Flags.length > 0 && (
                                        <section className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                                            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
                                                <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                                                <h2 className="text-lg font-bold text-red-900">Violations & Red Flags</h2>
                                            </div>
                                            <div className="p-0">
                                                {reportData.SOP_Overall.Violations_or_Red_Flags.map((risk: any, idx: number) => (
                                                    <div key={idx} className={`border-b border-slate-100 last:border-0`}>
                                                        <button
                                                            onClick={() => setExpandedRisk(expandedRisk === idx ? null : idx)}
                                                            className="w-full text-left p-4 flex justify-between items-start gap-4 hover:bg-slate-50 transition-colors group"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                        ${risk.severity === 'High' ? 'bg-red-600 text-white' : risk.severity === 'Medium' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'}`}>
                                                                        {risk.severity} SEVERITY
                                                                    </span>
                                                                </div>
                                                                <h3 className="font-semibold text-slate-900 group-hover:text-red-700 transition-colors">{risk.description}</h3>
                                                            </div>
                                                            <div className="mt-1">
                                                                {expandedRisk === idx ?
                                                                    <ChevronUpIcon className="w-5 h-5 text-slate-400 group-hover:text-red-500" /> :
                                                                    <ChevronDownIcon className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                                                                }
                                                            </div>
                                                        </button>

                                                        {/* Expandable Evidence Area */}
                                                        {expandedRisk === idx && (
                                                            <div className="bg-slate-50 p-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                                                <div className="bg-white border-l-4 border-red-400 p-4 rounded-r-md shadow-sm">
                                                                    <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Evidence from Transcript</h4>
                                                                    <p className="text-slate-700 italic leading-relaxed">"{risk.evidence}"</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* RIGHT: Audio & Transcript & Actions (Sticky) */}
                                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 lg:self-start">
                                    {/* 1. Audio & Transcript */}
                                    <CallRecordingCard
                                        duration={realDuration || staffContext.duration}
                                        audioSrc={audioUrl || sampleAudio}
                                        transcript={transcript}
                                        onDurationChange={handleDurationChange}
                                        className="w-full"
                                        style={{ height: '420px' }}
                                    />

                                    {/* 2. Manager Action / Strengths (SIDEBAR VERSION - Show only if violations exist) */}
                                    {hasViolations && (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                            <h3 className="font-bold text-slate-800 mb-5">Summary & Actions</h3>

                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-xs font-bold text-green-700 uppercase mb-3 flex items-center gap-2">
                                                        <CheckCircleIcon className="w-4 h-4" /> Top Strengths
                                                    </h4>
                                                    <ul className="text-sm text-slate-600 space-y-2 pl-2">
                                                        {reportData.SOP_Overall.Strengths && Array.isArray(reportData.SOP_Overall.Strengths) && reportData.SOP_Overall.Strengths.length > 0 ? reportData.SOP_Overall.Strengths.map((s: any, i: number) => (
                                                            <li key={i} className="flex gap-2 items-start">
                                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                                                                <span className="leading-snug">{s}</span>
                                                            </li>
                                                        )) : (
                                                            <li className="text-slate-400 italic">No strengths data available</li>
                                                        )}
                                                    </ul>
                                                </div>

                                                <div className="pt-6 border-t border-slate-100">
                                                    <h4 className="text-xs font-bold text-amber-700 uppercase mb-3 flex items-center gap-2">
                                                        <AlertTriangleIcon className="w-4 h-4" /> Areas for Improvement
                                                    </h4>
                                                    <ul className="text-sm text-slate-600 space-y-2 pl-2">
                                                        {reportData.SOP_Overall.Weaknesses && Array.isArray(reportData.SOP_Overall.Weaknesses) && reportData.SOP_Overall.Weaknesses.length > 0 ? reportData.SOP_Overall.Weaknesses.map((s: any, i: number) => (
                                                            <li key={i} className="flex gap-2 items-start">
                                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                                                                <span className="leading-snug">{s}</span>
                                                            </li>
                                                        )) : (
                                                            <li className="text-slate-400 italic">No weaknesses data available</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* MIDDLE SECTION: Summary & Actions (FULL WIDTH - Show only if NO violations) */}
                            {!hasViolations && (
                                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="font-bold text-slate-800 mb-6">Summary & Actions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Strengths */}
                                        <div className="bg-green-50/50 rounded-xl p-6 border border-green-100">
                                            <h4 className="text-xs font-bold text-green-700 uppercase mb-4 flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5" /> Top Strengths
                                            </h4>
                                            <ul className="text-sm text-slate-700 space-y-3">
                                                {reportData.SOP_Overall.Strengths && Array.isArray(reportData.SOP_Overall.Strengths) && reportData.SOP_Overall.Strengths.length > 0 ? reportData.SOP_Overall.Strengths.map((s: any, i: number) => (
                                                    <li key={i} className="flex gap-3 items-start p-2 hover:bg-white rounded-lg transition-colors">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 shadow-sm"></span>
                                                        <span className="leading-relaxed font-medium">{s}</span>
                                                    </li>
                                                )) : (
                                                    <li className="text-slate-400 italic">No strengths data available</li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Weaknesses */}
                                        <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100">
                                            <h4 className="text-xs font-bold text-amber-700 uppercase mb-4 flex items-center gap-2">
                                                <AlertTriangleIcon className="w-5 h-5" /> Areas for Improvement
                                            </h4>
                                            <ul className="text-sm text-slate-700 space-y-3">
                                                {reportData.SOP_Overall.Weaknesses && Array.isArray(reportData.SOP_Overall.Weaknesses) && reportData.SOP_Overall.Weaknesses.length > 0 ? reportData.SOP_Overall.Weaknesses.map((s: any, i: number) => (
                                                    <li key={i} className="flex gap-3 items-start p-2 hover:bg-white rounded-lg transition-colors">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 shadow-sm"></span>
                                                        <span className="leading-relaxed font-medium">{s}</span>
                                                    </li>
                                                )) : (
                                                    <li className="text-slate-400 italic">No weaknesses data available</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* BOTTOM SECTION: Full Width Modules */}

                            {/* Coaching Impact & Transformation (Now Full Width) */}
                            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center gap-2 mb-8">
                                    <TrendingUpIcon className="w-6 h-6 text-orange-500" />
                                    <h2 className="text-lg font-bold text-slate-900">Coaching Impact & Transformation</h2>
                                </div>

                                <div className="space-y-8">
                                    {/* 1. Customer Impact */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Initial */}
                                        <div className="flex flex-col">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${initialImpactColor.dot}`}></span> Customer Impact (Initial)
                                            </h3>
                                            <div className={`${initialImpactColor.bg} border ${initialImpactColor.border} rounded-lg p-5 flex-1 shadow-sm hover:shadow-md transition-shadow`}>
                                                <strong className={`block ${initialImpactColor.title} text-sm mb-2 italic`}>{reportData.SOP_Overall.Customer_Impact_Initial.outcome}</strong>
                                                <p className="text-slate-600 italic text-sm leading-relaxed">
                                                    "{reportData.SOP_Overall.Customer_Impact_Initial.note}"
                                                </p>
                                            </div>
                                        </div>
                                        {/* Final */}
                                        <div className="flex flex-col">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${finalImpactColor.dot}`}></span> Customer Impact (Final)
                                            </h3>
                                            <div className={`${finalImpactColor.bg} border ${finalImpactColor.border} rounded-lg p-5 flex-1 shadow-sm hover:shadow-md transition-shadow`}>
                                                <strong className={`block ${finalImpactColor.title} text-sm mb-2 italic`}>{reportData.SOP_Overall.Customer_Impact_Final.outcome}</strong>
                                                <p className="text-slate-700 text-sm leading-relaxed italic">
                                                    "{reportData.SOP_Overall.Customer_Impact_Final.note}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Communication */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Initial */}
                                        <div className="flex flex-col">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${initialCommColor.dot}`}></span> Initial Communication
                                            </h3>
                                            <div className={`${initialCommColor.bg} border ${initialCommColor.border} rounded-lg p-5 flex-1 shadow-sm hover:shadow-md transition-shadow`}>
                                                <p className="text-slate-600 italic text-sm leading-relaxed">
                                                    {reportData.SOP_Overall.Initial_Communication_And_Clarity.note}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Final */}
                                        <div className="flex flex-col">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${finalCommColor.dot}`}></span> Final Communication
                                            </h3>
                                            <div className={`${finalCommColor.bg} border ${finalCommColor.border} rounded-lg p-5 flex-1 shadow-sm hover:shadow-md transition-shadow`}>
                                                <p className="text-slate-700 text-sm leading-relaxed italic">
                                                    {reportData.SOP_Overall.Final_Communication_And_Clarity.note}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Order (Fixed Visibility) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Initial */}
                                        <div className="flex flex-col">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${initialOrderColor.dot}`}></span> Initial Order
                                            </h4>
                                            <div className={`${initialOrderColor.bg} border ${initialOrderColor.border} rounded-lg p-5 flex-1 shadow-sm hover:shadow-md transition-shadow`}>
                                                <strong className={`block ${initialOrderColor.title} text-sm mb-2 italic`}>{reportData.SOP_Overall.Logical_Order_Initial.status}</strong>
                                                <p className="text-slate-600 text-sm opacity-90 leading-relaxed italic">
                                                    {reportData.SOP_Overall.Logical_Order_Initial.note}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Final */}
                                        <div className="flex flex-col">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${finalOrderColor.dot}`}></span> Final Order
                                            </h4>
                                            <div className={`${finalOrderColor.bg} border ${finalOrderColor.border} rounded-lg p-5 flex-1 shadow-sm hover:shadow-md transition-shadow`}>
                                                <strong className={`block ${finalOrderColor.title} text-sm mb-2 italic`}>{reportData.SOP_Overall.Logical_Order_Final.status}</strong>
                                                <p className="text-slate-600 text-sm opacity-90 leading-relaxed italic">
                                                    {reportData.SOP_Overall.Logical_Order_Final.note}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </section>

                            {/* SOP Step Breakdown (Now Full Width) */}
                            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">SOP Step Breakdown</h2>
                                    <div className="text-sm text-slate-500 flex gap-4">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Weak</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Avg</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Strong</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {reportData.SOP_Steps && Array.isArray(reportData.SOP_Steps) && reportData.SOP_Steps.length > 0 ? reportData.SOP_Steps.map((step: any, idx: number) => (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                                            {/* Step Header */}
                                            <button
                                                onClick={() => activeStep === idx ? setActiveStep(null) : setActiveStep(idx)}
                                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                        ${getSentimentColor(step.Final_Status)}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-semibold text-slate-900">{step.Step_Name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-xs px-2 py-0.5 rounded border ${getSentimentColor(step.Initial_Status)}`}>
                                                                Initial: {step.Initial_Status}
                                                            </span>
                                                            <span className="text-slate-300 text-xs">→</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded border ${getSentimentColor(step.Final_Status)}`}>
                                                                Final: {step.Final_Status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-slate-400">
                                                    {activeStep === idx ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                                </div>
                                            </button>

                                            {/* Expanded Details */}
                                            {activeStep === idx && (
                                                <div className="bg-slate-50 border-t border-slate-100 p-6 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Evidence Quote</h4>
                                                            <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-700 italic text-sm border-l-4 border-l-slate-300 shadow-sm leading-relaxed">
                                                                "{step.Evidence}"
                                                            </div>
                                                            <div className="mt-4">
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Coach's Note</h4>
                                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 text-sm leading-relaxed">
                                                                    {step.Note}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">AI Coaching Intervention</h4>
                                                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-indigo-900 text-sm shadow-sm">
                                                                <div className="flex items-start gap-3">
                                                                    <BrainIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-600" />
                                                                    <span className="leading-relaxed">{step.AI_Support_Provided?.summary || 'No support information'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-4">
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Key Specifics</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {step.Specifics_Mentioned && Array.isArray(step.Specifics_Mentioned) && step.Specifics_Mentioned.map((s: any, i: number) => (
                                                                        <span key={i} className="text-xs bg-white px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 shadow-sm font-medium">{s}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
                                            <p className="text-slate-400 italic">No SOP step data available for this record</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div >
        </>
    );
}
