/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Ball,
  Flipper,
  RoundBumper,
  Slingshot,
  WallSegment,
  Trampoline,
  StarRing,
  SpikeHazard,
  PortalWarp,
  Particle,
  FloatingText,
  Plunger,
} from './types';
import { soundEngine } from './audio';

export interface GamePhysicsState {
  ball: Ball;
  leftFlipper: Flipper;
  rightFlipper: Flipper;
  bumpers: RoundBumper[];
  slingshots: Slingshot[];
  walls: WallSegment[];
  trampolines: Trampoline[];
  starRings: StarRing[];
  spikes: SpikeHazard[];
  portals: PortalWarp[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  plunger: Plunger;
  screenShake: number;
  comboCount: number;
  lastHitTime: number;
}

export class PhysicsEngine {
  public static readonly GRAVITY = 0.42;
  public static readonly BALL_RADIUS = 10;
  public static readonly FLIPPER_LENGTH = 72;
  public static readonly FLIPPER_SPEED = 0.28;
  public static readonly SUB_STEPS = 4;

  public static createDefaultState(tableWidth = 420, tableHeight = 680): GamePhysicsState {
    const plungerX = tableWidth - 32;
    const plungerWidth = 24;

    const ball: Ball = {
      x: plungerX + plungerWidth / 2,
      y: tableHeight - 70,
      vx: 0,
      vy: 0,
      radius: this.BALL_RADIUS,
      squashX: 1,
      squashY: 1,
      trail: [],
      inPlungerLane: true,
      isInvincible: false,
      invincibleTimer: 0,
      hasShield: true,
      isDead: false,
    };

    const flipperY = tableHeight - 92;
    const flipperLeftX = 110;
    const flipperRightX = tableWidth - 110 - plungerWidth;

    const leftFlipper: Flipper = {
      pivotX: flipperLeftX,
      pivotY: flipperY,
      length: this.FLIPPER_LENGTH,
      baseWidth: 14,
      tipWidth: 7,
      angle: 0.45,
      restAngle: 0.45,
      activeAngle: -0.58,
      angularVelocity: 0,
      isLeft: true,
      isPressed: false,
    };

    const rightFlipper: Flipper = {
      pivotX: flipperRightX,
      pivotY: flipperY,
      length: this.FLIPPER_LENGTH,
      baseWidth: 14,
      tipWidth: 7,
      angle: Math.PI - 0.45,
      restAngle: Math.PI - 0.45,
      activeAngle: Math.PI + 0.58,
      angularVelocity: 0,
      isLeft: false,
      isPressed: false,
    };

    // 3 iconic XP Space Cadet circular bumpers
    const bumpers: RoundBumper[] = [
      { id: 'b1', x: 145, y: 175, radius: 24, scoreValue: 500, color: '#fbbf24', activeTimer: 0, hitCount: 0 },
      { id: 'b2', x: 235, y: 175, radius: 24, scoreValue: 500, color: '#06b6d4', activeTimer: 0, hitCount: 0 },
      { id: 'b3', x: 190, y: 245, radius: 25, scoreValue: 1000, color: '#ec4899', activeTimer: 0, hitCount: 0 },
    ];

    // Slingshots
    const slingshots: Slingshot[] = [
      {
        id: 's_left',
        p1: { x: 70, y: flipperY - 110 },
        p2: { x: 102, y: flipperY - 20 },
        kickNormal: { x: 0.85, y: -0.52 },
        activeTimer: 0,
      },
      {
        id: 's_right',
        p1: { x: tableWidth - plungerWidth - 70, y: flipperY - 110 },
        p2: { x: tableWidth - plungerWidth - 102, y: flipperY - 20 },
        kickNormal: { x: -0.85, y: -0.52 },
        activeTimer: 0,
      },
    ];

    // Perimeter and lane walls
    const playW = tableWidth - plungerWidth - 8;
    const walls: WallSegment[] = [
      // Left outer wall
      { p1: { x: 16, y: 120 }, p2: { x: 16, y: tableHeight - 120 }, restitution: 0.7, friction: 0.99 },
      // Top curved arc approximation
      { p1: { x: 16, y: 120 }, p2: { x: 60, y: 50 }, restitution: 0.75, friction: 0.99 },
      { p1: { x: 60, y: 50 }, p2: { x: 130, y: 20 }, restitution: 0.75, friction: 0.99 },
      { p1: { x: 130, y: 20 }, p2: { x: playW - 60, y: 20 }, restitution: 0.75, friction: 0.99 },
      { p1: { x: playW - 60, y: 20 }, p2: { x: tableWidth - 16, y: 50 }, restitution: 0.8, friction: 0.99 },
      // Plunger separator wall
      { p1: { x: playW, y: 90 }, p2: { x: playW, y: tableHeight - 20 }, restitution: 0.65, friction: 0.99 },
      // Plunger outer right wall
      { p1: { x: tableWidth - 8, y: 50 }, p2: { x: tableWidth - 8, y: tableHeight - 20 }, restitution: 0.7, friction: 0.99 },
      // Left bottom guide to flipper
      { p1: { x: 16, y: tableHeight - 120 }, p2: { x: flipperLeftX, y: flipperY + 10 }, restitution: 0.65, friction: 0.98 },
      // Right bottom guide to flipper
      { p1: { x: playW, y: tableHeight - 120 }, p2: { x: flipperRightX, y: flipperY + 10 }, restitution: 0.65, friction: 0.98 },
      // Upper hyperspace guide curve
      { p1: { x: 80, y: 100 }, p2: { x: 110, y: 140 }, restitution: 0.85, friction: 0.99, isRamp: true },
      { p1: { x: 270, y: 140 }, p2: { x: 300, y: 100 }, restitution: 0.85, friction: 0.99, isRamp: true },
    ];

    // 공튀기기 (Bounce) elements: Trampolines, Star Rings, Spikes
    const trampolines: Trampoline[] = [
      { id: 't1', x: 190, y: 440, width: 44, height: 12, boostMultiplier: 1.85, activeTimer: 0 },
    ];

    const starRings: StarRing[] = [
      { id: 'r1', x: 75, y: 190, radius: 14, collected: false, pulseTimer: 0 },
      { id: 'r2', x: 190, y: 115, radius: 14, collected: false, pulseTimer: 1 },
      { id: 'r3', x: 305, y: 190, radius: 14, collected: false, pulseTimer: 2 },
      { id: 'r4', x: 190, y: 350, radius: 14, collected: false, pulseTimer: 3 },
    ];

    const spikes: SpikeHazard[] = [
      { id: 'sp1', x: 32, y: 320, width: 22, height: 14 },
      { id: 'sp2', x: playW - 54, y: 320, width: 22, height: 14 },
    ];

    const portals: PortalWarp[] = [
      {
        id: 'p1',
        entry: { x: 45, y: 80, radius: 18 },
        exit: { x: 260, y: 80, angle: Math.PI * 0.75, speed: 12 },
        activeTimer: 0,
      },
    ];

    const plunger: Plunger = {
      x: plungerX,
      y: tableHeight - 50,
      width: plungerWidth,
      height: 40,
      compression: 0,
      isCharging: false,
    };

    return {
      ball,
      leftFlipper,
      rightFlipper,
      bumpers,
      slingshots,
      walls,
      trampolines,
      starRings,
      spikes,
      portals,
      particles: [],
      floatingTexts: [],
      plunger,
      screenShake: 0,
      comboCount: 0,
      lastHitTime: Date.now(),
    };
  }

