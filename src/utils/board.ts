import { GRID_SIZE } from '../components/GameCanvas';
import type { Direction, Point } from '../types/game';

export function keyOf(p: Point): string {
  return `${p.x},${p.y}`;
}

export function isInsideGrid(p: Point): boolean {
  return p.x >= 0 && p.x < GRID_SIZE && p.y >= 0 && p.y < GRID_SIZE;
}

export function nextPoint(head: Point, dir: Direction): Point {
  switch (dir) {
    case 'UP':
      return { x: head.x, y: head.y - 1 };
    case 'DOWN':
      return { x: head.x, y: head.y + 1 };
    case 'LEFT':
      return { x: head.x - 1, y: head.y };
    case 'RIGHT':
      return { x: head.x + 1, y: head.y };
  }
}

export function isOppositeDirection(a: Direction, b: Direction): boolean {
  return (
    (a === 'UP' && b === 'DOWN') ||
    (a === 'DOWN' && b === 'UP') ||
    (a === 'LEFT' && b === 'RIGHT') ||
    (a === 'RIGHT' && b === 'LEFT')
  );
}

function getBlockedSet(snake: Point[], stones: Point[], spikes: Point[]): Set<string> {
  const blocked = new Set<string>();
  for (const s of snake) blocked.add(keyOf(s));
  for (const st of stones) blocked.add(keyOf(st));
  for (const sp of spikes) blocked.add(keyOf(sp));
  return blocked;
}

export function canReachTarget(
  head: Point,
  target: Point,
  snakeBody: Point[],
  stones: Point[],
  spikes: Point[]
): boolean {
  const blocked = new Set<string>();
  // Skip head (index 0) and tail tip (which moves forward) for reachability check
  for (let i = 1; i < snakeBody.length - 1; i++) {
    blocked.add(keyOf(snakeBody[i]));
  }
  for (const st of stones) blocked.add(keyOf(st));
  for (const sp of spikes) blocked.add(keyOf(sp));

  const targetKey = keyOf(target);
  if (blocked.has(targetKey)) return false;

  const visited = new Set<string>([keyOf(head)]);
  const queue: Point[] = [head];
  const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === target.x && curr.y === target.y) return true;

    for (const d of dirs) {
      const nxt = nextPoint(curr, d);
      if (!isInsideGrid(nxt)) continue;
      const k = keyOf(nxt);
      if (visited.has(k) || blocked.has(k)) continue;
      visited.add(k);
      queue.push(nxt);
    }
  }

  return false;
}

function isSafeNearHead(candidate: Point, head: Point, dir: Direction, minManhattan = 3): boolean {
  const manhattan = Math.abs(candidate.x - head.x) + Math.abs(candidate.y - head.y);
  if (manhattan <= minManhattan) return false;

  // Protect 4 cells directly ahead of snake heading
  let probe = head;
  for (let step = 1; step <= 4; step++) {
    probe = nextPoint(probe, dir);
    if (probe.x === candidate.x && probe.y === candidate.y) return false;
  }
  return true;
}

export function spawnApple(
  snake: Point[],
  stones: Point[],
  spikes: Point[]
): Point {
  const blocked = getBlockedSet(snake, stones, spikes);
  const head = snake[0];
  const preferred: Point[] = [];
  const fallback: Point[] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const p = { x, y };
      if (blocked.has(keyOf(p))) continue;
      const dist = Math.abs(x - head.x) + Math.abs(y - head.y);
      if (dist >= 4) {
        preferred.push(p);
      } else {
        fallback.push(p);
      }
    }
  }

  const shuffle = <T,>(arr: T[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };

  shuffle(preferred);
  for (const cand of preferred) {
    if (canReachTarget(head, cand, snake, stones, spikes)) {
      return cand;
    }
  }

  shuffle(fallback);
  for (const cand of fallback) {
    if (canReachTarget(head, cand, snake, stones, spikes)) {
      return cand;
    }
  }

  return preferred[0] ?? fallback[0] ?? { x: 10, y: 10 };
}

export function spawnStones(
  count: number,
  snake: Point[],
  direction: Direction,
  apple: Point | null,
  existingStones: Point[],
  spikes: Point[]
): Point[] {
  if (count <= 0) return existingStones;
  const result = [...existingStones];
  const head = snake[0];
  const occupied = getBlockedSet(snake, result, spikes);
  if (apple) occupied.add(keyOf(apple));

  const candidates: Point[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const p = { x, y };
      if (occupied.has(keyOf(p))) continue;
      if (!isSafeNearHead(p, head, direction, 3)) continue;
      candidates.push(p);
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  let added = 0;
  for (const cand of candidates) {
    if (added >= count) break;
    const trial = [...result, cand];
    if (!apple || canReachTarget(head, apple, snake, trial, spikes)) {
      result.push(cand);
      added++;
    }
  }

  return result;
}

export function spawnRandomizedSpikes(
  count: number,
  snake: Point[],
  direction: Direction,
  apple: Point | null,
  stones: Point[]
): Point[] {
  if (count <= 0) return [];
  const head = snake[0];
  const occupied = getBlockedSet(snake, stones, []);
  if (apple) occupied.add(keyOf(apple));

  const candidates: Point[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const p = { x, y };
      if (occupied.has(keyOf(p))) continue;
      if (!isSafeNearHead(p, head, direction, 2)) continue;
      candidates.push(p);
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const placed: Point[] = [];
  for (const cand of candidates) {
    if (placed.length >= count) break;
    const trial = [...placed, cand];
    if (!apple || canReachTarget(head, apple, snake, stones, trial)) {
      placed.push(cand);
    }
  }

  return placed;
}
