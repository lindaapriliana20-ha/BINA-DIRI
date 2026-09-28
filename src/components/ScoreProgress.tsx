import React, { useEffect, useState } from 'react';
import { Star, Trophy, Sparkles, PlayCircle, PauseCircle, CheckCircle2 } from 'lucide-react';
import { playStarSound } from '../utils/audio';

interface ScoreProgressProps {
  score: number; // Overall session score 0 to 100
  stepProgress: number; // Current step score 0 to 100
  isAccurate: boolean; // Whether sensor is currently running or stopped
  currentStepIndex: number;
  totalSteps: number;
}

export const ScoreProgress: React.FC<ScoreProgressProps> = ({
  score,
  stepProgress,
  isAccurate,
  currentStepIndex,
  totalSteps,
}) => {
  const [displayScore, setDisplayScore] = useState<number>(score);

  useEffect(() => {
    let start = displayScore;
    const end = score;
    if (start === end) return;

    if (end > start) {
      playStarSound(0.2);
    }

    const duration = 300;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(end);
      }
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, [score]);

  const starThresholds = [20, 40, 60, 80, 100];
  const roundedStepProgress = Math.round(stepProgress);

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-lg border-2 border-amber-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
        {/* Title and Overall Score */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md font-extrabold text-xl animate-bounce-slow">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-extrabold text-amber-700">
              Total Skor Bina Diri
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                {displayScore}
              </span>
              <span className="text-slate-500 font-bold text-sm sm:text-base">
                / 100 Poin
              </span>
            </div>
          </div>
        </div>

        {/* 5 Big Glowing Stars */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 px-3 py-2 rounded-2xl border border-amber-200 shadow-xs">
          {starThresholds.map((threshold, idx) => {
            const isEarned = displayScore >= threshold;
            return (
              <div
                key={threshold}
                className={`relative transition-all duration-500 transform ${
                  isEarned
                    ? 'scale-110 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]'
                    : 'text-slate-300 scale-90'
                }`}
                title={`Bintang ${idx + 1}: ${threshold} Poin`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    isEarned ? 'fill-amber-400 animate-wiggle' : 'fill-slate-100'
                  }`}
                />
                {isEarned && (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200 absolute -top-1 -right-1 animate-spin-slow" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sensor Step Accuracy Bar (1 to 100) */}
      <div className="mb-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between text-xs font-black mb-1.5">
          <span className="text-slate-700 flex items-center gap-1.5">
            <span>Sensor Langkah ke-{currentStepIndex + 1}:</span>
            <span className="text-sky-700 font-extrabold">{roundedStepProgress} / 100</span>
          </span>

          {/* Status Sensor: Berjalan vs Berhenti */}
          <span
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black transition-colors ${
              roundedStepProgress >= 100
                ? 'bg-emerald-100 text-emerald-800'
                : isAccurate
                ? 'bg-emerald-500 text-white animate-pulse'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {roundedStepProgress >= 100 ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Langkah Selesai!</span>
              </>
            ) : isAccurate ? (
              <>
                <PlayCircle className="w-3 h-3" />
                <span>Skor Berjalan</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-3 h-3" />
                <span>Skor Berhenti (Tak Tepat)</span>
              </>
            )}
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="relative w-full h-3.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              isAccurate
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                : 'bg-amber-400 opacity-80'
            }`}
            style={{ width: `${Math.min(100, Math.max(3, roundedStepProgress))}%` }}
          />
        </div>
      </div>

      {/* Overall Total Score Bar */}
      <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 transition-all duration-300 ease-out shadow-inner flex items-center justify-end pr-2"
          style={{ width: `${Math.max(4, Math.min(100, displayScore))}%` }}
        />
      </div>

      {/* Bottom text */}
      <div className="mt-2 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-500">
          Langkah ke-{currentStepIndex + 1} dari {totalSteps}
        </span>
        <span className="text-emerald-700">
          {displayScore === 100
            ? '🎉 Sempurna! Skor 100!'
            : isAccurate
            ? '🟢 Gerakan tepat, skor terus bertambah!'
            : '⚠️ Gerakan harus tepat agar skor berjalan.'}
        </span>
      </div>
    </div>
  );
};