  // Sub-stepped physics update
  public static update(
    state: GamePhysicsState,
    tableWidth: number,
    tableHeight: number,
    onScore: (pts: number, text?: string) => void,
    onBallLost: () => void,
    onRingCollected: () => void,
    trailType: string = 'circles',
    trailColor: string = '#38bdf8'
  ) {
    const dt = 1 / this.SUB_STEPS;

    // Decay screen shake
    if (state.screenShake > 0) {
      state.screenShake = Math.max(0, state.screenShake - 0.5);
    }

    // Reset combo if no hits for 2.5 seconds
    if (Date.now() - state.lastHitTime > 2500 && state.comboCount > 0) {
      state.comboCount = 0;
    }

    // Plunger charging logic
    if (state.plunger.isCharging) {
      state.plunger.compression = Math.min(1, state.plunger.compression + 0.03);
    }

    // Update Flipper Angles with smooth angular velocity
    this.updateFlipper(state.leftFlipper);
    this.updateFlipper(state.rightFlipper);

    // Update particle timers
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life++;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        state.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y -= 0.8;
      ft.life++;
      ft.alpha = Math.max(0, 1 - ft.life / 40);
      if (ft.life >= 40) {
        state.floatingTexts.splice(i, 1);
      }
    }

    // Update active timers for bumpers, trampolines, slingshots
    state.bumpers.forEach((b) => {
      if (b.activeTimer > 0) b.activeTimer--;
    });
    state.slingshots.forEach((s) => {
      if (s.activeTimer > 0) s.activeTimer--;
    });
    state.trampolines.forEach((t) => {
      if (t.activeTimer > 0) t.activeTimer--;
    });
    state.starRings.forEach((r) => {
      r.pulseTimer += 0.05;
    });

