/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoundBumper, Trampoline, StarRing, SpikeHazard, PortalWarp, WallSegment } from './types';

export interface StageConfig {
  id: number;
  name: string;
  subTitle: string;
  theme: string;
  targetRings: number;
  bumpers: RoundBumper[];
  trampolines: Trampoline[];
  starRings: StarRing[];
  spikes: SpikeHazard[];
  portals: PortalWarp[];
  extraWalls: WallSegment[];
}

export const TOWER_STAGES: StageConfig[] = [
  {
    id: 1,
    name: '1단계: 초원 입구',
    subTitle: '기본 트램펄린 반동과 첫 번째 스타 링 수집',
    theme: 'bounce_world',
    targetRings: 4,
    bumpers: [
      { id: 'b1', x: 190, y: 220, radius: 24, scoreValue: 500, color: '#10b981', activeTimer: 0, hitCount: 0 },
    ],
    trampolines: [
      { id: 't1', x: 190, y: 460, width: 50, height: 14, boostMultiplier: 1.8, activeTimer: 0 },
    ],
    starRings: [
      { id: 'r1', x: 110, y: 320, radius: 14, collected: false, pulseTimer: 0 },
      { id: 'r2', x: 270, y: 320, radius: 14, collected: false, pulseTimer: 1 },
      { id: 'r3', x: 190, y: 130, radius: 14, collected: false, pulseTimer: 2 },
      { id: 'r4', x: 190, y: 50, radius: 14, collected: false, pulseTimer: 3 },
    ],
    spikes: [],
    portals: [],
    extraWalls: [],
  },
  {
    id: 2,
    name: '2단계: 벽돌 플랫폼 통로',
    subTitle: '플랫폼 사이 튕김과 궤적 조절',
    theme: 'bounce_world',
    targetRings: 5,
    bumpers: [
      { id: 'b1', x: 130, y: 200, radius: 22, scoreValue: 600, color: '#f59e0b', activeTimer: 0, hitCount: 0 },
      { id: 'b2', x: 250, y: 200, radius: 22, scoreValue: 600, color: '#f59e0b', activeTimer: 0, hitCount: 0 },
    ],
    trampolines: [
      { id: 't1', x: 140, y: 450, width: 44, height: 12, boostMultiplier: 1.85, activeTimer: 0 },
      { id: 't2', x: 240, y: 450, width: 44, height: 12, boostMultiplier: 1.85, activeTimer: 0 },
    ],
    starRings: [
      { id: 'r1', x: 80, y: 300, radius: 14, collected: false, pulseTimer: 0 },
      { id: 'r2', x: 300, y: 300, radius: 14, collected: false, pulseTimer: 1 },
      { id: 'r3', x: 190, y: 280, radius: 14, collected: false, pulseTimer: 2 },
      { id: 'r4', x: 120, y: 110, radius: 14, collected: false, pulseTimer: 3 },
      { id: 'r5', x: 260, y: 110, radius: 14, collected: false, pulseTimer: 4 },
    ],
    spikes: [
      { id: 'sp1', x: 175, y: 360, width: 30, height: 12 },
    ],
    portals: [],
    extraWalls: [
      { p1: { x: 70, y: 340 }, p2: { x: 140, y: 340 }, restitution: 0.8, friction: 0.98, color: '#f59e0b' },
      { p1: { x: 240, y: 340 }, p2: { x: 310, y: 340 }, restitution: 0.8, friction: 0.98, color: '#f59e0b' },
    ],
  },
  {
    id: 3,
    name: '3단계: 스파이크 밸리',
    subTitle: '가시 함정을 피하며 스타 링을 수집하세요',
    theme: 'space_cadet',
    targetRings: 5,
    bumpers: [
      { id: 'b1', x: 190, y: 170, radius: 25, scoreValue: 800, color: '#06b6d4', activeTimer: 0, hitCount: 0 },
    ],
    trampolines: [
      { id: 't1', x: 190, y: 470, width: 48, height: 14, boostMultiplier: 2.0, activeTimer: 0 },
    ],
    starRings: [
      { id: 'r1', x: 70, y: 220, radius: 14, collected: false, pulseTimer: 0 },
      { id: 'r2', x: 310, y: 220, radius: 14, collected: false, pulseTimer: 1 },
      { id: 'r3', x: 190, y: 90, radius: 14, collected: false, pulseTimer: 2 },
      { id: 'r4', x: 130, y: 380, radius: 14, collected: false, pulseTimer: 3 },
      { id: 'r5', x: 250, y: 380, radius: 14, collected: false, pulseTimer: 4 },
    ],
    spikes: [
      { id: 'sp1', x: 60, y: 310, width: 32, height: 14 },
      { id: 'sp2', x: 288, y: 310, width: 32, height: 14 },
      { id: 'sp3', x: 170, y: 270, width: 40, height: 14 },
    ],
    portals: [],
    extraWalls: [],
  },
  {
    id: 4,
    name: '4단계: 하이퍼 범퍼 챔버',
    subTitle: '고반발 네온 범퍼 연속 타격과 콤보 러시',
    theme: 'cyberpunk',
    targetRings: 6,
    bumpers: [
      { id: 'b1', x: 135, y: 160, radius: 24, scoreValue: 1000, color: '#06b6d4', activeTimer: 0, hitCount: 0 },
      { id: 'b2', x: 245, y: 160, radius: 24, scoreValue: 1000, color: '#ec4899', activeTimer: 0, hitCount: 0 },
      { id: 'b3', x: 190, y: 240, radius: 26, scoreValue: 1500, color: '#8b5cf6', activeTimer: 0, hitCount: 0 },
    ],
    trampolines: [
      { id: 't1', x: 190, y: 440, width: 44, height: 12, boostMultiplier: 1.9, activeTimer: 0 },
    ],
    starRings: [
      { id: 'r1', x: 65, y: 130, radius: 14, collected: false, pulseTimer: 0 },
      { id: 'r2', x: 315, y: 130, radius: 14, collected: false, pulseTimer: 1 },
      { id: 'r3', x: 80, y: 330, radius: 14, collected: false, pulseTimer: 2 },
      { id: 'r4', x: 300, y: 330, radius: 14, collected: false, pulseTimer: 3 },
      { id: 'r5', x: 190, y: 90, radius: 14, collected: false, pulseTimer: 4 },
      { id: 'r6', x: 190, y: 350, radius: 14, collected: false, pulseTimer: 5 },
    ],
    spikes: [
      { id: 'sp1', x: 28, y: 240, width: 20, height: 14 },
      { id: 'sp2', x: 332, y: 240, width: 20, height: 14 },
    ],
    portals: [],
    extraWalls: [],
  },
  {
    id: 5,
    name: '5단계: 웜홀 오디세이',
    subTitle: '차원 포탈 워프를 활용한 미지의 궤적 도약',
    theme: 'space_cadet',
    targetRings: 5,
    bumpers: [
      { id: 'b1', x: 190, y: 200, radius: 24, scoreValue: 1200, color: '#fbbf24', activeTimer: 0, hitCount: 0 },
    ],
    trampolines: [
      { id: 't1', x: 100, y: 450, width: 40, height: 12, boostMultiplier: 1.8, activeTimer: 0 },
      { id: 't2', x: 280, y: 450, width: 40, height: 12, boostMultiplier: 1.8, activeTimer: 0 },
    ],
    starRings: [
      { id: 'r1', x: 50, y: 90, radius: 14, collected: false, pulseTimer: 0 },
      { id: 'r2', x: 330, y: 90, radius: 14, collected: false, pulseTimer: 1 },
      { id: 'r3', x: 190, y: 70, radius: 14, collected: false, pulseTimer: 2 },
      { id: 'r4', x: 140, y: 310, radius: 14, collected: false, pulseTimer: 3 },
      { id: 'r5', x: 240, y: 310, radius: 14, collected: false, pulseTimer: 4 },
    ],
    spikes: [
      { id: 'sp1', x: 170, y: 350, width: 40, height: 12 },
    ],
    portals: [
      {
        id: 'p1',
        entry: { x: 50, y: 150, radius: 16 },
        exit: { x: 320, y: 180, angle: -Math.PI * 0.7, speed: 14 },
        activeTimer: 0,
      },
      {
        id: 'p2',
        entry: { x: 330, y: 300, radius: 16 },
        exit: { x: 190, y: 110, angle: -Math.PI * 0.5, speed: 15 },
        activeTimer: 0,
      },
    ],
    extraWalls: [],
  },
  {
    id: 6,
    name: '6단계: 중력 왜곡 구역',
    subTitle: '초고속 트램펄린 캐스케이드와 회피 기술',
    theme: 'cyberpunk',
    targetRings: 6,
    bumpers: [
      { id: 'b1', x: 130, y: 180, radius: 22, scoreValue: 1200, color: '#f43f5e', activeTimer: 0, hitCount: 0 },
      { id: 'b2', x: 250, y: 180, radius: 22, scoreValue: 1200, color: '#06b6d4', activeTimer: 0, hitCount: 0 },
    ],
    trampolines: [
      { id: 't1', x: 190, y: 440, width: 52, height: 12, boostMultiplier: 2.1, activeTimer: 0 },
      { id: 't2', x: 190, y: 290, width: 36, height: 10, boostMultiplier: 1.7, activeTimer: 0 },
    ],
    starRings: [
      { id: 'r1', x: 80, y: 100, radius: 14, collected: false, pulseTimer: 0 },
      { id: 'r2', x: 300, y: 100, radius: 14, collected: false, pulseTimer: 1 },
      { id: 'r3', x: 190, y: 60, radius: 14, collected: false, pulseTimer: 2 },
      { id: 'r4', x: 60, y: 270, radius: 14, collected: false, pulseTimer: 3 },
      { id: 'r5', x: 320, y: 270, radius: 14, collected: false, pulseTimer: 4 },
      { id: 'r6', x: 190, y: 380, radius: 14, collected: false, pulseTimer: 5 },
    ],
    spikes: [
      { id: 'sp1', x: 120, y: 290, width: 24, height: 12 },
      { id: 'sp2', x: 236, y: 290, width: 24, height: 12 },
    ],
    portals: [],
    extraWalls: [],
  },
  {
    id: 7,
    name: '7단계: 성운 사령부',
    subTitle: '최상급 플리퍼 정밀 조작과 스타 링 컴플리트',
    theme: 'emerald_retro',
    targetRings: 7,
    bumpers: [
      { id: 'b1', x: 140, y: 160, radius: 24, scoreValue: 1500, color: '#eab308', activeTimer: 0, hitCount: 0 },
      { id: 'b2', x: 240, y: 160, radius: 24, scoreValue: 1500, color: '#22c55e', activeTimer: 0, hitCount: 0 },
      { id: 'b3', x: 190, y: 240, radius: 26, scoreValue: 2000, color: '#f97316', activeTimer: 0, hitCount: 0 },
    ],
    trampolines: [
      { id: 't1', x: 190, y: 460, width: 44, height: 12, boostMultiplier: 1.9, activeTimer: 0 },
    ],
    starRings: [
      { id: 'r1', x: 60, y: 80, radius: 14, collected: false, pulseTimer: 0 },
      { id: 'r2', x: 320, y: 80, radius: 14, collected: false, pulseTimer: 1 },
      { id: 'r3', x: 190, y: 80, radius: 14, collected: false, pulseTimer: 2 },
      { id: 'r4', x: 70, y: 230, radius: 14, collected: false, pulseTimer: 3 },
      { id: 'r5', x: 310, y: 230, radius: 14, collected: false, pulseTimer: 4 },
      { id: 'r6', x: 100, y: 370, radius: 14, collected: false, pulseTimer: 5 },
      { id: 'r7', x: 280, y: 370, radius: 14, collected: false, pulseTimer: 6 },
    ],
    spikes: [
      { id: 'sp1', x: 30, y: 310, width: 24, height: 12 },
      { id: 'sp2', x: 326, y: 310, width: 24, height: 12 },
    ],
    portals: [],
    extraWalls: [],
  },
  {
    id: 8,
    name: '8단계: 코스믹 피날레',
    subTitle: '전설의 함대 제독에게 바치는 극한의 핀볼 바운스',
    theme: 'space_cadet',
    targetRings: 8,
    bumpers: [
      { id: 'b1', x: 125, y: 150, radius: 24, scoreValue: 2500, color: '#fbbf24', activeTimer: 0, hitCount: 0 },
      { id: 'b2', x: 255, y: 150, radius: 24, scoreValue: 2500, color: '#06b6d4', activeTimer: 0, hitCount: 0 },
      { id: 'b3', x: 190, y: 220, radius: 28, scoreValue: 3500, color: '#ec4899', activeTimer: 0, hitCount: 0 },
    ],
    trampolines: [
      { id: 't1', x: 130, y: 440, width: 38, height: 12, boostMultiplier: 1.95, activeTimer: 0 },
      { id: 't2', x: 250, y: 440, width: 38, height: 12, boostMultiplier: 1.95, activeTimer: 0 },
    ],
    starRings: [
      { id: 'r1', x: 55, y: 70, radius: 14, collected: false, pulseTimer: 0 },
      { id: 'r2', x: 325, y: 70, radius: 14, collected: false, pulseTimer: 1 },
      { id: 'r3', x: 190, y: 55, radius: 14, collected: false, pulseTimer: 2 },
      { id: 'r4', x: 60, y: 210, radius: 14, collected: false, pulseTimer: 3 },
      { id: 'r5', x: 320, y: 210, radius: 14, collected: false, pulseTimer: 4 },
      { id: 'r6', x: 190, y: 320, radius: 14, collected: false, pulseTimer: 5 },
      { id: 'r7', x: 100, y: 390, radius: 14, collected: false, pulseTimer: 6 },
      { id: 'r8', x: 280, y: 390, radius: 14, collected: false, pulseTimer: 7 },
    ],
    spikes: [
      { id: 'sp1', x: 165, y: 380, width: 50, height: 14 },
      { id: 'sp2', x: 24, y: 270, width: 22, height: 14 },
      { id: 'sp3', x: 334, y: 270, width: 22, height: 14 },
    ],
    portals: [
      {
        id: 'p1',
        entry: { x: 45, y: 130, radius: 16 },
        exit: { x: 335, y: 130, angle: -Math.PI * 0.75, speed: 16 },
        activeTimer: 0,
      },
    ],
    extraWalls: [],
  },
];
