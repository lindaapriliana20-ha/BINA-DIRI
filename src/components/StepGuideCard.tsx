import React from 'react';
import { ActivityStep } from '../types';
import { Check, ArrowRight, ArrowLeft, ThumbsUp, Sparkles, Heart, PlayCircle, PauseCircle, CheckCircle2 } from 'lucide-react';
import { playPop, playChime } from '../utils/audio';

interface StepGuideCardProps {
  step: ActivityStep;
  currentStepIndex: number;
  totalSteps: number;
  stepProgress: number; // 0 to 100
  isAccurate: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onEncourageAction: () => void;
  isReadyForNext: boolean;
  themeColor: string;
}

export const StepGuideCard: React.FC<StepGuideCardProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  stepProgress,
  isAccurate,
  onNextStep,
  onPrevStep,
  onEncourageAction,
  isReadyForNext,
  themeColor,
}) => {
  const renderStepIcon = () => {
    switch (step.iconType) {
      case 'toothbrush':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-sky-100 border-4 border-sky-300 flex items-center justify-center text-4xl shadow-md animate-bounce-slow">
            🪥
          </div>
        );
      case 'soap':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center text-4xl shadow-md animate-bounce-slow">
            🧼
          </div>
        );
      case 'comb':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-4xl shadow-md animate-bounce-slow">
            🪮
          </div>
        );
      case 'water':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-100 border-4 border-blue-300 flex items-center justify-center text-4xl shadow-md animate-bounce-slow">
            💧
          </div>
        );
      case 'smile':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-100 border-4 border-rose-300 flex items-center justify-center text-4xl shadow-md animate-bounce-slow">
            😊
          </div>
        );
      case 'rub':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-purple-100 border-4 border-purple-300 flex items-center justify-center text-4xl shadow-md animate-bounce-slow">
            🙌
          </div>
        );
      case 'clean':
      default:
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-yellow-100 border-4 border-yellow-300 flex items-center justify-center text-4xl shadow-md animate-bounce-slow">
            ✨
          </div>
        );
    }
  };

  const handleManualAction = () => {
    playPop(0.4);
    onEncourageAction();
  };

  const handleNext = () => {
    playChime(0.4);
    onNextStep();
  };

  const roundedProgress = Math.round(stepProgress);

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-5 shadow-xl border-3 border-slate-100 flex flex-col justify-between">
      {/* Step Header */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs sm:text-sm rounded-full border border-amber-300">
              Langkah {currentStepIndex + 1} dari {totalSteps}
            </span>
          </div>

          {/* Precision Status Banner */}
          <div className="flex items-center gap-1.5 text-xs font-black">
            {roundedProgress >= 100 ? (
              <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Selesai!</span>
              </span>
            ) : isAccurate ? (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                <PlayCircle className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>Skor Berjalan: {roundedProgress}%</span>
              </span>
            ) : (
              <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-200">
                <PauseCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Skor Berhenti ({roundedProgress}%)</span>
              </span>
            )}
          </div>
        </div>

        {/* Step Guide Core Content */}
        <div className="flex items-start gap-4 mb-3">
          <div className="shrink-0">{renderStepIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading leading-tight mb-1">
              {step.title}
            </h3>
            <p className="text-sm sm:text-base font-bold text-amber-700 mb-1">
              {step.subtitle}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </div>

      {/* Big Tactile Action Buttons */}
      <div className="space-y-2 pt-1">
        {/* Practice Button for assisting / tapping */}
        <button
          onClick={handleManualAction}
          className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 rounded-2xl font-black text-sm sm:text-base shadow-md border-2 border-amber-500 flex items-center justify-center gap-2 transition-transform"
        >
          <ThumbsUp className="w-4 h-4 text-amber-950" />
          <span>Bantuan Guru / Sentuh: Tambah Skor Latihan (+10%)</span>
        </button>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          {currentStepIndex > 0 && (
            <button
              onClick={() => {
                playPop(0.3);
                onPrevStep();
              }}
              className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-2xl font-bold text-xs sm:text-sm shadow-sm border border-slate-300 flex items-center gap-1.5 transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ulangi</span>
            </button>
          )}

          <button
            onClick={handleNext}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${
              isReadyForNext
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse border-2 border-emerald-300'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            <span>
              {currentStepIndex === totalSteps - 1
                ? '🎉 Selesai & Raih Skor 100!'
                : roundedProgress >= 100
                ? '⭐ Langkah Selesai! Lanjut'
                : 'Lanjut Langkah Berikutnya'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