    const ball = state.ball;
    if (ball.isDead) return;

    // Handle invincibility after respawn/shield
    if (ball.invincibleTimer > 0) {
      ball.invincibleTimer--;
      ball.isInvincible = ball.invincibleTimer > 0;
    }

    // Run sub-steps
    for (let step = 0; step < this.SUB_STEPS; step++) {
      if (!ball.inPlungerLane) {
        ball.vy += this.GRAVITY * dt;
      }

      // Air resistance
      ball.vx *= Math.pow(0.998, dt);
      ball.vy *= Math.pow(0.998, dt);

      // Clamp max velocity to prevent tunnel bugs
      const maxSpd = 26;
      const curSpd = Math.hypot(ball.vx, ball.vy);
      if (curSpd > maxSpd) {
        ball.vx = (ball.vx / curSpd) * maxSpd;
        ball.vy = (ball.vy / curSpd) * maxSpd;
      }

      // Integrate position
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Handle Plunger Launch Lane
      const plungerLaneX = tableWidth - 32;
      if (ball.inPlungerLane) {
        // Keep in lane
        if (ball.x < plungerLaneX + ball.radius) {
          ball.x = plungerLaneX + ball.radius;
          ball.vx = 0;
        }
        if (ball.x > tableWidth - 8 - ball.radius) {
          ball.x = tableWidth - 8 - ball.radius;
          ball.vx = 0;
        }

        // Rest on plunger
        const restY = state.plunger.y - ball.radius + state.plunger.compression * 20;
        if (ball.y > restY) {
          ball.y = restY;
          ball.vy = 0;
        }

        // Check if ball curved around the top orbit and exited plunger lane
        if (ball.y < 80 && ball.vx < -2) {
          ball.inPlungerLane = false;
          this.spawnSparkBurst(state, ball.x, ball.y, '#38bdf8', 12);
          onScore(2500, '스킬 샷!');
          soundEngine.playHyperspace();
        }
      }

      // Collisions with walls
      for (const wall of state.walls) {
        this.resolveWallCollision(ball, wall, state);
      }

      // Collisions with flippers
      this.resolveFlipperCollision(ball, state.leftFlipper, state, onScore);
      this.resolveFlipperCollision(ball, state.rightFlipper, state, onScore);

      // Collisions with round bumpers
      for (const bumper of state.bumpers) {
        this.resolveBumperCollision(ball, bumper, state, onScore);
      }

      // Collisions with slingshots
      for (const sling of state.slingshots) {
        this.resolveSlingshotCollision(ball, sling, state, onScore);
      }

      // Collisions with trampolines (Classic 공튀기기 element)
      for (const tramp of state.trampolines) {
        this.resolveTrampolineCollision(ball, tramp, state, onScore);
      }

      // Star rings collection
      for (const ring of state.starRings) {
        if (!ring.collected) {
          const dist = Math.hypot(ball.x - ring.x, ball.y - ring.y);
          if (dist < ball.radius + ring.radius) {
            ring.collected = true;
            soundEngine.playStarRing();
            this.spawnSparkBurst(state, ring.x, ring.y, '#facc15', 16);
            this.spawnFloatingText(state, '+5,000', ring.x, ring.y, '#facc15');
            onScore(5000);
            onRingCollected();
          }
        }
      }

      // Spikes hazard (Classic 공튀기기 element)
      if (!ball.isInvincible) {
        for (const spike of state.spikes) {
          if (
            ball.x + ball.radius > spike.x &&
            ball.x - ball.radius < spike.x + spike.width &&
            ball.y + ball.radius > spike.y &&
            ball.y - ball.radius < spike.y + spike.height
          ) {
            // Ball pop!
            soundEngine.playSpikeHazard();
            this.spawnSparkBurst(state, ball.x, ball.y, '#ef4444', 24);
            state.screenShake = 12;

            if (ball.hasShield) {
              ball.hasShield = false;
              ball.invincibleTimer = 90; // 1.5s invincibility
              this.spawnFloatingText(state, '실드 소멸!', ball.x, ball.y, '#ef4444');
              // Bounce upward away
              ball.vy = -10;
            } else {
              ball.isDead = true;
              onBallLost();
              return;
            }
          }
        }
      }

      // Portals / Wormholes
      for (const portal of state.portals) {
        const dist = Math.hypot(ball.x - portal.entry.x, ball.y - portal.entry.y);
        if (dist < ball.radius + portal.entry.radius && portal.activeTimer === 0) {
          portal.activeTimer = 40;
          soundEngine.playHyperspace();
          this.spawnSparkBurst(state, portal.entry.x, portal.entry.y, '#c084fc', 20);
          ball.x = portal.exit.x;
          ball.y = portal.exit.y;
          ball.vx = Math.cos(portal.exit.angle) * portal.exit.speed;
          ball.vy = Math.sin(portal.exit.angle) * portal.exit.speed;
          this.spawnSparkBurst(state, portal.exit.x, portal.exit.y, '#c084fc', 20);
          this.spawnFloatingText(state, '워프 보너스!', portal.exit.x, portal.exit.y, '#c084fc');
          onScore(15000);
          state.screenShake = 6;
        }
        if (portal.activeTimer > 0) portal.activeTimer--;
      }
    }

