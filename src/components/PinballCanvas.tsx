/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { GamePhysicsState, PhysicsEngine } from '../game/physics';
import { BALL_SKINS, TABLE_THEMES, TRAIL_STYLES } from '../game/themes';
import { soundEngine } from '../game/audio';

interface PinballCanvasProps {
  physicsStateRef: React.MutableRefObject<GamePhysicsState>;
  ballSkinId: string;
  tableThemeId: string;
  trailStyleId: string;
  isPaused: boolean;
  onScoreUpdate: (pts: number, comboText?: string) => void;
  onBallLost: () => void;
  onRingCollected: () => void;
  leftFlipperPressed: boolean;
  rightFlipperPressed: boolean;
  plungerCharging: boolean;
  onPlungerRelease: () => void;
}

export const PinballCanvas: React.FC<PinballCanvasProps> = ({
  physicsStateRef,
  ballSkinId,
  tableThemeId,
  trailStyleId,
  isPaused,
  onScoreUpdate,
  onBallLost,
  onRingCollected,
  leftFlipperPressed,
  rightFlipperPressed,
  plungerCharging,
  onPlungerRelease,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync flippers & plunger from props
  useEffect(() => {
    const s = physicsStateRef.current;
    if (s) {
      s.leftFlipper.isPressed = leftFlipperPressed;
    }
  }, [leftFlipperPressed, physicsStateRef]);

  useEffect(() => {
    const s = physicsStateRef.current;
    if (s) {
      s.rightFlipper.isPressed = rightFlipperPressed;
    }
  }, [rightFlipperPressed, physicsStateRef]);

  useEffect(() => {
    const s = physicsStateRef.current;
    if (s) {
      s.plunger.isCharging = plungerCharging;
      if (!plungerCharging && s.plunger.compression > 0) {
        PhysicsEngine.releasePlunger(s);
        onPlungerRelease();
      }
    }
  }, [plungerCharging, onPlungerRelease, physicsStateRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const TABLE_WIDTH = 420;
    const TABLE_HEIGHT = 680;

    const render = (time: number) => {
      const rawDt = (time - lastTime) / 1000;
      lastTime = time;
      const dt = Math.min(rawDt, 0.05);

      const state = physicsStateRef.current;
      const currentSkin = BALL_SKINS.find((b) => b.id === ballSkinId) || BALL_SKINS[0];
      const currentTheme = TABLE_THEMES.find((t) => t.id === tableThemeId) || TABLE_THEMES[0];
      const currentTrail = TRAIL_STYLES.find((tr) => tr.id === trailStyleId) || TRAIL_STYLES[0];

      if (!isPaused && state) {
        PhysicsEngine.update(
          state,
          TABLE_WIDTH,
          TABLE_HEIGHT,
          onScoreUpdate,
          onBallLost,
          onRingCollected,
          currentTrail.particleType,
          currentTrail.color
        );
      }

      // Handle High-DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Fit 420x680 coordinates to canvas
      const scaleX = displayWidth / TABLE_WIDTH;
      const scaleY = displayHeight / TABLE_HEIGHT;
      const scale = Math.min(scaleX, scaleY);
      const offsetX = (displayWidth - TABLE_WIDTH * scale) / 2;
      const offsetY = (displayHeight - TABLE_HEIGHT * scale) / 2;

      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Screen Shake
      if (state.screenShake > 0) {
        const shakeMag = state.screenShake * 1.5;
        const dx = (Math.random() - 0.5) * shakeMag;
        const dy = (Math.random() - 0.5) * shakeMag;
        ctx.translate(dx, dy);
      }

      // 1. Draw Table Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, TABLE_HEIGHT);
      bgGrad.addColorStop(0, currentTheme.bgGradient[0]);
      bgGrad.addColorStop(1, currentTheme.bgGradient[1]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      // Background Grid / Radar lines
      ctx.strokeStyle = currentTheme.gridColor;
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x <= TABLE_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, TABLE_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= TABLE_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(TABLE_WIDTH, y);
        ctx.stroke();
      }

      // Space Cadet Center Insignia / Center Decor
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 24px "Outfit", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillText('SPACE CADET', TABLE_WIDTH / 2 - 16, 280);
      ctx.font = '600 13px "Outfit", sans-serif';
      ctx.fillText('★ HYPER BOUNCE PINBALL ★', TABLE_WIDTH / 2 - 16, 305);
      ctx.restore();

      // 2. Draw Walls & Outer Bezel
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const wall of state.walls) {
        ctx.beginPath();
        ctx.moveTo(wall.p1.x, wall.p1.y);
        ctx.lineTo(wall.p2.x, wall.p2.y);
        ctx.strokeStyle = wall.color || currentTheme.wallColor;
        ctx.lineWidth = wall.isRamp ? 6 : 4;
        ctx.shadowColor = wall.color || currentTheme.wallColor;
        ctx.shadowBlur = wall.isRamp ? 12 : 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. Draw Portals (Wormholes)
      for (const portal of state.portals) {
        ctx.save();
        const pulse = Math.sin(time * 0.006) * 3;
        ctx.beginPath();
        ctx.arc(portal.entry.x, portal.entry.y, portal.entry.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(192, 132, 252, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 14;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(portal.exit.x, portal.exit.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Trampolines (Classic 공튀기기 spring pads)
      for (const tramp of state.trampolines) {
        ctx.save();
        const isBouncing = tramp.activeTimer > 0;
        const trampH = isBouncing ? tramp.height * 0.6 : tramp.height;
        // Spring coil
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tramp.x - tramp.width / 4, tramp.y + 4);
        ctx.lineTo(tramp.x, tramp.y + trampH + 4);
        ctx.lineTo(tramp.x + tramp.width / 4, tramp.y + 4);
        ctx.stroke();

        // Trampoline elastic surface
        ctx.fillStyle = isBouncing ? '#86efac' : '#22c55e';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = isBouncing ? 16 : 8;
        ctx.beginPath();
        ctx.roundRect(tramp.x - tramp.width / 2, tramp.y - trampH / 2, tramp.width, trampH, 4);
        ctx.fill();
        ctx.restore();
      }

      // 5. Draw Spikes (Classic 공튀기기 hazard)
      for (const spike of state.spikes) {
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        const count = 3;
        const toothW = spike.width / count;
        for (let i = 0; i < count; i++) {
          const sx = spike.x + i * toothW;
          ctx.beginPath();
          ctx.moveTo(sx, spike.y + spike.height);
          ctx.lineTo(sx + toothW / 2, spike.y);
          ctx.lineTo(sx + toothW, spike.y + spike.height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 6. Draw Star Rings (Golden rings to collect)
      for (const ring of state.starRings) {
        if (!ring.collected) {
          ctx.save();
          const pulse = Math.sin(ring.pulseTimer * 3) * 2;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Inner star spark
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 7. Draw XP Round Bumpers
      for (let i = 0; i < state.bumpers.length; i++) {
        const b = state.bumpers[i];
        const color = currentTheme.bumperColors[i % currentTheme.bumperColors.length] || b.color;
        const isActive = b.activeTimer > 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius + (isActive ? 4 : 0), 0, Math.PI * 2);

        // Bumper Outer Ring
        ctx.strokeStyle = color;
        ctx.lineWidth = isActive ? 5 : 3.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = isActive ? 24 : 10;
        ctx.stroke();

        // Bumper Inner Fill
        const radGrad = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, b.radius);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.5, color);
        radGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = radGrad;
        ctx.fill();

        // XP Pinball center cap
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.font = '700 12px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${b.scoreValue}`, b.x, b.y);
        ctx.restore();
      }

      // 8. Draw Slingshots
      for (const sling of state.slingshots) {
        ctx.save();
        const isActive = sling.activeTimer > 0;
        ctx.beginPath();
        ctx.moveTo(sling.p1.x, sling.p1.y);
        ctx.lineTo(sling.p2.x, sling.p2.y);
        ctx.strokeStyle = isActive ? '#ffffff' : '#fbbf24';
        ctx.lineWidth = isActive ? 5 : 3;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = isActive ? 16 : 6;
        ctx.stroke();
        ctx.restore();
      }

      // 9. Draw Flippers
      const drawFlipper = (flipper: typeof state.leftFlipper) => {
        ctx.save();
        ctx.translate(flipper.pivotX, flipper.pivotY);
        ctx.rotate(flipper.angle);

        // Flipper body
        ctx.beginPath();
        ctx.moveTo(0, -flipper.baseWidth / 2);
        ctx.lineTo(flipper.length, -flipper.tipWidth / 2);
        ctx.arc(flipper.length, 0, flipper.tipWidth / 2, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(0, flipper.baseWidth / 2);
        ctx.arc(0, 0, flipper.baseWidth / 2, Math.PI / 2, -Math.PI / 2);
        ctx.closePath();

        const flipGrad = ctx.createLinearGradient(0, -flipper.baseWidth / 2, 0, flipper.baseWidth / 2);
        flipGrad.addColorStop(0, '#ffffff');
        flipGrad.addColorStop(0.3, currentTheme.flipperColor);
        flipGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = flipGrad;
        ctx.shadowColor = currentTheme.flipperColor;
        ctx.shadowBlur = flipper.isPressed ? 14 : 6;
        ctx.fill();

        // Metallic pivot cap
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, flipper.baseWidth / 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };
      drawFlipper(state.leftFlipper);
      drawFlipper(state.rightFlipper);

      // 10. Draw Plunger Spring & Lane
      ctx.save();
      const pl = state.plunger;
      const compH = pl.compression * 26;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(pl.x, pl.y - 10, pl.width, pl.height + 20);

      // Plunger spring coils
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const coils = 6;
      const coilH = (pl.height - compH) / coils;
      let curY = pl.y + compH;
      ctx.moveTo(pl.x + 4, curY);
      for (let c = 0; c < coils; c++) {
        const nextY = curY + coilH;
        const midX = c % 2 === 0 ? pl.x + pl.width - 4 : pl.x + 4;
        ctx.lineTo(midX, nextY);
        curY = nextY;
      }
      ctx.stroke();

      // Plunger rubber tip
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(pl.x + 2, pl.y + compH - 6, pl.width - 4, 6);
      ctx.restore();

      // 11. Draw Trail Particles
      for (const p of state.particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 12. Draw Ball with Squash & Stretch + Skin Styling
      const ball = state.ball;
      if (!ball.isDead) {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.scale(ball.squashX, ball.squashY);

        // Invincibility flashing
        if (ball.isInvincible && Math.floor(time / 80) % 2 === 0) {
          ctx.globalAlpha = 0.5;
        }

        // Energy Shield Ring if active
        if (ball.hasShield) {
          ctx.beginPath();
          ctx.arc(0, 0, ball.radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.stroke();
        }

        // Ball Shadow / Glow
        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
        ctx.shadowColor = currentSkin.glowColor;
        ctx.shadowBlur = 12;

        // Ball Gradient (Chrome, Red Ball, Neon Pulse)
        const ballGrad = ctx.createRadialGradient(
          -ball.radius * 0.35,
          -ball.radius * 0.35,
          ball.radius * 0.1,
          0,
          0,
          ball.radius
        );
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.3, currentSkin.primaryColor);
        ballGrad.addColorStop(0.8, currentSkin.secondaryColor);
        ballGrad.addColorStop(1, '#000000');
        ctx.fillStyle = ballGrad;
        ctx.fill();

        // Chrome specular shine dot
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(-ball.radius * 0.3, -ball.radius * 0.35, ball.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 13. Draw Floating Score Texts
      for (const ft of state.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = '700 14px "Outfit", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    ballSkinId,
    tableThemeId,
    trailStyleId,
    isPaused,
    onScoreUpdate,
    onBallLost,
    onRingCollected,
    physicsStateRef,
  ]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[480px] max-h-[820px] object-contain shadow-2xl rounded-2xl border border-slate-800/80"
        style={{ aspectRatio: '420/680' }}
      />
    </div>
  );
};
