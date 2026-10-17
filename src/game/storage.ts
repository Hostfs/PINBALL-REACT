/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, DailyMission, SeasonEvent, LeaderboardEntry } from './types';

const STORAGE_KEY = 'space_bounce_pinball_user_v1';
const CHECKSUM_SALT = 'XP_PINBALL_BOUNCE_2026_SECURITY';

function generateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_MISSIONS: DailyMission[] = [
  {
    id: 'mission_bumpers',
    title: '트리플 범퍼 콤보',
    description: '한 공으로 원형 범퍼를 15회 이상 연속 타격하기',
    target: 15,
    progress: 0,
    rewardCoins: 250,
    rewardXp: 120,
    completed: false,
    claimed: false,
  },
  {
    id: 'mission_rings',
    title: '스타 링 수집가',
    description: '스테이지 또는 아케이드 필드의 골든 스타 링 8개 수집',
    target: 8,
    progress: 0,
    rewardCoins: 300,
    rewardXp: 150,
    completed: false,
    claimed: false,
  },
  {
    id: 'mission_score',
    title: '생도 승급 시험',
    description: '단일 게임에서 100,000점 이상 달성하기',
    target: 100000,
    progress: 0,
    rewardCoins: 500,
    rewardXp: 250,
    completed: false,
    claimed: false,
  },
  {
    id: 'mission_hyperspace',
    title: '하이퍼스페이스 워프',
    description: '상단 가속 램프 루프 또는 웜홀 3회 통과',
    target: 3,
    progress: 0,
    rewardCoins: 400,
    rewardXp: 200,
    completed: false,
    claimed: false,
  },
  {
    id: 'mission_multiplayer',
    title: '은하계 라이벌전',
    description: '실시간 1v1 대전 1회 플레이 완료하기',
    target: 1,
    progress: 0,
    rewardCoins: 350,
    rewardXp: 180,
    completed: false,
    claimed: false,
  },
];

const INITIAL_PROFILE: UserProfile = {
  id: 'cadet_' + Math.floor(1000 + Math.random() * 9000),
  nickname: '은하계 생도',
  avatar: '🚀',
  authProvider: 'guest',
  coins: 800,
  xp: 150,
  level: 1,
  highScoreArcade: 45000,
  highestTowerStage: 1,
  multiplayerWins: 2,
  multiplayerMatches: 3,
  selectedBallSkin: 'chrome_steel',
  selectedTableTheme: 'space_cadet',
  selectedTrailStyle: 'trail_standard',
  soundVolume: 0.7,
  bgmVolume: 0.4,
  selectedBgmTrack: 0,
  unlockedSkins: ['chrome_steel', 'bounce_red'],
  unlockedThemes: ['space_cadet'],
  unlockedTrails: ['trail_standard'],
  seasonPoints: 320,
  lastDailyMissionDate: getTodayString(),
};

export const INITIAL_SEASON: SeasonEvent = {
  seasonNumber: 1,
  title: '시즌 1: 오리온 성운 챔피언십',
  daysRemaining: 18,
  currentTier: 1,
  currentPoints: 320,
  pointsForNextTier: 600,
  tiers: [
    { name: '브론즈 생도', pointsReq: 100, reward: '🪙 500 코인', unlocked: true },
    { name: '실버 파일럿', pointsReq: 300, reward: '✨ 스타더스트 잔상', unlocked: true },
    { name: '골드 사령관', pointsReq: 600, reward: '⚡ 네온 사이버 펄스 볼', unlocked: false },
    { name: '플래티넘 제독', pointsReq: 1000, reward: '🌌 사이버펑크 2099 테이블', unlocked: false },
    { name: '코스믹 마스터', pointsReq: 1600, reward: '👑 한정판 골든 솔라 혜성 & 칭호', unlocked: false },
  ],
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, nickname: 'SpaceMarshal_Kim', avatar: '👨‍🚀', score: 2854200, rankTitle: 'Fleet Admiral', date: '오늘' },
  { rank: 2, nickname: 'BounceMaster99', avatar: '👾', score: 2198000, rankTitle: 'Fleet Admiral', date: '어제' },
  { rank: 3, nickname: 'RetroPinballer', avatar: '⭐', score: 1782400, rankTitle: 'Captain', date: '3일 전' },
  { rank: 4, nickname: 'PixelBouncePro', avatar: '☄️', score: 1340000, rankTitle: 'Captain', date: '오늘' },
  { rank: 5, nickname: 'CosmicNova', avatar: '🚀', score: 984500, rankTitle: 'Commander', date: '2일 전' },
  { rank: 6, nickname: 'XP_Cadet_Legend', avatar: '🛸', score: 720000, rankTitle: 'Lieutenant', date: '5일 전' },
  { rank: 7, nickname: 'SolarFlare', avatar: '🔥', score: 560000, rankTitle: 'Lieutenant', date: '오늘' },
  { rank: 8, nickname: 'StarlightChaser', avatar: '✨', score: 430000, rankTitle: 'Ensign', date: '4일 전' },
];