    // Ball squash and stretch recovery
    ball.squashX += (1 - ball.squashX) * 0.15;
    ball.squashY += (1 - ball.squashY) * 0.15;

    // Ball trail update
    ball.trail.unshift({ x: ball.x, y: ball.y, alpha: 0.8 });
    if (ball.trail.length > 10) ball.trail.pop();

    // Spawn trail particles if moving fast
    const spd = Math.hypot(ball.vx, ball.vy);
    if (spd > 4 && Math.random() < 0.6) {
      state.particles.push({
        x: ball.x + (Math.random() - 0.5) * 6,
        y: ball.y + (Math.random() - 0.5) * 6,
        vx: -ball.vx * 0.15 + (Math.random() - 0.5) * 1.5,
        vy: -ball.vy * 0.15 + (Math.random() - 0.5) * 1.5,
        color: trailColor,
        size: trailType === 'stars' ? 5 : trailType === 'sparks' ? 3 : 4,
        alpha: 0.85,
        life: 0,
        maxLife: trailType === 'sparks' ? 14 : 20,
      });
    }

    // Drain Check (Ball lost through bottom center)
    if (ball.y > tableHeight + 20) {
      ball.isDead = true;
      soundEngine.playGameOver();
      onBallLost();
    }
  }

  // Flipper angular interpolation
  private static updateFlipper(flipper: Flipper) {
    const targetAngle = flipper.isPressed ? flipper.activeAngle : flipper.restAngle;
    const diff = targetAngle - flipper.angle;
    flipper.angularVelocity = diff * this.FLIPPER_SPEED;
    flipper.angle += flipper.angularVelocity;
  }

  // Trigger Plunger
  public static releasePlunger(state: GamePhysicsState): number {
    const power = Math.max(0.2, state.plunger.compression);
    state.plunger.compression = 0;
    state.plunger.isCharging = false;

    if (state.ball.inPlungerLane) {
      soundEngine.playPlungerRelease(power);
      state.ball.vy = -18 - power * 15;
      state.ball.vx = (Math.random() - 0.5) * 1.5;
      this.spawnSparkBurst(state, state.ball.x, state.ball.y, '#f59e0b', 14);
      state.screenShake = 4 + power * 6;
      return power;
    }
    return 0;
  }

