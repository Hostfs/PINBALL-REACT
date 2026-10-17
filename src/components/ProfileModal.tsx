/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, User, Check, ShieldCheck, Copy, Volume2, Music, LogIn, Award } from 'lucide-react';
import { UserProfile } from '../game/types';
import { soundEngine } from '../game/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

const AVATAR_OPTIONS = ['🚀', '👨‍🚀', '👾', '🛸', '⭐', '🔥', '☄️', '👑'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [nickname, setNickname] = useState(profile.nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sfxVol, setSfxVol] = useState(profile.soundVolume);
  const [bgmVol, setBgmVol] = useState(profile.bgmVolume);

  if (!isOpen) return null;

  const handleSave = () => {
    soundEngine.setVolumes(sfxVol, bgmVol);
    onUpdateProfile({
      ...profile,
      nickname: nickname.trim() || profile.nickname,
      avatar: selectedAvatar,
      soundVolume: sfxVol,
      bgmVolume: bgmVol,
    });
    onClose();
  };

  const handleGoogleLogin = () => {
    // Simulated Google Social Login
    onUpdateProfile({
      ...profile,
      authProvider: 'google',
      nickname: '구글_플레이어_' + Math.floor(100 + Math.random() * 900),
      avatar: '👨‍🚀',
      email: 'player@google.com',
    });
    setNickname('구글_플레이어');
    setSelectedAvatar('👨‍🚀');
  };

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(`PIN-${profile.id.toUpperCase()}-DUEL`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const winRate = profile.multiplayerMatches > 0
    ? Math.round((profile.multiplayerWins / profile.multiplayerMatches) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">생도 프로필 & 보안 계정 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
          {/* Social Auth status */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {profile.authProvider === 'google' ? 'Google 소셜 계정 연동됨' : '게스트(로컬) 모드 플레이 중'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  데이터 체크섬 무결성 보호 적용됨
                </span>
              </div>
            </div>

            {profile.authProvider !== 'google' && (
              <button
                onClick={handleGoogleLogin}
                className="px-3 py-1.5 bg-white text-slate-950 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all flex items-center gap-1.5 shadow"
              >
                <LogIn className="w-3.5 h-3.5" />
                Google 연동
              </button>
            )}
          </div>

          {/* Avatar & Nickname Edit */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">아바타 선택</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-10 h-10 rounded-xl border text-xl flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? 'bg-sky-500/20 border-sky-400 scale-105 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">플레이어 닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 font-medium"
                placeholder="닉네임 입력 (최대 12자)"
              />
            </div>
          </div>

          {/* Career Stats Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">플레이어 통계</span>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">아케이드 최고 점수</span>
                <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
                  {profile.highScoreArcade.toLocaleString()} pts
                </span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">바운스 타워 도달 스테이지</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {profile.highestTowerStage} / 8 단계
                </span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">1v1 멀티 승률</span>
                <span className="text-base font-bold font-mono text-purple-400">
                  {winRate}% ({profile.multiplayerWins}승 / {profile.multiplayerMatches}전)
                </span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">보유 코인 / 시즌 포인트</span>
                <span className="text-base font-bold font-mono text-sky-400">
                  🪙 {profile.coins.toLocaleString()} / {profile.seasonPoints} SP
                </span>
              </div>
            </div>
          </div>

          {/* Friend Invite Code */}
          <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">친구 대전 초대 코드</span>
              <span className="text-xs text-sky-400 font-mono font-bold tracking-wider">
                PIN-{profile.id.toUpperCase()}-DUEL
              </span>
            </div>
            <button
              onClick={handleCopyInvite}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedCode ? '복사됨!' : '코드 복사'}
            </button>
          </div>

          {/* Audio Volume Controls */}
          <div className="space-y-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
            <span className="text-xs font-bold text-white block">오디오 볼륨 제어</span>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-300 w-16">효과음 (SFX)</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSfxVol(val);
                  soundEngine.setVolumes(val, bgmVol);
                }}
                className="flex-1 accent-sky-500"
              />
              <span className="text-xs font-mono text-slate-400 w-8 text-right">
                {Math.round(sfxVol * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Music className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-300 w-16">배경음 (BGM)</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBgmVol(val);
                  soundEngine.setVolumes(sfxVol, val);
                }}
                className="flex-1 accent-sky-500"
              />
              <span className="text-xs font-mono text-slate-400 w-8 text-right">
                {Math.round(bgmVol * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Footer save */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg shadow transition-all active:scale-95"
          >
            저장 완료
          </button>
        </div>
      </div>
    </div>
  );
};
