/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Trophy, Palette, CheckSquare, User, Sparkles } from 'lucide-react';
import { GameMode, UserProfile } from '../game/types';

interface TitleScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenLeaderboard: () => void;
  onOpenCustomizer: () => void;
  onOpenMissions: () => void;
  onOpenProfile: () => void;
  profile: UserProfile;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLeaderboard,
  onOpenCustomizer,
  onOpenMissions,
  onOpenProfile,
  profile,
  selectedMode,
  onSelectMode,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden bg-slate-950 text-slate-100">
      {/* Background Decorative Ambient Layers */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Top Bar Contract: User Status & Navigation Action points */}
      <header className="relative z-10 w-full max-w-2xl flex items-center justify-between gap-4">
        {/* Profile Card Trigger */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg hover:border-sky-500/50 transition-colors text-left"
        >
          <span className="text-xl">{profile.avatar}</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">{profile.nickname}</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span>Lv.{profile.level}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400">🪙 {profile.coins.toLocaleString()}</span>
            </div>
          </div>
        </button>

        {/* Quick Menu Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMissions}
            title="일일 미션 & 시즌 이벤트"
            className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCustomizer}
            title="테마 & 스킨 꾸미기"
            className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 hover:text-purple-400 hover:border-purple-500/50 transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenLeaderboard}
            title="랭킹 & 순위표"
            className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 hover:text-sky-400 hover:border-sky-500/50 transition-colors"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Centerpiece: Bespoke Retro Title Lockup & Mascot */}
      <main className="relative z-10 w-full max-w-lg flex flex-col items-center text-center my-auto py-4">
        {/* Bespoke inline SVG Title Lockup */}
        <div className="mb-2 relative">
          <svg className="w-72 sm:w-96 h-28 mx-auto filter drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]" viewBox="0 0 400 120">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {/* Retro Space Cadet Pinball Wings */}
            <path d="M 40 40 L 120 40 L 90 60 L 50 60 Z" fill="url(#titleGrad)" opacity="0.6" />
            <path d="M 360 40 L 280 40 L 310 60 L 350 60 Z" fill="url(#titleGrad)" opacity="0.6" />
            <circle cx="200" cy="30" r="14" fill="url(#goldGrad)" />
            <path d="M 194 30 L 206 30 M 200 24 L 200 36" stroke="#000" strokeWidth="2" />
            {/* Text */}
            <text x="200" y="75" textAnchor="middle" fill="#ffffff" fontFamily="Outfit, sans-serif" fontWeight="900" fontSize="38" letterSpacing="4">
              SPACE BOUNCE
            </text>
            <text x="200" y="105" textAnchor="middle" fill="url(#titleGrad)" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="20" letterSpacing="6">
              PINBALL ARCADE
            </text>
          </svg>
        </div>

        {/* Subtitle with unboxed metadata */}
        <p className="text-sm sm:text-base text-slate-300 max-w-sm mb-6 leading-relaxed">
          윈도우 XP 3D 핀볼의 전율과 추억의 공튀기기 물리 액션의 결합!
        </p>

        {/* Mode Selector Segmented Controls */}
        <div className="w-full grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
          <button
            onClick={() => onSelectMode('ARCADE')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              selectedMode === 'ARCADE'
                ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            아케이드 핀볼
          </button>
          <button
            onClick={() => onSelectMode('BOUNCE_TOWER')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              selectedMode === 'BOUNCE_TOWER'
                ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            바운스 타워 (8단)
          </button>
          <button
            onClick={() => onSelectMode('MULTIPLAYER')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center justify-center gap-1 ${
              selectedMode === 'MULTIPLAYER'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1v1 실시간 대전
          </button>
        </div>

        {/* Primary Start CTA Button */}
        <button
          onClick={() => onStartGame(selectedMode)}
          className="w-full max-w-xs py-4 px-8 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 hover:from-sky-300 hover:via-indigo-400 hover:to-purple-500 text-slate-950 font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>게임 시작 (Space)</span>
        </button>
      </main>

      {/* Footer: Single flat control hint line */}
      <footer className="relative z-10 w-full text-center">
        <p className="text-xs text-slate-500 font-mono">
          Z / / 키 또는 화면 터치 플리퍼 · Space 발사대 · Esc 일시정지
        </p>
      </footer>
    </div>
  );
};