export class StorageService {
  private profile: UserProfile;
  private missions: DailyMission[];

  constructor() {
    this.profile = this.loadProfile();
    this.missions = this.loadMissions();
  }

  private loadProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Security check
        const storedHash = localStorage.getItem(`${STORAGE_KEY}_hash`);
        const expectedHash = generateHash(JSON.stringify(parsed) + CHECKSUM_SALT);
        if (storedHash === expectedHash) {
          return { ...INITIAL_PROFILE, ...parsed };
        }
      }
    } catch {
      // Fallback to default
    }
    return { ...INITIAL_PROFILE };
  }

  public saveProfile(profile: UserProfile) {
    this.profile = profile;
    try {
      const serialized = JSON.stringify(profile);
      localStorage.setItem(STORAGE_KEY, serialized);
      const hash = generateHash(serialized + CHECKSUM_SALT);
      localStorage.setItem(`${STORAGE_KEY}_hash`, hash);
    } catch {
      // Storage quota or policy
    }
  }

  public getProfile(): UserProfile {
    return this.profile;
  }

  private loadMissions(): DailyMission[] {
    const today = getTodayString();
    try {
      const missionsData = localStorage.getItem('pinball_daily_missions');
      const savedDate = localStorage.getItem('pinball_daily_missions_date');
      if (missionsData && savedDate === today) {
        return JSON.parse(missionsData);
      }
    } catch {
      // Fallback
    }
    localStorage.setItem('pinball_daily_missions_date', today);
    this.saveMissions(INITIAL_MISSIONS);
    return INITIAL_MISSIONS;
  }

  public saveMissions(missions: DailyMission[]) {
    this.missions = missions;
    try {
      localStorage.setItem('pinball_daily_missions', JSON.stringify(missions));
    } catch {
      // Ignored
    }
  }

  public getMissions(): DailyMission[] {
    return this.missions;
  }

  public updateMissionProgress(id: string, amount: number) {
    const updated = this.missions.map((m) => {
      if (m.id === id && !m.completed) {
        const newProgress = Math.min(m.target, m.progress + amount);
        return {
          ...m,
          progress: newProgress,
          completed: newProgress >= m.target,
        };
      }
      return m;
    });
    this.saveMissions(updated);
  }

  public claimMissionReward(id: string): { coins: number; xp: number } | null {
    const mission = this.missions.find((m) => m.id === id);
    if (!mission || !mission.completed || mission.claimed) return null;

    mission.claimed = true;
    this.saveMissions([...this.missions]);

    // Add reward to profile
    const p = { ...this.profile };
    p.coins += mission.rewardCoins;
    p.xp += mission.rewardXp;
    p.seasonPoints += Math.floor(mission.rewardXp / 2);
    // Level up check
    const xpNeeded = p.level * 300;
    if (p.xp >= xpNeeded) {
      p.level += 1;
      p.xp -= xpNeeded;
      p.coins += p.level * 100;
    }
    this.saveProfile(p);
    return { coins: mission.rewardCoins, xp: mission.rewardXp };
  }

  public recordGameResult(score: number, mode: 'ARCADE' | 'BOUNCE_TOWER' | 'MULTIPLAYER', wonMultiplayer = false) {
    const p = { ...this.profile };
    let coinsEarned = Math.floor(score / 500);
    const xpEarned = Math.floor(score / 250) + 50;

    if (mode === 'ARCADE') {
      if (score > p.highScoreArcade) {
        p.highScoreArcade = score;
      }
    } else if (mode === 'BOUNCE_TOWER') {
      p.highestTowerStage = Math.max(p.highestTowerStage, 2);
    } else if (mode === 'MULTIPLAYER') {
      p.multiplayerMatches += 1;
      if (wonMultiplayer) {
        p.multiplayerWins += 1;
        coinsEarned += 300;
      }
    }

    p.coins += coinsEarned;
    p.xp += xpEarned;
    p.seasonPoints += Math.floor(score / 1000);

    // Level up check
    while (p.xp >= p.level * 300) {
      p.xp -= p.level * 300;
      p.level += 1;
      p.coins += p.level * 150;
    }

    this.saveProfile(p);
    return { coinsEarned, xpEarned, newHigh: score > p.highScoreArcade };
  }
}

export const storage = new StorageService();
