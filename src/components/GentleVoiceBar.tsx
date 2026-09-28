import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, MessageCircleHeart, RotateCcw } from 'lucide-react';
import { speakGentle, stopSpeech } from '../utils/audio';

interface GentleVoiceBarProps {
  promptText: string;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  activityName: string;
}

export const GentleVoiceBar: React.FC<GentleVoiceBarProps> = ({
  promptText,
  voiceEnabled,
  onToggleVoice,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Speak once only when a step is loaded. NO REPEATING TIMERS!
  useEffect(() => {
    if (voiceEnabled && promptText) {
      speakGentle(promptText, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }

    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [promptText, voiceEnabled]);

  const handleManualRepeat = () => {
    if (!voiceEnabled) {
      onToggleVoice();
    }
    stopSpeech();
    speakGentle(promptText, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-100 via-sky-100 to-indigo-100 rounded-3xl p-3 sm:p-4 shadow-md border-2 border-sky-200">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Friendly Mascot "Nadi" (Static clean face, no wild jumping animation) */}
        <div className="relative shrink-0">
          <div
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 border-2 border-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={handleManualRepeat}
            title="Sahabat Nadi - Sentuh untuk Mendengarkan Suara"
          >
            <div className="text-center select-none">
              <div className="flex justify-center gap-1.5 mb-0.5">
                <div className="w-2 h-2.5 bg-slate-900 rounded-full" />
                <div className="w-2 h-2.5 bg-slate-900 rounded-full" />
              </div>
              <div className="w-4 h-1.5 bg-rose-500 rounded-full mx-auto" />
            </div>
          </div>
        </div>

        {/* Speech Text Bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 mb-0.5">
            <MessageCircleHeart className="w-4 h-4 text-rose-500" />
            <span>Panduan Suara Lembut:</span>
            {isSpeaking && (
              <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full font-bold">
                Sedang bersuara
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug line-clamp-2">
            "{promptText}"
          </p>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleManualRepeat}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold rounded-2xl shadow-sm text-xs sm:text-sm transition-all"
            title="Dengarkan Suara"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Ulangi Suara</span>
          </button>

          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeech();
                setIsSpeaking(false);
              }
              onToggleVoice();
            }}
            className={`p-2 rounded-2xl border-2 transition-all active:scale-90 ${
              voiceEnabled
                ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 shadow-sm'
                : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
            }`}
            title={voiceEnabled ? 'Suara Aktif' : 'Suara Dimatikan'}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
