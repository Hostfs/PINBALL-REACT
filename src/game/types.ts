/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'STAGE_CLEAR';
export type GameMode = 'ARCADE' | 'BOUNCE_TOWER' | 'MULTIPLAYER';

export type SpaceCadetRank =
  | 'Cadet'
  | 'Ensign'
  | 'Lieutenant'
  | 'Commander'
  | 'Captain'
  | 'Fleet Admiral';

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  squashX: number;
  squashY: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
  inPlungerLane: boolean;
  isInvincible: boolean;
  invincibleTimer: number;
  hasShield: boolean;
  isDead: boolean;
}

export interface Flipper {
  pivotX: number;
  pivotY: number;
  length: number;
  baseWidth: number;
  tipWidth: number;
  angle: number;
  restAngle: number;
  activeAngle: number;
  angularVelocity: number;
  isLeft: boolean;
  isPressed: boolean;
}

export interface RoundBumper {
  id: string;
  x: number;
  y: number;
  radius: number;
  scoreValue: number;
  color: string;
  activeTimer: number;
  hitCount: number;
}

export interface Slingshot {
  id: string;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  kickNormal: { x: number; y: number };
  activeTimer: number;
}

export interface WallSegment {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  restitution: number;
  friction: number;
  color?: string;
  isRamp?: boolean;
}

export interface Trampoline {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  boostMultiplier: number;
  activeTimer: number;
}

export interface StarRing {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  pulseTimer: number;
}

export interface SpikeHazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PortalWarp {
  id: string;
  entry: { x: number; y: number; radius: number };
  exit: { x: number; y: number; angle: number; speed: number };
  activeTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
}

export interface Plunger {
  x: number;
  y: number;
  width: number;
  height: number;
  compression: number; // 0 to 1
  isCharging: boolean;
}

export interface BallSkin {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  cost: number;
  unlocked: boolean;
  icon: string;
}

export interface TableTheme {
  id: string;
  name: string;
  description: string;
  bgGradient: [string, string];
  wallColor: string;
  bumperColors: [string, string, string];
  flipperColor: string;
  gridColor: string;
  cost: number;
  unlocked: boolean;
}

export interface TrailStyle {
  id: string;
  name: string;
  particleType: 'circles' | 'stars' | 'sparks' | 'stream';
  color: string;
  cost: number;
  unlocked: boolean;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardCoins: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
}

export interface SeasonEvent {
  seasonNumber: number;
  title: string;
  daysRemaining: number;
  currentTier: number; // 0 to 4
  currentPoints: number;
  pointsForNextTier: number;
  tiers: Array<{
    name: string;
    pointsReq: number;
    reward: string;
    unlocked: boolean;
  }>;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  authProvider: 'google' | 'guest';
  email?: string;
  coins: number;
  xp: number;
  level: number;
  highScoreArcade: number;
  highestTowerStage: number;
  multiplayerWins: number;
  multiplayerMatches: number;
  selectedBallSkin: string;
  selectedTableTheme: string;
  selectedTrailStyle: string;
  soundVolume: number;
  bgmVolume: number;
  selectedBgmTrack: number; // 0, 1, 2
  unlockedSkins: string[];
  unlockedThemes: string[];
  unlockedTrails: string[];
  seasonPoints: number;
  lastDailyMissionDate: string;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  avatar: string;
  score: number;
  rankTitle: SpaceCadetRank;
  date: string;
  isUser?: boolean;
}

export interface MultiplayerRival {
  nickname: string;
  avatar: string;
  score: number;
  ballsLeft: number;
  status: string;
  comboCount: number;
  sentHazard?: string;
}
