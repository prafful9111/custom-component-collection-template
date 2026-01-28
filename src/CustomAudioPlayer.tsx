import React, { useState, useRef, useEffect, FC } from 'react';
import styles from './CustomAudioPlayer.module.css';

interface CustomAudioPlayerProps {
    src: string;
    duration?: string;
    onDurationChange?: (duration: number) => void;
}

export const CustomAudioPlayer: FC<CustomAudioPlayerProps> = ({ src, onDurationChange }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    // Toggle speed 1x -> 1.5x -> 2x -> 1x
    const toggleSpeed = () => {
        if (!audioRef.current) return;
        const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
        audioRef.current.playbackRate = nextRate;
        setPlaybackRate(nextRate);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
            if (onDurationChange) {
                onDurationChange(audio.duration);
            }
        }

        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const onEnded = () => setIsPlaying(false);

        // Events
        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', onEnded);
        }
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getBackgroundSize = () => {
        return { backgroundSize: `${(currentTime * 100) / (duration || 1)}% 100%` };
    };

    return (
        <div className={styles.customAudioPlayer}>
            <div className={styles.audioVisualizer}>
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.waveBar} ${styles.waveBar} ${isPlaying ? styles.waveBarActive : ''}`}
                        style={{ animationDelay: `${Math.random() * 1.2}s` }}
                    />
                ))}
            </div>

            <audio ref={audioRef} src={src} />

            {/* Progress Bar Row */}
            <div className={styles.timeSliderContainer}>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className={styles.progressBar}
                    style={getBackgroundSize()}
                />
                <div className={styles.timeDisplay}>
                    <span>{formatTime(currentTime)}</span>
                    <div className={styles.durationSpeedGroup}>
                        <span>{formatTime(duration)}</span>
                        <button className={styles.playbackSpeedButton} onClick={toggleSpeed}>
                            {playbackRate}x
                        </button>
                    </div>
                </div>
            </div>

            {/* Controls Row - Play Center */}
            <div className={styles.controlsBottomRow}>
                <button className={styles.playPauseButton} onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ marginLeft: '3px' }}>
                            <path d="M5 3.868v16.264a1 1 0 001.574.832l12.198-8.132a1 1 0 000-1.664L6.574 3.036A1 1 0 005 3.868z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};
