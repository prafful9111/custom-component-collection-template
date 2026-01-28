import React, { useState, useRef } from 'react';
import { CustomAudioPlayer } from './CustomAudioPlayer';

interface TranscriptLine {
    time?: string;
    speaker: string;
    text: string;
}

interface CallRecordingCardProps {
    duration: string;
    audioSrc: string;
    transcript: TranscriptLine[] | string;
    className?: string; // Allow parent to control height/width/margins
    style?: React.CSSProperties;
    onDurationChange?: (duration: number) => void;
}

export const CallRecordingCard: React.FC<CallRecordingCardProps> = ({
    duration,
    audioSrc,
    transcript,
    className = '',
    style,
    onDurationChange
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const transcriptRef = useRef<HTMLDivElement>(null);

    return (
        <div
            style={isExpanded ? { ...style, height: 'auto' } : style}
            className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${className}`}
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-slate-800">Call Recording</h3>
                <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    {duration}
                </span>
            </div>

            {/* Audio Player Section */}
            <div className="flex-shrink-0">
                <CustomAudioPlayer src={audioSrc} onDurationChange={onDurationChange} />
            </div>

            {/* Transcript Section - Fills remaining vertical space */}
            <div
                ref={transcriptRef}
                className="p-4 space-y-4 bg-slate-50/50 flex-1 overflow-y-auto min-h-0"
            >
                {Array.isArray(transcript) ? (
                    transcript.map((line, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <span className={`font-bold text-xs uppercase tracking-wider ${(line.speaker || '').toLowerCase() === 'agent' ? 'text-indigo-600' :
                                (line.speaker || '').toLowerCase().includes('customer') || (line.speaker || '').toLowerCase() === 'user' ? 'text-emerald-600' :
                                    'text-slate-500'
                                }`}>
                                {line.speaker === 'USER' ? 'CUSTOMER' : line.speaker}
                            </span>
                            <p className="text-slate-800 text-sm leading-relaxed">
                                {line.text}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {transcript}
                    </div>
                )}
            </div>

            {/* Footer - Toggle Button */}
            <div className="text-center pt-2 pb-2 border-t border-slate-100 bg-white flex-shrink-0">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-indigo-600 font-bold hover:underline uppercase tracking-wide"
                >
                    {isExpanded ? 'Collapse Transcript' : 'View Full Transcript'}
                </button>
            </div>
        </div>
    );
};
