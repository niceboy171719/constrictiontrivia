import React, { useEffect, useRef } from 'react';
import type { Direction, FloatingCallout, GameTheme, Point } from '../types/game';

export const GRID_SIZE = 20;

interface GameCanvasProps {
  snake: Point[];
  direction: Direction;
  apple: Point | null;
  appleRotRatio: number; // 1 = fresh, 0 = rotted
  stones: Point[];
  spikes: Point[];
  spikesSpawnedAt: number;
  theme: GameTheme;
  callouts: FloatingCallout[];
  isPlaying: boolean;
}

function lerpHex(hexA: string, hexB: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const parse = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(r1 + (r2 - r1) * clamped);
  const g = Math.round(g1 + (g2 - g1) * clamped);
  const b = Math.round(b1 + (b2 - b1) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  snake,
  direction,
  apple,
  appleRotRatio,
  stones,
  spikes,
  spikesSpawnedAt,
  theme,
  callouts,
  isPlaying,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.max(240, Math.floor(Math.min(rect.width, rect.height)));
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    const cell = size / GRID_SIZE;

    // 1. Arena background
    ctx.fillStyle = theme.arenaBg;
    ctx.fillRect(0, 0, size, size);

    // 2. Subtle pixel grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < GRID_SIZE; i++) {
      const pos = Math.round(i * cell) + 0.5;
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, size);
      ctx.moveTo(0, pos);
      ctx.lineTo(size, pos);
    }
    ctx.stroke();

    // 3. Stone blocks
    for (const stone of stones) {
      const x = stone.x * cell;
      const y = stone.y * cell;
      const pad = Math.max(1, Math.floor(cell * 0.08));
      const w = cell - pad * 2;

      ctx.fillStyle = '#181822';
      ctx.fillRect(x + pad, y + pad, w, w);

      ctx.fillStyle = theme.stoneBase;
      ctx.fillRect(x + pad + 1, y + pad + 1, w - 2, w - 2);

      // Top/left pixel bevel
      ctx.fillStyle = theme.stoneHighlight;
      ctx.fillRect(x + pad + 1, y + pad + 1, w - 2, Math.max(2, Math.floor(w * 0.18)));
      ctx.fillRect(x + pad + 1, y + pad + 1, Math.max(2, Math.floor(w * 0.18)), w - 2);

      // Pixel crack lines
      ctx.fillStyle = '#1E2430';
      ctx.fillRect(
        x + Math.floor(cell * 0.35),
        y + Math.floor(cell * 0.42),
        Math.max(2, Math.floor(cell * 0.25)),
        Math.max(1.5, Math.floor(cell * 0.1))
      );
      ctx.fillRect(
        x + Math.floor(cell * 0.5),
        y + Math.floor(cell * 0.5),
        Math.max(1.5, Math.floor(cell * 0.1)),
        Math.max(2, Math.floor(cell * 0.22))
      );
    }

    // 3b. Randomized Spikes (Insane & Extreme)
    const spikeAge = performance.now() - spikesSpawnedAt;
    const freshFlash = spikeAge < 320 && Math.floor(spikeAge / 65) % 2 === 0;
    for (const spike of spikes) {
      const x = spike.x * cell;
      const y = spike.y * cell;
      const pad = Math.max(1, Math.floor(cell * 0.1));
      const baseTop = y + cell * 0.72;
      const baseH = Math.max(2, cell * 0.18);

      // Base plate
      ctx.fillStyle = '#272732';
      ctx.fillRect(x + pad, baseTop, cell - pad * 2, baseH);

      // Twin jagged pixel spikes
      const spikeColor = freshFlash ? '#FDE047' : '#E2E8F0';
      const tipColor = freshFlash ? '#FEF08A' : '#EF4444';

      // Left tooth
      ctx.fillStyle = spikeColor;
      ctx.beginPath();
      ctx.moveTo(x + cell * 0.16, baseTop);
      ctx.lineTo(x + cell * 0.34, y + cell * 0.16);
      ctx.lineTo(x + cell * 0.5, baseTop);
      ctx.closePath();
      ctx.fill();

      // Right tooth
      ctx.beginPath();
      ctx.moveTo(x + cell * 0.5, baseTop);
      ctx.lineTo(x + cell * 0.68, y + cell * 0.16);
      ctx.lineTo(x + cell * 0.84, baseTop);
      ctx.closePath();
      ctx.fill();

      // Crimson tipped pixels
      ctx.fillStyle = tipColor;
      ctx.fillRect(x + cell * 0.31, y + cell * 0.15, Math.max(2, cell * 0.08), Math.max(2, cell * 0.14));
      ctx.fillRect(x + cell * 0.65, y + cell * 0.15, Math.max(2, cell * 0.08), Math.max(2, cell * 0.14));
    }

    // 4. Rotting Apple
    if (apple) {
      const now = performance.now();
      const urgent = appleRotRatio < 0.3;
      const pulse = urgent ? Math.sin(now * 0.018) * 0.08 : 0;
      const cx = (apple.x + 0.5) * cell;
      const cy = (apple.y + 0.5) * cell;
      const bodySize = cell * (0.72 + pulse);
      const bx = cx - bodySize / 2;
      const by = cy - bodySize / 2 + cell * 0.05;

      const fruitColor = lerpHex(theme.appleRotting, theme.appleFresh, appleRotRatio);

      // Pixel apple body
      ctx.fillStyle = fruitColor;
      ctx.fillRect(bx, by, bodySize, bodySize * 0.88);
      ctx.fillRect(bx + bodySize * 0.14, by - bodySize * 0.08, bodySize * 0.72, bodySize * 0.96);

      // Shine pixel
      if (appleRotRatio > 0.25) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.fillRect(
          bx + bodySize * 0.18,
          by + bodySize * 0.15,
          Math.max(2, bodySize * 0.16),
          Math.max(2, bodySize * 0.22)
        );
      }

      // Stem & Leaf
      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(cx - cell * 0.05, by - cell * 0.18, Math.max(2, cell * 0.1), cell * 0.18);
      ctx.fillStyle = appleRotRatio > 0.25 ? theme.appleLeaf : '#78716C';
      ctx.fillRect(cx + cell * 0.03, by - cell * 0.2, cell * 0.2, cell * 0.12);

      // Spore flicker when nearly rotted
      if (urgent) {
        const flicker = Math.sin(now * 0.025) > 0;
        if (flicker) {
          ctx.fillStyle = '#FACC15';
          ctx.fillRect(bx - 2, by - 3, 2, 2);
          ctx.fillRect(bx + bodySize + 1, by + 2, 2, 2);
        }
      }
    }

    // 5. Snake (draw tail to head)
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const isHead = i === 0;
      const isTail = i === snake.length - 1;
      const pad = isTail ? Math.max(2, cell * 0.18) : Math.max(1, cell * 0.08);
      const sx = seg.x * cell + pad;
      const sy = seg.y * cell + pad;
      const sw = cell - pad * 2;

      if (isHead) {
        ctx.fillStyle = theme.snakeHead;
        ctx.fillRect(sx, sy, sw, sw);

        // Directional pixel eyes
        const eyeSize = Math.max(2, Math.floor(cell * 0.16));
        ctx.fillStyle = '#09090D';
        if (direction === 'RIGHT') {
          ctx.fillRect(sx + sw - eyeSize * 1.6, sy + sw * 0.2, eyeSize, eyeSize);
          ctx.fillRect(sx + sw - eyeSize * 1.6, sy + sw * 0.65, eyeSize, eyeSize);
        } else if (direction === 'LEFT') {
          ctx.fillRect(sx + eyeSize * 0.6, sy + sw * 0.2, eyeSize, eyeSize);
          ctx.fillRect(sx + eyeSize * 0.6, sy + sw * 0.65, eyeSize, eyeSize);
        } else if (direction === 'UP') {
          ctx.fillRect(sx + sw * 0.2, sy + eyeSize * 0.6, eyeSize, eyeSize);
          ctx.fillRect(sx + sw * 0.65, sy + eyeSize * 0.6, eyeSize, eyeSize);
        } else {
          ctx.fillRect(sx + sw * 0.2, sy + sw - eyeSize * 1.6, eyeSize, eyeSize);
          ctx.fillRect(sx + sw * 0.65, sy + sw - eyeSize * 1.6, eyeSize, eyeSize);
        }

        // Animated tiny pixel tongue when playing
        if (isPlaying && Math.floor(performance.now() / 220) % 2 === 0) {
          ctx.fillStyle = '#FF758F';
          const tLen = Math.max(3, cell * 0.2);
          const tThick = Math.max(2, cell * 0.1);
          if (direction === 'RIGHT') {
            ctx.fillRect(sx + sw, sy + sw / 2 - tThick / 2, tLen, tThick);
          } else if (direction === 'LEFT') {
            ctx.fillRect(sx - tLen, sy + sw / 2 - tThick / 2, tLen, tThick);
          } else if (direction === 'UP') {
            ctx.fillRect(sx + sw / 2 - tThick / 2, sy - tLen, tThick, tLen);
          } else {
            ctx.fillRect(sx + sw / 2 - tThick / 2, sy + sw, tThick, tLen);
          }
        }
      } else {
        ctx.fillStyle = i % 2 === 0 ? theme.snakeBody : theme.snakeBelly;
        ctx.fillRect(sx, sy, sw, sw);

        // Inner dorsal scale pixel
        ctx.fillStyle = theme.snakeHead;
        ctx.globalAlpha = 0.28;
        ctx.fillRect(sx + sw * 0.25, sy + sw * 0.25, sw * 0.5, sw * 0.5);
        ctx.globalAlpha = 1;
      }
    }

    // 6. Floating pixel callouts
    const now = performance.now();
    for (const c of callouts) {
      const age = now - c.createdAt;
      if (age > 750) continue;
      const progress = age / 750;
      const px = (c.gridX + 0.5) * cell;
      const py = (c.gridY + 0.2) * cell - progress * (cell * 1.1);
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.fillStyle = c.color;
      ctx.font = `700 ${Math.max(10, Math.floor(cell * 0.48))}px "Silkscreen", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(c.text, px, py);
      ctx.restore();
    }

    // 7. Subtle CRT horizontal scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    for (let y = 0; y < size; y += 3) {
      ctx.fillRect(0, y, size, 1);
    }

    ctx.restore();
  }, [snake, direction, apple, appleRotRatio, stones, spikes, spikesSpawnedAt, theme, callouts, isPlaying]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-label="Constriction Snake Arena"
      />
    </div>
  );
};