  // Wall Segment Collision
  private static resolveWallCollision(ball: Ball, wall: WallSegment, state: GamePhysicsState) {
    const x1 = wall.p1.x;
    const y1 = wall.p1.y;
    const x2 = wall.p2.x;
    const y2 = wall.p2.y;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return;

    // Project ball onto wall segment
    let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const closeX = x1 + t * dx;
    const closeY = y1 + t * dy;

    const distVecX = ball.x - closeX;
    const distVecY = ball.y - closeY;
    const distSq = distVecX * distVecX + distVecY * distVecY;

    if (distSq < ball.radius * ball.radius && distSq > 0.0001) {
      const dist = Math.sqrt(distSq);
      const normalX = distVecX / dist;
      const normalY = distVecY / dist;

      // Positional correction
      const penetration = ball.radius - dist;
      ball.x += normalX * penetration;
      ball.y += normalY * penetration;

      // Normal velocity
      const vDotN = ball.vx * normalX + ball.vy * normalY;
      if (vDotN < 0) {
        const restitution = wall.restitution;
        ball.vx = (ball.vx - (1 + restitution) * vDotN * normalX) * wall.friction;
        ball.vy = (ball.vy - (1 + restitution) * vDotN * normalY) * wall.friction;

        // Apply slight squash & stretch
        ball.squashX = 0.85;
        ball.squashY = 1.15;

        if (Math.abs(vDotN) > 4) {
          soundEngine.playFlipper(false);
          this.spawnSparkBurst(state, closeX, closeY, wall.color || '#38bdf8', 4);
        }
      }
    }
  }

