import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, CheckCircle2, Award, Crosshair, PauseCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { MirrorFilter, ActivityId } from '../types';
import { playPop, playChime } from '../utils/audio';

export type SensorAccuracyStatus = 'CORRECT' | 'WRONG_ZONE' | 'NO_MOTION' | 'COMPLETED';

interface DigitalMirrorProps {
  activityId: ActivityId;
  filterStyle: MirrorFilter;
  overlayType: 'teeth-sparkle' | 'bubbles' | 'comb-sparkle' | 'clean-star';
  motionProgress: number; // 0 to 100 for current step
  onUpdateStepProgress: (newProgress: number, isAccurate: boolean) => void;
  onStepCompleted: () => void;
  onSnapshotTaken?: (dataUrl: string) => void;
  currentStepTitle: string;
  isCompleted: boolean;
}

export const DigitalMirror: React.FC<DigitalMirrorProps> = ({
  activityId,
  filterStyle,
  motionProgress,
  onUpdateStepProgress,
  onStepCompleted,
  onSnapshotTaken,
  currentStepTitle,
  isCompleted,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  
  // Real-time sensor state
  const [sensorPos, setSensorPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [sensorStatus, setSensorStatus] = useState<SensorAccuracyStatus>('NO_MOTION');

  const prevFrameData = useRef<Uint8ClampedArray | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Target Zones per Activity
  const getTargetZone = () => {
    switch (activityId) {
      case 'teeth':
        return { minX: 25, maxX: 75, minY: 32, maxY: 78, label: 'Area Target Mulut & Gigi' };
      case 'hands':
        return { minX: 18, maxX: 82, minY: 42, maxY: 94, label: 'Area Target Kedua Tangan' };
      case 'hair':
        return { minX: 18, maxX: 82, minY: 10, maxY: 58, label: 'Area Target Rambut & Kepala' };
    }
  };

  const targetZone = getTargetZone();

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setHasCamera(true);
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setHasCamera(false);
      setCameraError('Kamera belum aktif atau belum diizinkan. Cermin simulasi tetap bisa digunakan!');
      setIsCameraActive(false);
    }
  }, []);

  // Stop camera when unmounting
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [startCamera]);

  // Real-time Motion & Precision Tracking Loop:
  // Sensor runs 1-100 only when motion is inside the target zone, stops when not in target zone
  useEffect(() => {
    let lastCheck = Date.now();

    const checkMotion = () => {
      const now = Date.now();
      // Fast tracking check every 70ms
      if (now - lastCheck >= 70 && videoRef.current && isCameraActive && !isCompleted) {
        lastCheck = now;
        const video = videoRef.current;
        const mCanvas = motionCanvasRef.current;

        if (mCanvas && video.readyState === video.HAVE_ENOUGH_DATA) {
          const width = 64;
          const height = 48;
          mCanvas.width = width;
          mCanvas.height = height;
          const ctx = mCanvas.getContext('2d', { willReadFrequently: true });

          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const currentFrame = ctx.getImageData(0, 0, width, height).data;

            if (prevFrameData.current) {
              let diffCount = 0;
              let sumX = 0;
              let sumY = 0;
              const totalPixels = width * height;

              for (let i = 0; i < currentFrame.length; i += 4) {
                const rDiff = Math.abs(currentFrame[i] - prevFrameData.current[i]);
                const gDiff = Math.abs(currentFrame[i + 1] - prevFrameData.current[i + 1]);
                const bDiff = Math.abs(currentFrame[i + 2] - prevFrameData.current[i + 2]);
                const avgDiff = (rDiff + gDiff + bDiff) / 3;

                if (avgDiff > 28) {
                  const pixelIndex = i / 4;
                  const px = pixelIndex % width;
                  const py = Math.floor(pixelIndex / width);
                  sumX += px;
                  sumY += py;
                  diffCount++;
                }
              }

              const motionPercent = (diffCount / totalPixels) * 100;

              // 1. Check if movement exists
              if (diffCount < 10 || motionPercent < 1.6) {
                // NO MOVEMENT -> SKOR BERHENTI
                setSensorStatus('NO_MOTION');
                onUpdateStepProgress(motionProgress, false);
              } else {
                // Movement exists: calculate Centroid
                const rawCenterX = (sumX / diffCount) / width * 100;
                const rawCenterY = (sumY / diffCount) / height * 100;

                // Mirrored coordinates for natural reflection
                const targetX = 100 - rawCenterX;
                const targetY = rawCenterY;

                // Smoothly update sensor follower position
                setSensorPos((prev) => ({
                  x: Math.round(prev.x + (targetX - prev.x) * 0.45),
                  y: Math.round(prev.y + (targetY - prev.y) * 0.45),
                }));

                // 2. Check if movement is in correct target zone
                const inZone =
                  targetX >= targetZone.minX &&
                  targetX <= targetZone.maxX &&
                  targetY >= targetZone.minY &&
                  targetY <= targetZone.maxY;

                if (inZone) {
                  // GERAKAN TEPAT! SKOR BERJALAN 1 - 100
                  setSensorStatus('CORRECT');

                  if (motionProgress >= 100) {
                    setSensorStatus('COMPLETED');
                  } else {
                    const increment = 1.2;
                    const nextVal = Math.min(100, Math.round((motionProgress + increment) * 10) / 10);
                    onUpdateStepProgress(nextVal, true);

                    if (nextVal >= 100) {
                      playChime(0.5);
                      onStepCompleted();
                    }
                  }
                } else {
                  // GERAKAN TIDAK TEPAT (DI LUAR TARGET) -> SKOR BERHENTI
                  setSensorStatus('WRONG_ZONE');
                  onUpdateStepProgress(motionProgress, false);
                }
              }
            }

            prevFrameData.current = new Uint8ClampedArray(currentFrame);
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(checkMotion);
    };

    animationFrameId.current = requestAnimationFrame(checkMotion);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isCameraActive, activityId, targetZone, motionProgress, isCompleted, onUpdateStepProgress, onStepCompleted]);

  // Snapshot photo of the child in the mirror
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.lineWidth = 16;
    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(20, 20, 360, 60);
    ctx.font = 'bold 24px Fredoka, Nunito, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('⭐ CINTA NADI BINA DIRI ⭐', 35, 58);

    const dataUrl = canvas.toDataURL('image/png');
    playPop(0.5);
    onSnapshotTaken?.(dataUrl);
  };

  const roundedProgress = Math.round(motionProgress);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border-4 border-amber-300">
      <canvas ref={motionCanvasRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Decorative Mirror Header Bar */}
      <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border-2 border-amber-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 font-heading">
            Cermin Digital Mandiri
          </span>
        </div>

        {/* Action controls on mirror */}
        <div className="flex items-center gap-2">
          {hasCamera && isCameraActive && (
            <button
              onClick={takeSnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 rounded-full font-bold text-xs sm:text-sm shadow-md transition-transform border border-amber-200"
              title="Ambil Foto Senyum"
            >
              <Award className="w-4 h-4 text-amber-900" />
              <span>Foto Senyum</span>
            </button>
          )}

          <button
            onClick={() => {
              if (isCameraActive) {
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((track) => track.stop());
                  streamRef.current = null;
                }
                setIsCameraActive(false);
              } else {
                startCamera();
              }
            }}
            className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full shadow-md transition-all active:scale-90"
            title={isCameraActive ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          >
            {isCameraActive ? <Camera className="w-4 h-4 text-emerald-600" /> : <CameraOff className="w-4 h-4 text-rose-500" />}
          </button>
        </div>
      </div>

      {/* Clean Mirror Viewport (Clean video reflection without distracting animations) */}
      <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Actual Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover mirror-mode transition-opacity duration-300 ${
            isCameraActive ? 'opacity-100' : 'opacity-0 absolute'
          }`}
        />

        {/* Fallback Clean View when camera is off */}
        {!isCameraActive && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-sky-400 via-sky-300 to-amber-200">
            <div className="w-24 h-24 rounded-full bg-white/90 border-4 border-amber-400 shadow-xl flex items-center justify-center text-4xl mb-4">
              🪞
            </div>

            <p className="text-xl sm:text-2xl font-black text-slate-800 font-heading">
              Cermin Siap Digunakan
            </p>
            <p className="mt-1 text-sm sm:text-base text-slate-700 max-w-md font-medium">
              Tatap cermin dan lakukan gerakan mandiri dengan percaya diri ya sayang!
            </p>

            <button
              onClick={startCamera}
              className="mt-4 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold rounded-2xl shadow-xl flex items-center gap-2 border-2 border-white"
            >
              <RefreshCw className="w-5 h-5" />
              Nyalakan Kamera Saya
            </button>
            {cameraError && (
              <p className="mt-2 text-xs text-rose-700 font-semibold bg-rose-100/90 px-3 py-1 rounded-full">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TARGET ZONE (Clean Visual Area Gerakan Benar, NO ANIMATION) */}
        {/* ========================================================= */}
        {isCameraActive && (
          <div
            className={`absolute pointer-events-none rounded-3xl border-3 border-dashed transition-colors duration-200 ${
              sensorStatus === 'CORRECT'
                ? 'border-emerald-400 bg-emerald-400/10'
                : sensorStatus === 'WRONG_ZONE'
                ? 'border-amber-400 bg-amber-400/10'
                : 'border-sky-300/60 bg-sky-400/5'
            }`}
            style={{
              left: `${targetZone.minX}%`,
              top: `${targetZone.minY}%`,
              width: `${targetZone.maxX - targetZone.minX}%`,
              height: `${targetZone.maxY - targetZone.minY}%`,
            }}
          >
            {/* Target Label */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-md border border-white/20">
              {activityId === 'teeth' && <span>🪥</span>}
              {activityId === 'hands' && <span>🧼</span>}
              {activityId === 'hair' && <span>🪮</span>}
              <span>{targetZone.label}</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SENSOR PELACAK GERAKAN (Clean tracking indicator)         */}
        {/* ========================================================= */}
        {isCameraActive && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-100 ease-out -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${sensorPos.x}%`,
              top: `${sensorPos.y}%`,
            }}
          >
            {/* Sensor Ring */}
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-dashed flex items-center justify-center transition-colors duration-150 ${
                sensorStatus === 'CORRECT'
                  ? 'border-emerald-400 bg-emerald-500/20'
                  : sensorStatus === 'WRONG_ZONE'
                  ? 'border-rose-400 bg-rose-500/20'
                  : 'border-amber-300 bg-amber-400/15'
              }`}
            >
              {/* Inner Reticle */}
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  sensorStatus === 'CORRECT'
                    ? 'border-emerald-200 bg-emerald-500 text-white'
                    : sensorStatus === 'WRONG_ZONE'
                    ? 'border-rose-200 bg-rose-500 text-white'
                    : 'border-white/80 bg-amber-400 text-slate-900'
                }`}
              >
                {sensorStatus === 'CORRECT' ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : sensorStatus === 'WRONG_ZONE' ? (
                  <AlertCircle className="w-5 h-5 text-white" />
                ) : (
                  <Crosshair className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Dynamic Status Tag */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-3 py-1 rounded-full font-black text-xs whitespace-nowrap shadow-md flex items-center gap-1.5 transition-colors ${
                sensorStatus === 'CORRECT'
                  ? 'bg-emerald-600 text-white border border-emerald-300'
                  : sensorStatus === 'WRONG_ZONE'
                  ? 'bg-rose-600 text-white border border-rose-300'
                  : 'bg-amber-400 text-amber-950 border border-amber-300'
              }`}
            >
              {sensorStatus === 'CORRECT' ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5 text-white" />
                  <span>Gerakan Tepat ({roundedProgress}%)</span>
                </>
              ) : sensorStatus === 'WRONG_ZONE' ? (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-white" />
                  <span>Skor Berhenti (Di Luar Area)</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-amber-950" />
                  <span>Skor Berhenti (Mulai Gerakan)</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Live Motion Activity Guidance Bar at Bottom of Mirror */}
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-col items-center">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border-2 border-amber-300 text-center">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 mb-1">
              <span className="text-sky-800 font-heading font-black">
                {currentStepTitle}
              </span>

              {/* Status Indicator Pill */}
              <span
                className={`font-black flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${
                  roundedProgress >= 100
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : sensorStatus === 'CORRECT'
                    ? 'bg-emerald-600 text-white'
                    : sensorStatus === 'WRONG_ZONE'
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {roundedProgress >= 100 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Selesai (100%)
                  </>
                ) : sensorStatus === 'CORRECT' ? (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" />
                    Skor Berjalan: {roundedProgress}%
                  </>
                ) : sensorStatus === 'WRONG_ZONE' ? (
                  <>
                    <PauseCircle className="w-3.5 h-3.5" />
                    Skor Berhenti
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-3.5 h-3.5" />
                    Skor Berhenti
                  </>
                )}
              </span>
            </div>

            {/* Step Motion Bar (Running 1 - 100) */}
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300 relative">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  sensorStatus === 'CORRECT'
                    ? 'bg-emerald-500'
                    : 'bg-amber-400 opacity-75'
                }`}
                style={{ width: `${Math.min(100, Math.max(2, roundedProgress))}%` }}
              />
            </div>

            {/* Clear Instructions */}
            <p className="text-[11px] text-slate-700 mt-1 font-bold">
              {sensorStatus === 'CORRECT' ? (
                <span className="text-emerald-700">
                  Gerakan tepat! Pertahankan gerakan di area target sampai 100%.
                </span>
              ) : sensorStatus === 'WRONG_ZONE' ? (
                <span className="text-rose-700">
                  Skor berhenti. Arahkan gerakanmu ke dalam area kotak di layar.
                </span>
              ) : (
                <span className="text-amber-800">
                  Skor berhenti. Gerakkan tangan/sikat/sisir di area target.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
