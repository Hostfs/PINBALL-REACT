/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckSquare, Sparkles, Gift, Check, Clock } from 'lucide-react';
import { DailyMission, SeasonEvent, UserProfile } from '../game/types';
import { storage, INITIAL_SEASON } from '../game/storage';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: DailyMission[];
  onClaimMission: (id: string) => void;
  profile: UserProfile;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  missions,
  onClaimMission,
  profile,
}) => {
  const [tab, setTab] = useState<'daily' | 'season'>('daily');
  const [season, setSeason] = useState<SeasonEvent>(INITIAL_SEASON);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">일일 미션 & 시즌 랭킹 이벤트</h2>
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
            onClick={() => setTab('daily')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'daily' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            일일 미션
          </button>
          <button
            onClick={() => setTab('season')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'season' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            시즌 1 이벤트 패스
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tab === 'daily' ? (
            missions.map((mission) => {
              const progressPct = Math.min(100, Math.round((mission.progress / mission.target) * 100));

              return (
                <div
                  key={mission.id}
                  className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white">{mission.title}</h3>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        +{mission.rewardCoins} 코인
                      </span>
                      <span className="text-[10px] font-mono text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded">
                        +{mission.rewardXp} XP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{mission.description}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-sky-400 h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
                      <span>진행률 {progressPct}%</span>
                      <span>
                        {mission.progress.toLocaleString()} / {mission.target.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <div>
                    {mission.claimed ? (
                      <span className="px-3 py-1.5 text-xs text-slate-500 bg-slate-800/50 rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        수령 완료
                      </span>
                    ) : mission.completed ? (
                      <button
                        onClick={() => onClaimMission(mission.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        보상 받기
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 text-xs text-slate-500 font-mono">진행 중</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-4">
              {/* Season Banner */}
              <div className="p-4 bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-800/60 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{season.title}</h3>
                  <span className="text-xs font-mono text-sky-400">잔여: 18일</span>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  게임을 플레이하고 시즌 점수를 모아 한정판 스킨과 테이블 테마를 해금하세요!
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>내 시즌 포인트: <strong className="text-amber-400">{profile.seasonPoints} SP</strong></span>
                  <span>다음 등급까지: {Math.max(0, season.pointsForNextTier - profile.seasonPoints)} SP</span>
                </div>
              </div>

              {/* Tiers List */}
              <div className="space-y-2.5">
                {season.tiers.map((tier, idx) => {
                  const isReached = profile.seasonPoints >= tier.pointsReq;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isReached
                          ? 'bg-slate-950/60 border-indigo-500/50'
                          : 'bg-slate-950/30 border-slate-800/50 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                            isReached ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          T{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{tier.name}</h4>
                          <span className="text-xs text-amber-300 font-mono">{tier.reward}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400 block">
                          필요: {tier.pointsReq} SP
                        </span>
                        {isReached ? (
                          <span className="text-[11px] font-bold text-emerald-400">달성 완료</span>
                        ) : (
                          <span className="text-[11px] text-slate-500">잠김</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
