/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Music, Pause, Shield, Zap } from 'lucide-react';
import { SpaceCadetRank } from '../game/types';

interface HUDProps {
  score: number;
  highScore: number;
  ballsLeft: number;
  cadetRank: SpaceCadetRank;
  comboCount: number;
  ringsCollected: number;
  targetRings?: number;
  hasShield: boolean;
  isMuted: boolean;
  bgmTrack: number;
  onToggleMute: () => void;
  onCycleBgm: () => void;
  onPause: () => void;
  onNudge: () => void;
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
  onPlungerDown: () => void;
  onPlungerUp: () => void;
  plungerCharging: boolean;
  stageName?: string;
  isMultiplayer?: boolean;
  rivalScore?: number;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  ballsLeft,
  cadetRank,
  comboCount,
  ringsCollected,
  targetRings,
  hasShield,
  isMuted,
  bgmTrack,
  onToggleMute,
  onCycleBgm,
  onPause,
  onNudge,
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp,
  onPlungerDown,
  onPlungerUp,
  plungerCharging,
  stageName,
  isMultiplayer,
  rivalScore = 0,
}) => {
  const bgmNames = ['Space Cadet', 'Bounce World', 'Neon Duel'];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-10">
      {/* Top Status Cluster (Perimeter low-occlusion) */}
      <header className="flex items-start justify-between gap-4">
        {/* Left: Score & Cadet Rank */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums drop-shadow-md">
              {score.toLocaleString()}
            </span>
            {comboCount > 1 && (
              <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono animate-pulse">
                {comboCount}x COMBO
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-sky-400 font-medium">{cadetRank}</span>
            <span aria-hidden="true">·</span>
            <span>최고 {highScore.toLocaleString()}</span>
            {stageName && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">{stageName}</span>
              </>
            )}
          </div>

          {/* Multiplayer Live Versus Bar */}
          {isMultiplayer && (
            <div className="flex items-center gap-2 mt-1 px-2.5 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-xs">
              <span className="text-rose-400 font-mono font-bold">VS 라이벌: {rivalScore.toLocaleString()}</span>
              <span className="text-slate-500 font-mono">
                ({score >= rivalScore ? `+${(score - rivalScore).toLocaleString()}` : `-${(rivalScore - score).toLocaleString()}`})
              </span>
            </div>
          )}
        </div>

        {/* Right: Ball Lives, Rings & Media Controls */}
        <div className="flex flex-col items-end gap-2">
          {/* Controls cluster (clickable) */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 px-2 py-1 rounded-lg">
            <button
              onClick={onCycleBgm}
              title={`배경음악: ${bgmNames[bgmTrack]}`}
              className="p-1 text-slate-300 hover:text-sky-400 transition-colors flex items-center gap-1 text-xs"
            >
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline font-mono text-[10px]">{bgmNames[bgmTrack]}</span>
            </button>
            <button
              onClick={onToggleMute}
              title={isMuted ? '음소거 해제' : '음소거'}
              className="p-1 text-slate-300 hover:text-sky-400 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onPause}
              title="일시 정지 (Esc)"
              className="p-1 text-slate-300 hover:text-sky-400 transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {/* Balls remaining & Rings */}
          <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
            {/* Shield status */}
            <div className="flex items-center gap-1 text-sky-400" title="에너지 실드">
              <Shield className={`w-3.5 h-3.5 ${hasShield ? 'text-sky-400 fill-sky-400/30' : 'text-slate-600'}`} />
            </div>

            {/* Rings meter */}
            <div className="flex items-center gap-1 text-amber-300" title="스타 링">
              <span className="text-amber-400 font-bold">★</span>
              <span className="tabular-nums">
                {ringsCollected}
                {targetRings ? `/${targetRings}` : ''}
              </span>
            </div>

            {/* Balls indicator */}
            <div className="flex items-center gap-1" title="잔여 공">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full border border-sky-400/80 transition-colors ${
                    i < ballsLeft ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' : 'bg-transparent border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Center Subtle Keyboard Guide (Fades out / Quiet single line) */}
      <footer className="w-full flex flex-col items-center gap-3">
        {/* Desktop control hints */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400/80 font-mono">
          <span>[Z] 좌측 플리퍼</span>
          <span aria-hidden="true">·</span>
          <span>[/] 우측 플리퍼</span>
          <span aria-hidden="true">·</span>
          <span>[스페이스] 발사대 충전</span>
          <span aria-hidden="true">·</span>
          <span>[X] 틸트(흔들기)</span>
        </div>

        {/* Mobile Touch Bar Controls (Big responsive touch pads) */}
        <div className="w-full max-w-[480px] grid grid-cols-4 gap-2 pointer-events-auto">
          {/* Left Flipper Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onLeftDown();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onLeftUp();
            }}
            onPointerLeave={onLeftUp}
            className="col-span-1 h-14 bg-sky-950/70 active:bg-sky-600/80 border border-sky-500/40 rounded-xl flex flex-col items-center justify-center text-sky-200 active:scale-95 transition-all active:shadow-[0_0_15px_#38bdf8]"
          >
            <span className="text-sm font-bold font-mono">◀ 좌측</span>
            <span className="text-[10px] text-sky-400/80">[Z]</span>
          </button>

          {/* Nudge / Tilt Button */}
          <button
            onClick={onNudge}
            className="col-span-1 h-14 bg-slate-900/70 active:bg-slate-700 border border-slate-700/50 rounded-xl flex flex-col items-center justify-center text-slate-300 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-[10px] text-slate-400">틸트 [X]</span>
          </button>

          {/* Plunger Launch Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onPlungerDown();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onPlungerUp();
            }}
            onPointerLeave={onPlungerUp}
            className={`col-span-1 h-14 border rounded-xl flex flex-col items-center justify-center active:scale-95 transition-all ${
              plungerCharging
                ? 'bg-amber-600/90 border-amber-400 text-white shadow-[0_0_15px_#f59e0b]'
                : 'bg-amber-950/70 border-amber-500/40 text-amber-200'
            }`}
          >
            <span className="text-xs font-bold font-mono">{plungerCharging ? '파워 장전!' : '발사대'}</span>
            <span className="text-[10px] text-amber-400/80">[Space]</span>
          </button>

          {/* Right Flipper Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onRightDown();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onRightUp();
            }}
            onPointerLeave={onRightUp}
            className="col-span-1 h-14 bg-sky-950/70 active:bg-sky-600/80 border border-sky-500/40 rounded-xl flex flex-col items-center justify-center text-sky-200 active:scale-95 transition-all active:shadow-[0_0_15px_#38bdf8]"
          >
            <span className="text-sm font-bold font-mono">우측 ▶</span>
            <span className="text-[10px] text-sky-400/80">[/]</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
