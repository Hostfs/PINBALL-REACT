/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, Swords, Users, Copy, Check, ShieldAlert } from 'lucide-react';
import { UserProfile, MultiplayerRival } from '../game/types';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onStartMultiplayerMatch: (rival: MultiplayerRival) => void;
}

const BOT_RIVALS: MultiplayerRival[] = [
  { nickname: 'GalaxyCadet_Luna', avatar: '👩‍🚀', score: 0, ballsLeft: 3, status: '대기 중', comboCount: 0 },
  { nickname: 'CyberPinballer_KR', avatar: '👾', score: 0, ballsLeft: 3, status: '대기 중', comboCount: 0 },
  { nickname: 'StarChaser_99', avatar: '☄️', score: 0, ballsLeft: 3, status: '대기 중', comboCount: 0 },
  { nickname: 'OrionMarshal', avatar: '🛸', score: 0, ballsLeft: 3, status: '대기 중', comboCount: 0 },
];

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  profile,
  onStartMultiplayerMatch,
}) => {
  const [matchMode, setMatchMode] = useState<'quick' | 'room'>('quick');
  const [roomCode, setRoomCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundRival, setFoundRival] = useState<MultiplayerRival | null>(null);

  if (!isOpen) return null;

  const handleStartQuickSearch = () => {
    setIsSearching(true);
    setFoundRival(null);

    // Simulate 1.2s matchmaking network lookup
    setTimeout(() => {
      const selected = BOT_RIVALS[Math.floor(Math.random() * BOT_RIVALS.length)];
      setFoundRival(selected);
      setIsSearching(false);

      setTimeout(() => {
        onStartMultiplayerMatch(selected);
        onClose();
      }, 1400);
    }, 1200);
  };

  const handleJoinCustomRoom = () => {
    if (!roomCode.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      const friendRival: MultiplayerRival = {
        nickname: `친구_${roomCode.toUpperCase().slice(-4)}`,
        avatar: '🤝',
        score: 0,
        ballsLeft: 3,
        status: '룸 접속됨',
        comboCount: 0,
      };
      setFoundRival(friendRival);
      setIsSearching(false);
      setTimeout(() => {
        onStartMultiplayerMatch(friendRival);
        onClose();
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Swords className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">1v1 실시간 핀볼-바운스 대전</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl my-4 border border-slate-800/80">
          <button
            onClick={() => setMatchMode('quick')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              matchMode === 'quick' ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            빠른 실시간 매칭
          </button>
          <button
            onClick={() => setMatchMode('room')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              matchMode === 'room' ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            친구 초대 방
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col justify-center items-center py-4 text-center">
          {foundRival ? (
            <div className="w-full p-6 bg-slate-950/70 border border-rose-500/50 rounded-2xl animate-pulse">
              <span className="text-xs font-bold text-rose-400 font-mono block mb-2">상대 매칭 완료!</span>
              <div className="flex items-center justify-center gap-6 my-4">
                <div className="text-center">
                  <span className="text-3xl block mb-1">{profile.avatar}</span>
                  <span className="text-xs font-bold text-sky-400">{profile.nickname}</span>
                </div>
                <span className="text-xl font-black text-rose-500 font-mono">VS</span>
                <div className="text-center">
                  <span className="text-3xl block mb-1">{foundRival.avatar}</span>
                  <span className="text-xs font-bold text-rose-400">{foundRival.nickname}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300">잠시 후 대전 챔버로 진입합니다...</p>
            </div>
          ) : isSearching ? (
            <div className="p-8 flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-base font-bold text-white mb-1">상대 플레이어 탐색 중...</h3>
              <p className="text-xs text-slate-400 font-mono">은하계 레이더 네트워크 스캔 중 (레이턴시: 18ms)</p>
            </div>
          ) : matchMode === 'quick' ? (
            <div className="w-full space-y-4">
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-left">
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  1v1 대전 배틀 룰
                </h4>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>3x 이상 범퍼 콤보 달성 시 상대방 필드로 방해 장애물 전송!</li>
                  <li>스타 링 수집 시 보너스 스코어 및 방어 실드 생성</li>
                  <li>공 3개 소진 시 패배 또는 제한 시간 내 최고 점수 획득자가 승리</li>
                </ul>
              </div>

              <button
                onClick={handleStartQuickSearch}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95"
              >
                매칭 시작 (Match Search)
              </button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                <label className="text-xs font-semibold text-slate-300 block mb-2 text-left">
                  친구 룸 코드 입력
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="예: PIN-4290"
                    maxLength={10}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-center text-sm focus:border-rose-500 focus:outline-none"
                  />
                  <button
                    onClick={handleJoinCustomRoom}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    참가
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                또는 내 친구 초대 코드를 친구에게 전달하여 방을 개설할 수 있습니다.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
