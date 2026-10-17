/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhysicsState, PhysicsEngine } from './game/physics';
import { GameState, GameMode, SpaceCadetRank, UserProfile, MultiplayerRival } from './game/types';
import { storage } from './game/storage';
import { soundEngine } from './game/audio';
import { TOWER_STAGES } from './game/levels';
import { PinballCanvas } from './components/PinballCanvas';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CustomizerModal } from './components/CustomizerModal';
import { MissionsModal } from './components/MissionsModal';
import { ProfileModal } from './components/ProfileModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { PauseGameOverModal } from './components/PauseGameOverModal';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [missions, setMissions] = useState(() => storage.getMissions());
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('ARCADE');

  // Active Game HUD states
  const [score, setScore] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(3);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [ringsCollected, setRingsCollected] = useState(0);
  const [hasShield, setHasShield] = useState(true);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(() => soundEngine.getIsMuted());
  const [bgmTrack, setBgmTrack] = useState(0);

  // Controls state
  const [leftFlipperPressed, setLeftFlipperPressed] = useState(false);
  const [rightFlipperPressed, setRightFlipperPressed] = useState(false);
  const [plungerCharging, setPlungerCharging] = useState(false);

  // Modal visibility
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMultiplayerSetup, setShowMultiplayerSetup] = useState(false);

  // Multiplayer Match state
  const [currentRival, setCurrentRival] = useState<MultiplayerRival | null>(null);
  const [rivalScore, setRivalScore] = useState(0);
  const [lastGameResult, setLastGameResult] = useState<{ coinsEarned: number; xpEarned: number; wonMultiplayer: boolean }>({
    coinsEarned: 0,
    xpEarned: 0,
    wonMultiplayer: false,
  });

  // Isolated mutable physics state to avoid React re-rendering during 60fps loop
  const physicsStateRef = useRef<GamePhysicsState>(PhysicsEngine.createDefaultState(420, 680));

  // Determine Space Cadet Rank from score
  const getCadetRank = useCallback((pts: number): SpaceCadetRank => {
    if (pts >= 1500000) return 'Fleet Admiral';
    if (pts >= 750000) return 'Captain';
    if (pts >= 350000) return 'Commander';
    if (pts >= 150000) return 'Lieutenant';
    if (pts >= 50000) return 'Ensign';
    return 'Cadet';
  }, []);

  const cadetRank = getCadetRank(score);

  // Save profile updates
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    storage.saveProfile(updated);
  };

  // Claim Mission reward
  const handleClaimMission = (id: string) => {
    const res = storage.claimMissionReward(id);
    if (res) {
      soundEngine.playLevelClear();
      setMissions([...storage.getMissions()]);
      setProfile({ ...storage.getProfile() });
    }
  };

  // Initialize Physics State for mode/stage
  const initGameSession = useCallback(
    (mode: GameMode, stageIdx = 0) => {
      setGameMode(mode);
      setCurrentStageIndex(stageIdx);
      setScore(0);
      setBallsLeft(3);
      setComboCount(0);
      setMaxCombo(0);
      setRingsCollected(0);
      setHasShield(true);
      setRivalScore(0);

      const newState = PhysicsEngine.createDefaultState(420, 680);

      // If Bounce Tower Mode, customize elements from stage
      if (mode === 'BOUNCE_TOWER') {
        const stage = TOWER_STAGES[stageIdx] || TOWER_STAGES[0];
        newState.bumpers = [...stage.bumpers];
        newState.trampolines = [...stage.trampolines];
        newState.starRings = stage.starRings.map((r) => ({ ...r, collected: false }));
        newState.spikes = [...stage.spikes];
        newState.portals = [...stage.portals];
        newState.walls = [...newState.walls, ...stage.extraWalls];
      }

      physicsStateRef.current = newState;
      setGameState('PLAYING');

      // Start procedural music
      soundEngine.startBgm(mode === 'BOUNCE_TOWER' ? 1 : mode === 'MULTIPLAYER' ? 2 : 0);
    },
    []
  );

  // Score update callback from physics engine
  const handleScoreUpdate = useCallback(
    (pts: number, comboText?: string) => {
      setScore((prev) => {
        const next = prev + pts;
        storage.updateMissionProgress('mission_score', pts);
        return next;
      });

      const s = physicsStateRef.current;
      if (s) {
        setComboCount(s.comboCount);
        setMaxCombo((prev) => Math.max(prev, s.comboCount));
        if (s.comboCount >= 3) {
          storage.updateMissionProgress('mission_bumpers', 1);
        }
      }
    },
    []
  );

  // Star Ring collected
  const handleRingCollected = useCallback(() => {
    setRingsCollected((prev) => {
      const next = prev + 1;
      storage.updateMissionProgress('mission_rings', 1);

      // Check Tower stage clear condition
      if (gameMode === 'BOUNCE_TOWER') {
        const currentStage = TOWER_STAGES[currentStageIndex];
        if (currentStage && next >= currentStage.targetRings) {
          soundEngine.playLevelClear();
          setGameState('STAGE_CLEAR');
          const res = storage.recordGameResult(score + 10000, 'BOUNCE_TOWER');
          setProfile({ ...storage.getProfile() });
          setLastGameResult({ coinsEarned: res.coinsEarned, xpEarned: res.xpEarned, wonMultiplayer: false });
        }
      }
      return next;
    });
  }, [gameMode, currentStageIndex, score]);

  // Ball lost callback
  const handleBallLost = useCallback(() => {
    setBallsLeft((prev) => {
      const remaining = prev - 1;
      if (remaining <= 0) {
        // Game Over
        setGameState('GAME_OVER');
        const wonMulti = gameMode === 'MULTIPLAYER' && score >= rivalScore;
        const res = storage.recordGameResult(score, gameMode, wonMulti);
        if (gameMode === 'MULTIPLAYER') {
          storage.updateMissionProgress('mission_multiplayer', 1);
        }
        setProfile({ ...storage.getProfile() });
        setLastGameResult({
          coinsEarned: res.coinsEarned,
          xpEarned: res.xpEarned,
          wonMultiplayer: wonMulti,
        });
        return 0;
      } else {
        // Respawn ball on plunger
        setTimeout(() => {
          const s = physicsStateRef.current;
          if (s) {
            s.ball.x = 420 - 32 + 12;
            s.ball.y = 680 - 70;
            s.ball.vx = 0;
            s.ball.vy = 0;
            s.ball.inPlungerLane = true;
            s.ball.isDead = false;
            s.ball.hasShield = true;
            s.ball.isInvincible = true;
            s.ball.invincibleTimer = 60;
            setHasShield(true);
          }
        }, 600);
        return remaining;
      }
    });
  }, [gameMode, score, rivalScore]);

  // Simulated Multiplayer Rival score updates
  useEffect(() => {
    if (gameState !== 'PLAYING' || gameMode !== 'MULTIPLAYER' || !currentRival) return;

    const interval = setInterval(() => {
      setRivalScore((prev) => {
        const variance = Math.floor(1500 + Math.random() * 4000);
        return prev + variance;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [gameState, gameMode, currentRival]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === 'KeyZ' || e.code === 'ArrowLeft') {
        setLeftFlipperPressed(true);
      } else if (e.code === 'Slash' || e.code === 'ArrowRight') {
        setRightFlipperPressed(true);
      } else if (e.code === 'Space' || e.code === 'ArrowDown') {
        e.preventDefault();
        if (gameState === 'TITLE') {
          initGameSession(gameMode);
        } else if (gameState === 'PLAYING') {
          setPlungerCharging(true);
        }
      } else if (e.code === 'KeyX' || e.code === 'ArrowUp') {
        // Tilt / Nudge
        if (gameState === 'PLAYING') {
          handleNudge();
        }
      } else if (e.code === 'Escape') {
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyZ' || e.code === 'ArrowLeft') {
        setLeftFlipperPressed(false);
      } else if (e.code === 'Slash' || e.code === 'ArrowRight') {
        setRightFlipperPressed(false);
      } else if (e.code === 'Space' || e.code === 'ArrowDown') {
        setPlungerCharging(false);
      }
    };

    const handleBlur = () => {
      setLeftFlipperPressed(false);
      setRightFlipperPressed(false);
      setPlungerCharging(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, gameMode, initGameSession]);

  // Nudge / Tilt action
  const handleNudge = () => {
    const s = physicsStateRef.current;
    if (s && !s.ball.inPlungerLane) {
      soundEngine.playSlingshot();
      s.ball.vx += (Math.random() - 0.5) * 8;
      s.ball.vy -= 4.5;
      s.screenShake = 6;
    }
  };

  // Start Multiplayer match with rival
  const handleStartMultiplayerMatch = (rival: MultiplayerRival) => {
    setCurrentRival(rival);
    initGameSession('MULTIPLAYER');
  };

  return (
    <div className="relative w-full h-screen h-[100dvh] flex items-center justify-center bg-slate-950 overflow-hidden font-sans select-none">
      {/* Title Screen View */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStartGame={(mode) => {
            if (mode === 'MULTIPLAYER') {
              setShowMultiplayerSetup(true);
            } else {
              initGameSession(mode);
            }
          }}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenCustomizer={() => setShowCustomizer(true)}
          onOpenMissions={() => setShowMissions(true)}
          onOpenProfile={() => setShowProfile(true)}
          profile={profile}
          selectedMode={gameMode}
          onSelectMode={setGameMode}
        />
      )}

      {/* Active Playing or Paused Game View */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'STAGE_CLEAR' || gameState === 'GAME_OVER') && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Main 60fps Canvas */}
          <PinballCanvas
            physicsStateRef={physicsStateRef}
            ballSkinId={profile.selectedBallSkin}
            tableThemeId={
              gameMode === 'BOUNCE_TOWER'
                ? TOWER_STAGES[currentStageIndex]?.theme || profile.selectedTableTheme
                : profile.selectedTableTheme
            }
            trailStyleId={profile.selectedTrailStyle}
            isPaused={gameState !== 'PLAYING'}
            onScoreUpdate={handleScoreUpdate}
            onBallLost={handleBallLost}
            onRingCollected={handleRingCollected}
            leftFlipperPressed={leftFlipperPressed}
            rightFlipperPressed={rightFlipperPressed}
            plungerCharging={plungerCharging}
            onPlungerRelease={() => setPlungerCharging(false)}
          />

          {/* Low-Occlusion HUD Overlay */}
          <HUD
            score={score}
            highScore={profile.highScoreArcade}
            ballsLeft={ballsLeft}
            cadetRank={cadetRank}
            comboCount={comboCount}
            ringsCollected={ringsCollected}
            targetRings={gameMode === 'BOUNCE_TOWER' ? TOWER_STAGES[currentStageIndex]?.targetRings : undefined}
            hasShield={hasShield}
            isMuted={isMuted}
            bgmTrack={bgmTrack}
            onToggleMute={() => setIsMuted(soundEngine.toggleMute())}
            onCycleBgm={() => {
              const next = (bgmTrack + 1) % 3;
              setBgmTrack(next);
              soundEngine.setBgmTrack(next);
            }}
            onPause={() => setGameState('PAUSED')}
            onNudge={handleNudge}
            onLeftDown={() => setLeftFlipperPressed(true)}
            onLeftUp={() => setLeftFlipperPressed(false)}
            onRightDown={() => setRightFlipperPressed(true)}
            onRightUp={() => setRightFlipperPressed(false)}
            onPlungerDown={() => setPlungerCharging(true)}
            onPlungerUp={() => setPlungerCharging(false)}
            plungerCharging={plungerCharging}
            stageName={gameMode === 'BOUNCE_TOWER' ? TOWER_STAGES[currentStageIndex]?.name : undefined}
            isMultiplayer={gameMode === 'MULTIPLAYER'}
            rivalScore={rivalScore}
          />
        </div>
      )}

      {/* Pause / Game Over / Stage Clear Modals */}
      {(gameState === 'PAUSED' || gameState === 'GAME_OVER' || gameState === 'STAGE_CLEAR') && (
        <PauseGameOverModal
          type={gameState}
          score={score}
          highScore={profile.highScoreArcade}
          cadetRank={cadetRank}
          maxCombo={maxCombo}
          ringsCollected={ringsCollected}
          coinsEarned={lastGameResult.coinsEarned}
          xpEarned={lastGameResult.xpEarned}
          mode={gameMode}
          stageNumber={currentStageIndex + 1}
          isMultiplayerWon={lastGameResult.wonMultiplayer}
          onRestart={() => initGameSession(gameMode, currentStageIndex)}
          onResume={() => setGameState('PLAYING')}
          onHome={() => {
            soundEngine.stopBgm();
            setGameState('TITLE');
          }}
          onNextStage={() => {
            const nextStage = currentStageIndex + 1;
            if (nextStage < TOWER_STAGES.length) {
              initGameSession('BOUNCE_TOWER', nextStage);
            } else {
              setGameState('TITLE');
            }
          }}
        />
      )}

      {/* Auxiliary Modals */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        profile={profile}
      />

      <CustomizerModal
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      <MissionsModal
        isOpen={showMissions}
        onClose={() => setShowMissions(false)}
        missions={missions}
        onClaimMission={handleClaimMission}
        profile={profile}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      <MultiplayerModal
        isOpen={showMultiplayerSetup}
        onClose={() => setShowMultiplayerSetup(false)}
        profile={profile}
        onStartMultiplayerMatch={handleStartMultiplayerMatch}
      />
    </div>
  );
}
