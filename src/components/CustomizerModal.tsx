/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Palette, Check, Lock, Sparkles } from 'lucide-react';
import { BALL_SKINS, TABLE_THEMES, TRAIL_STYLES } from '../game/themes';
import { UserProfile } from '../game/types';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'ball' | 'theme' | 'trail'>('ball');

  if (!isOpen) return null;

  const handleSelectBall = (skinId: string) => {
    const skin = BALL_SKINS.find((b) => b.id === skinId);
    if (!skin) return;

    const isUnlocked = profile.unlockedSkins.includes(skinId);
    if (isUnlocked) {
      onUpdateProfile({ ...profile, selectedBallSkin: skinId });
    } else if (profile.coins >= skin.cost) {
      onUpdateProfile({
        ...profile,
        coins: profile.coins - skin.cost,
        unlockedSkins: [...profile.unlockedSkins, skinId],
        selectedBallSkin: skinId,
      });
    }
  };

  const handleSelectTheme = (themeId: string) => {
    const theme = TABLE_THEMES.find((t) => t.id === themeId);
    if (!theme) return;

    const isUnlocked = profile.unlockedThemes.includes(themeId);
    if (isUnlocked) {
      onUpdateProfile({ ...profile, selectedTableTheme: themeId });
    } else if (profile.coins >= theme.cost) {
      onUpdateProfile({
        ...profile,
        coins: profile.coins - theme.cost,
        unlockedThemes: [...profile.unlockedThemes, themeId],
        selectedTableTheme: themeId,
      });
    }
  };

  const handleSelectTrail = (trailId: string) => {
    const trail = TRAIL_STYLES.find((tr) => tr.id === trailId);
    if (!trail) return;

    const isUnlocked = profile.unlockedTrails.includes(trailId);
    if (isUnlocked) {
      onUpdateProfile({ ...profile, selectedTrailStyle: trailId });
    } else if (profile.coins >= trail.cost) {
      onUpdateProfile({
        ...profile,
        coins: profile.coins - trail.cost,
        unlockedTrails: [...profile.unlockedTrails, trailId],
        selectedTrailStyle: trailId,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">테마 & 스킨 커스터마이징</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              🪙 {profile.coins.toLocaleString()}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl my-4 border border-slate-800/80">
          <button
            onClick={() => setActiveTab('ball')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'ball' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔴</span>
            공 스킨 (Ball)
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'theme' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            테이블 테마 (Table)
          </button>
          <button
            onClick={() => setActiveTab('trail')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'trail' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            궤적 이펙트 (Trail)
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'ball' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BALL_SKINS.map((skin) => {
                const isSelected = profile.selectedBallSkin === skin.id;
                const isUnlocked = profile.unlockedSkins.includes(skin.id);
                const canAfford = profile.coins >= skin.cost;

                return (
                  <div
                    key={skin.id}
                    onClick={() => handleSelectBall(skin.id)}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500'
                        : isUnlocked
                        ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/30 border-slate-800/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{skin.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {skin.name}
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                          </h3>
                          <p className="text-[11px] text-slate-400 leading-tight">{skin.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: skin.primaryColor }}
                        />
                        <span className="text-[10px] text-slate-500 font-mono">발광 컬러</span>
                      </div>

                      {isSelected ? (
                        <span className="text-purple-400 font-bold text-[11px]">장착 중</span>
                      ) : isUnlocked ? (
                        <span className="text-slate-300 font-medium text-[11px] hover:text-white">장착하기</span>
                      ) : (
                        <span
                          className={`font-mono font-bold text-[11px] flex items-center gap-1 ${
                            canAfford ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          🪙 {skin.cost.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TABLE_THEMES.map((theme) => {
                const isSelected = profile.selectedTableTheme === theme.id;
                const isUnlocked = profile.unlockedThemes.includes(theme.id);
                const canAfford = profile.coins >= theme.cost;

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500'
                        : isUnlocked
                        ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/30 border-slate-800/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {theme.name}
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2 leading-tight">{theme.description}</p>
                    </div>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1">
                        {theme.bumperColors.map((c, i) => (
                          <span
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      {isSelected ? (
                        <span className="text-purple-400 font-bold text-[11px]">적용 중</span>
                      ) : isUnlocked ? (
                        <span className="text-slate-300 font-medium text-[11px] hover:text-white">적용하기</span>
                      ) : (
                        <span
                          className={`font-mono font-bold text-[11px] flex items-center gap-1 ${
                            canAfford ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          🪙 {theme.cost.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'trail' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRAIL_STYLES.map((trail) => {
                const isSelected = profile.selectedTrailStyle === trail.id;
                const isUnlocked = profile.unlockedTrails.includes(trail.id);
                const canAfford = profile.coins >= trail.cost;

                return (
                  <div
                    key={trail.id}
                    onClick={() => handleSelectTrail(trail.id)}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500'
                        : isUnlocked
                        ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/30 border-slate-800/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-1">
                        {trail.name}
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">이펙트 타입: {trail.particleType}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-[0_0_8px]"
                        style={{ backgroundColor: trail.color, color: trail.color }}
                      />

                      {isSelected ? (
                        <span className="text-purple-400 font-bold text-[11px]">사용 중</span>
                      ) : isUnlocked ? (
                        <span className="text-slate-300 font-medium text-[11px] hover:text-white">사용하기</span>
                      ) : (
                        <span
                          className={`font-mono font-bold text-[11px] flex items-center gap-1 ${
                            canAfford ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          🪙 {trail.cost.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
