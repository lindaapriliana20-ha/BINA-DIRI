import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Star, Sparkles, RefreshCw, HeartHandshake, CheckCircle2, Share2, Camera } from 'lucide-react';
import { playFanfare, playCheer, speakGentle } from '../utils/audio';
import { Activity } from '../types';

interface CelebrationModalProps {
  activity: Activity;
  score: number;
  onRestart: () => void;
  onChooseOther: () => void;
  snapshotUrl?: string;
  onTakeSnapshot?: () => void;
  voiceEnabled: boolean;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  activity,
  score,
  onRestart,
  onChooseOther,
  snapshotUrl,
  onTakeSnapshot,
  voiceEnabled,
}) => {
  useEffect(() => {
    // 1. Play grand fanfare and cheer
    playFanfare(0.5);

    // 2. Fire celebratory confetti cannons
    const end = Date.now() + 3000;
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // 3. Gentle voice congratulation
    if (voiceEnabled) {
      const congratulationSpeech = `Selamat! Hebat sekali anak pintar! Kamu berhasil menyelesaikan ${activity.shortTitle} dengan nilai sempurna seratus! Luar biasa!`;
      setTimeout(() => {
        speakGentle(congratulationSpeech, { rate: 0.85, pitch: 1.15 });
      }, 600);
    }
  }, [activity, voiceEnabled]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-white to-sky-50 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-center my-8">
        {/* Floating Stars decoration */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-amber-400 text-amber-950 px-6 py-2 rounded-full shadow-lg border-2 border-white font-black text-sm uppercase tracking-wide animate-bounce-slow">
          <Star className="w-5 h-5 fill-amber-950" />
          <span>Nilai Sempurna 100!</span>
          <Star className="w-5 h-5 fill-amber-950" />
        </div>

        {/* Big Trophy & Badge */}
        <div className="mt-4 mb-4 flex justify-center">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white shadow-xl flex items-center justify-center animate-wiggle">
            <Award className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-md" />
            <Sparkles className="w-8 h-8 text-yellow-100 absolute -top-2 -right-2 animate-spin-slow" />
          </div>
        </div>

        {/* Big Warm Celebration Heading */}
        <h2 className="text-3xl sm:text-4xl font-black text-amber-600 font-heading leading-tight mb-2">
          SELAMAT, HEBAT!
        </h2>
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-heading mb-3">
          {activity.celebrationTitle}
        </h3>
        <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-md mx-auto mb-5">
          {activity.celebrationMessage}
        </p>

        {/* Badge Card */}
        <div className="bg-amber-100/80 border-2 border-amber-300 rounded-2xl p-4 mb-5 text-left flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center shrink-0 shadow-sm text-2xl">
            🏆
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold text-amber-800">
              Lencana Diraih
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 font-heading">
              {activity.badgeName}
            </div>
            <div className="text-xs text-slate-600 font-medium">
              {activity.badgeDescription}
            </div>
          </div>
        </div>

        {/* Snapshot preview if available */}
        {snapshotUrl && (
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-600 mb-2">
              📸 Foto Senyum Juara Cermin Ajaib Kamu:
            </p>
            <div className="relative inline-block rounded-2xl overflow-hidden border-4 border-amber-300 shadow-md">
              <img
                src={snapshotUrl}
                alt="Foto Senyum Juara"
                className="w-48 h-48 sm:w-56 sm:h-56 object-cover"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 border-2 border-emerald-300 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Praktek Ulangi Lagi (Skor 100)</span>
          </button>

          <button
            onClick={onChooseOther}
            className="w-full py-3.5 px-6 bg-sky-500 hover:bg-sky-600 active:scale-98 text-white rounded-2xl font-black text-base shadow-md flex items-center justify-center gap-2 border-2 border-sky-300 transition-all"
          >
            <HeartHandshake className="w-5 h-5" />
            <span>Pilih Praktek Bina Diri Lainnya</span>
          </button>
        </div>
      </div>
    </div>
  );
};
