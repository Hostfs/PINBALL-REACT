/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Play, Trophy, Sparkles } from 'lucide-react';
import { GameMode, SpaceCadetRank } from '../game/types';

interface PauseGameOverModalProps {
  type: 'PAUSED' | 'GAME_OVER' | 'STAGE_CLEAR';
  score: number;
  highScore: number;
  cadetRank: SpaceCadetRank;
  maxCombo: number;
  ringsCollected: number;
  coinsEarned: number;
  xpEarned: number;
  mode: GameMode;
  stageNumber?: number;
  isMultiplayerWon?: boolean;
  onRestart: () => void;
  onResume: () => void;
  onHome: () => void;
  onNextStage?: () => void;
}

export const PauseGameOverModal: React.FC<PauseGameOverModalProps> = ({
  type,
  score,
  highScore,
  cadetRank,
  maxCombo,
  ringsCollected,
  coinsEarned,
  xpEarned,
  mode,
  stageNumber,
  isMultiplayerWon,
  onRestart,
  onResume,
  onHome,
  onNextStage,
}) => {
  const isNewHighScore = score > 0 && score >= highScore;

  useEffect(() => {
    if ((type === 'GAME_OVER' && isNewHighScore) || type === 'STAGE_CLEAR' || isMultiplayerWon) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#ec4899', '#22c55e'],
        });
      } catch {
        // Ignored
      }
    }
  }, [type, isNewHighScore, isMultiplayerWon]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col text-center">
        {/* Title Indicator */}
        {type === 'PAUSED' && (
          <h2 className="text-xl font-bold text-white mb-2">게임 일시정지</h2>
        )}
        {type === 'STAGE_CLEAR' && (
          <div>
            <span className="text-3xl mb-1 block">🏆</span>
            <h2 className="text-xl font-black text-amber-400 mb-1">{stageNumber}단계 클리어!</h2>
            <p className="text-xs text-slate-300 mb-3">모든 스타 링을 수집하고 워프 포탈을 통과했습니다.</p>
          </div>
        )}
        {type === 'GAME_OVER' && (
          <div>
            {mode === 'MULTIPLAYER' ? (
              <div>
                <span className="text-3xl mb-1 block">{isMultiplayerWon ? '👑' : '💥'}</span>
                <h2 className={`text-xl font-black mb-1 ${isMultiplayerWon ? 'text-amber-400' : 'text-rose-400'}`}>
                  {isMultiplayerWon ? '1v1 대전 승리!' : '1v1 대전 종료'}
                </h2>
                <p className="text-xs text-slate-300 mb-3">
                  {isMultiplayerWon ? '라이벌을 압도하고 승리 보상을 획득했습니다!' : '치열한 접전 끝에 경기가 종료되었습니다.'}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-3xl mb-1 block">💫</span>
                <h2 className="text-xl font-black text-white mb-1">게임 오버</h2>
                <p className="text-xs text-slate-400 mb-3">공이 드레인 존으로 떨어졌습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* Score & Rank Highlights */}
        <div className="my-2 p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
          {isNewHighScore && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 py-1 rounded-md border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              신기록 달성 (NEW HIGH SCORE!)
            </div>
          )}

          <div>
            <span className="text-xs text-slate-400 font-mono block">최종 점수</span>
            <span className="text-2xl font-black font-mono text-white tabular-nums">
              {score.toLocaleString()} <span className="text-sm font-normal text-sky-400">pts</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-left text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">부여된 생도 계급</span>
              <span className="font-semibold text-sky-300">{cadetRank}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">최대 연속 콤보</span>
              <span className="font-semibold text-amber-400">{maxCombo}x 콤보</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">수집한 스타 링</span>
              <span className="font-semibold text-yellow-300">★ {ringsCollected}개</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">획득 코인 / XP</span>
              <span className="font-semibold text-emerald-400 font-mono">
                +{coinsEarned}🪙 / +{xpEarned}XP
              </span>
            </div>
          </div>
        </div>

        {/* Buttons list */}
        <div className="mt-4 space-y-2">
          {type === 'PAUSED' && (
            <button
              onClick={onResume}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              계속하기 (Resume)
            </button>
          )}

          {type === 'STAGE_CLEAR' && onNextStage && (
            <button
              onClick={onNextStage}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              다음 단계로 전진
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다시 플레이 (Play Again)
          </button>

          <button
            onClick={onHome}
            className="w-full py-2 text-slate-400 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            메인 메뉴로 이동
          </button>
        </div>
      </div>
    </div>
  );
};