  // Flipper Capsule Collision with dynamic angular velocity transfer
  private static resolveFlipperCollision(
    ball: Ball,
    flipper: Flipper,
    state: GamePhysicsState,
    onScore: (pts: number) => void
  ) {
    const tipX = flipper.pivotX + Math.cos(flipper.angle) * flipper.length;
    const tipY = flipper.pivotY + Math.sin(flipper.angle) * flipper.length;

    const dx = tipX - flipper.pivotX;
    const dy = tipY - flipper.pivotY;
    const lenSq = dx * dx + dy * dy;

    let t = ((ball.x - flipper.pivotX) * dx + (ball.y - flipper.pivotY) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    // Linear radius taper from baseWidth to tipWidth
    const flipperRadius = (flipper.baseWidth * (1 - t) + flipper.tipWidth * t) / 2;
    const closeX = flipper.pivotX + t * dx;
    const closeY = flipper.pivotY + t * dy;

    const distVecX = ball.x - closeX;
    const distVecY = ball.y - closeY;
    const distSq = distVecX * distVecX + distVecY * distVecY;
    const totalRadius = ball.radius + flipperRadius;

    if (distSq < totalRadius * totalRadius && distSq > 0.0001) {
      const dist = Math.sqrt(distSq);
      const normalX = distVecX / dist;
      const normalY = distVecY / dist;

      // Position correction
      ball.x += normalX * (totalRadius - dist);
      ball.y += normalY * (totalRadius - dist);

      // Tangential velocity from flipper rotation
      // V_flipper = omega * radius_from_pivot
      const radiusFromPivot = t * flipper.length;
      const flipperSpeed = flipper.angularVelocity * radiusFromPivot;
      const tangentX = -Math.sin(flipper.angle) * flipperSpeed;
      const tangentY = Math.cos(flipper.angle) * flipperSpeed;

      const relVx = ball.vx - tangentX;
      const relVy = ball.vy - tangentY;
      const vDotN = relVx * normalX + relVy * normalY;

      if (vDotN < 0) {
        const restitution = 0.65;
        let impulse = -(1 + restitution) * vDotN;

        // If flipper is moving up dynamically, add huge hit kick!
        const isUpstroke = flipper.isLeft
          ? flipper.angularVelocity < -0.05
          : flipper.angularVelocity > 0.05;

        if (isUpstroke) {
          impulse += 9;
          soundEngine.playFlipper(flipper.isLeft);
          this.spawnSparkBurst(state, closeX, closeY, '#38bdf8', 10);
          state.screenShake = 3;
          onScore(150);
        }

        ball.vx = tangentX + relVx + normalX * impulse;
        ball.vy = tangentY + relVy + normalY * impulse;

        // Dynamic squash
        ball.squashX = 0.75;
        ball.squashY = 1.3;
      }
    }
  }

  // Circular XP Space Cadet Bumpers Collision
  private static resolveBumperCollision(
    ball: Ball,
    bumper: RoundBumper,
    state: GamePhysicsState,
    onScore: (pts: number, text?: string) => void
  ) {
    const dx = ball.x - bumper.x;
    const dy = ball.y - bumper.y;
    const distSq = dx * dx + dy * dy;
    const totalRadius = ball.radius + bumper.radius;

    if (distSq < totalRadius * totalRadius && distSq > 0.0001) {
      const dist = Math.sqrt(distSq);
      const normalX = dx / dist;
      const normalY = dy / dist;

      // Position correction
      ball.x = bumper.x + normalX * totalRadius;
      ball.y = bumper.y + normalY * totalRadius;

      // Boost velocity outwards!
      const kickSpeed = 14.5;
      ball.vx = normalX * kickSpeed;
      ball.vy = normalY * kickSpeed;

      // Squash
      ball.squashX = 1.4;
      ball.squashY = 0.6;

      bumper.activeTimer = 14;
      bumper.hitCount++;
      state.comboCount++;
      state.lastHitTime = Date.now();
      state.screenShake = 4;

      soundEngine.playBumper(bumper.hitCount);
      this.spawnSparkBurst(state, ball.x, ball.y, bumper.color, 16);

      const comboMultiplier = Math.min(5, 1 + Math.floor(state.comboCount / 3) * 0.5);
      const points = Math.round(bumper.scoreValue * comboMultiplier);
      const text = state.comboCount > 2 ? `${state.comboCount}x 콤보!` : undefined;

      this.spawnFloatingText(state, `+${points.toLocaleString()}`, bumper.x, bumper.y - 15, bumper.color);
      onScore(points, text);
    }
  }

  // Slingshot Collision
  private static resolveSlingshotCollision(
    ball: Ball,
    sling: Slingshot,
    state: GamePhysicsState,
    onScore: (pts: number) => void
  ) {
    const x1 = sling.p1.x;
    const y1 = sling.p1.y;
    const x2 = sling.p2.x;
    const y2 = sling.p2.y;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const closeX = x1 + t * dx;
    const closeY = y1 + t * dy;

    const distVecX = ball.x - closeX;
    const distVecY = ball.y - closeY;
    const distSq = distVecX * distVecX + distVecY * distVecY;

    if (distSq < ball.radius * ball.radius) {
      soundEngine.playSlingshot();
      sling.activeTimer = 12;

      // Propel along kick normal
      const kickPower = 15;
      ball.vx = sling.kickNormal.x * kickPower;
      ball.vy = sling.kickNormal.y * kickPower;

      ball.x = closeX + sling.kickNormal.x * (ball.radius + 2);
      ball.y = closeY + sling.kickNormal.y * (ball.radius + 2);

      this.spawnSparkBurst(state, closeX, closeY, '#fbbf24', 12);
      this.spawnFloatingText(state, '+500', closeX, closeY, '#fbbf24');
      onScore(500);
      state.screenShake = 3;
    }
  }

  // Trampoline Collision (Classic 공튀기기 spring pad)
  private static resolveTrampolineCollision(
    ball: Ball,
    tramp: Trampoline,
    state: GamePhysicsState,
    onScore: (pts: number) => void
  ) {
    if (
      ball.x + ball.radius > tramp.x - tramp.width / 2 &&
      ball.x - ball.radius < tramp.x + tramp.width / 2 &&
      ball.y + ball.radius > tramp.y - tramp.height / 2 &&
      ball.y - ball.radius < tramp.y + tramp.height / 2 &&
      ball.vy > 0
    ) {
      tramp.activeTimer = 14;
      soundEngine.playTrampoline();
      ball.y = tramp.y - tramp.height / 2 - ball.radius;
      ball.vy = -Math.abs(ball.vy) * tramp.boostMultiplier - 6;
      if (ball.vy < -22) ball.vy = -22;

      ball.squashX = 1.5;
      ball.squashY = 0.5;

      this.spawnSparkBurst(state, ball.x, ball.y, '#22c55e', 14);
      this.spawnFloatingText(state, '슈퍼 점프!', tramp.x, tramp.y - 20, '#22c55e');
      onScore(1000);
      state.screenShake = 5;
    }
  }

  // Helpers
  private static spawnSparkBurst(state: GamePhysicsState, x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 2 + Math.random() * 4.5;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 15 + Math.floor(Math.random() * 10),
      });
    }
  }

  private static spawnFloatingText(state: GamePhysicsState, text: string, x: number, y: number, color: string) {
    state.floatingTexts.push({
      id: 'ft_' + Math.random().toString(36).substring(2, 7),
      text,
      x,
      y,
      color,
      alpha: 1,
      life: 0,
    });
  }
}
