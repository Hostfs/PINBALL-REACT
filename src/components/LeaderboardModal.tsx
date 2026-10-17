/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trophy, Medal, Users, Calendar } from 'lucide-react';
import { MOCK_LEADERBOARD } from '../game/storage';
import { UserProfile } from '../game/types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, profile }) => {
  const [tab, setTab] = useState<'global' | 'friends' | 'season'>('global');

  if (!isOpen) return null;

  // Insert user into mock leaderboard based on score
  const allEntries = [...MOCK_LEADERBOARD];
  const userEntry = {
    rank: 0,
    nickname: `${profile.nickname} (나)`,
    avatar: profile.avatar,
    score: profile.highScoreArcade,
    rankTitle: profile.highScoreArcade > 1500000 ? 'Fleet Admiral' : profile.highScoreArcade > 750000 ? 'Captain' : 'Cadet' as const,
    date: '오늘',
    isUser: true,
  };

  const combined = [...allEntries, userEntry]
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const displayedList = tab === 'friends'
    ? combined.slice(0, 5)
    : tab === 'season'
    ? combined.slice(0, 8)
    : combined.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">명예의 전당 (순위 시스템)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl my-4 border border-slate-800/80">
          <button
            onClick={() => setTab('global')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'global' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            글로벌 랭킹
          </button>
          <button
            onClick={() => setTab('season')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'season' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            시즌 1 랭킹
          </button>
          <button
            onClick={() => setTab('friends')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'friends' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            친구 대전 순위
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {displayedList.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rankBadgeColor =
              entry.rank === 1
                ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                : entry.rank === 2
                ? 'text-slate-300 bg-slate-300/10 border-slate-300/30'
                : entry.rank === 3
                ? 'text-amber-600 bg-amber-600/10 border-amber-600/30'
                : 'text-slate-500 bg-slate-800/50 border-slate-800';

            return (
              <div
                key={entry.rank + entry.nickname}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  entry.isUser
                    ? 'bg-sky-950/40 border-sky-500/60 ring-1 ring-sky-500/30'
                    : 'bg-slate-950/40 border-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold font-mono ${rankBadgeColor}`}
                  >
                    {isTop3 ? <Medal className="w-4 h-4" /> : entry.rank}
                  </span>
                  <span className="text-xl">{entry.avatar}</span>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${entry.isUser ? 'text-sky-300 font-bold' : 'text-slate-200'}`}>
                      {entry.nickname}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>{entry.rankTitle}</span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.date}</span>
                    </div>
                  </div>
                </div>

                <span className="text-sm sm:text-base font-bold font-mono text-white tabular-nums">
                  {entry.score.toLocaleString()} <span className="text-xs text-sky-400">pts</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>내 최고 기록: <strong className="text-white font-mono">{profile.highScoreArcade.toLocaleString()} pts</strong></span>
          <span>시즌 종료까지 18일</span>
        </div>
      </div>
    </div>
  );
};
