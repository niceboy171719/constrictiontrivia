import { GRID_SIZE } from '../components/GameCanvas';
import type { Direction, Point } from '../types/game';
import { isInsideGrid, keyOf, nextPoint } from './board';

const ALL_DIRS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

function findShortestPath(
  start: Point,
  target: Point,
  blocked: Set<string>
): Point[] | null {
  const startKey = keyOf(start);
  const targetKey = keyOf(target);
  if (startKey === targetKey) return [start];

  const visited = new Set<string>([startKey]);
  const parent = new Map<string, Point>();
  const pointByKey = new Map<string, Point>([[startKey, start]]);
  const queue: Point[] = [start];

  let headIdx = 0;
  while (headIdx < queue.length) {
    const curr = queue[headIdx++];
    const currKey = keyOf(curr);

    for (const dir of ALL_DIRS) {
      const nxt = nextPoint(curr, dir);
      if (!isInsideGrid(nxt)) continue;
      const nxtKey = keyOf(nxt);
      if (visited.has(nxtKey)) continue;
      if (nxtKey !== targetKey && blocked.has(nxtKey)) continue;

      visited.add(nxtKey);
      parent.set(nxtKey, curr);
      pointByKey.set(nxtKey, nxt);

      if (nxtKey === targetKey) {
        const path: Point[] = [];
        let trace: Point | undefined = nxt;
        while (trace && keyOf(trace) !== startKey) {
          path.push(trace);
          trace = parent.get(keyOf(trace));
        }
        path.reverse();
        return path;
      }

      queue.push(nxt);
    }
  }

  return null;
}

function floodFillCount(start: Point, blocked: Set<string>): number {
  const startKey = keyOf(start);
  if (!isInsideGrid(start) || blocked.has(startKey)) return 0;

  const visited = new Set<string>([startKey]);
  const queue: Point[] = [start];
  let idx = 0;

  while (idx < queue.length) {
    const curr = queue[idx++];
    for (const dir of ALL_DIRS) {
      const nxt = nextPoint(curr, dir);
      if (!isInsideGrid(nxt)) continue;
      const nxtKey = keyOf(nxt);
      if (visited.has(nxtKey) || blocked.has(nxtKey)) continue;
      visited.add(nxtKey);
      queue.push(nxt);
    }
  }

  return visited.size;
}

function directionFromStep(from: Point, to: Point): Direction | null {
  if (to.x === from.x && to.y === from.y - 1) return 'UP';
  if (to.x === from.x && to.y === from.y + 1) return 'DOWN';
  if (to.x === from.x - 1 && to.y === from.y) return 'LEFT';
  if (to.x === from.x + 1 && to.y === from.y) return 'RIGHT';
  return null;
}

function buildObstacleSet(
  snake: Point[],
  stones: Point[],
  spikes: Point[],
  ignoreTailTip: boolean
): Set<string> {
  const blocked = new Set<string>();
  const limit = ignoreTailTip ? snake.length - 1 : snake.length;
  for (let i = 0; i < limit; i++) {
    blocked.add(keyOf(snake[i]));
  }
  for (const st of stones) blocked.add(keyOf(st));
  for (const sp of spikes) blocked.add(keyOf(sp));
  return blocked;
}

function simulateSnakeAlongPath(
  snake: Point[],
  path: Point[],
  pendingGrowth: number
): Point[] {
  let sim = [...snake];
  let growth = pendingGrowth;

  for (const step of path) {
    const nextSim = [step, ...sim];
    if (growth > 0) {
      growth -= 1;
    } else {
      nextSim.pop();
    }
    sim = nextSim;
  }

  return sim;
}

/**
 * Computes the optimal next move using:
 * 1. Shortest BFS path to the apple
 * 2. Virtual lookahead verifying the snake can still reach its tail (or ample space) after eating
 * 3. Survival scoring fallback (tail-reachability + flood-fill area + wall/hazard clearance)
 */
export function chooseBestBotDirection(
  snake: Point[],
  currentDir: Direction,
  apple: Point | null,
  stones: Point[],
  spikes: Point[],
  pendingGrowth: number
): Direction {
  const head = snake[0];
  const staticHazards = new Set<string>();
  for (const st of stones) staticHazards.add(keyOf(st));
  for (const sp of spikes) staticHazards.add(keyOf(sp));

  const immediateBlocked = buildObstacleSet(snake, stones, spikes, pendingGrowth === 0);

  // 1. Try shortest path to the apple with lookahead safety
  if (apple) {
    const pathToApple = findShortestPath(head, apple, immediateBlocked);
    if (pathToApple && pathToApple.length > 0) {
      const simSnake = simulateSnakeAlongPath(snake, pathToApple, pendingGrowth);
      const simHead = simSnake[0];
      const simTail = simSnake[simSnake.length - 1];
      const simBlocked = buildObstacleSet(simSnake, stones, spikes, true);

      const canReachTail = findShortestPath(simHead, simTail, simBlocked) !== null;
      const openArea = floodFillCount(simHead, buildObstacleSet(simSnake, stones, spikes, false));

      if (canReachTail || openArea >= Math.max(simSnake.length + 10, 32)) {
        const dir = directionFromStep(head, pathToApple[0]);
        if (dir) return dir;
      }
    }
  }

  // 2. Survival evaluation across all safe single-step moves
  let bestDir: Direction | null = null;
  let bestScore = -Infinity;

  for (const dir of ALL_DIRS) {
    const nxt = nextPoint(head, dir);
    if (!isInsideGrid(nxt)) continue;
    const nxtKey = keyOf(nxt);
    if (immediateBlocked.has(nxtKey) || staticHazards.has(nxtKey)) continue;

    const simNext = [nxt, ...snake];
    if (pendingGrowth === 0) simNext.pop();

    const simTail = simNext[simNext.length - 1];
    const simBlockedNoTail = buildObstacleSet(simNext, stones, spikes, true);
    const simBlockedFull = buildObstacleSet(simNext, stones, spikes, false);

    const pathToTail = findShortestPath(nxt, simTail, simBlockedNoTail);
    const canReachTail = pathToTail !== null;
    const area = floodFillCount(nxt, simBlockedFull);

    // Count free orthogonal exits from nxt to avoid tight 1-wide corridors unless necessary
    let exits = 0;
    for (const d2 of ALL_DIRS) {
      const adj = nextPoint(nxt, d2);
      if (isInsideGrid(adj) && !simBlockedFull.has(keyOf(adj))) {
        exits++;
      }
    }

    let score = 0;
    if (canReachTail) score += 10000;
    score += area * 25;
    score += exits * 18;
    if (pathToTail) score += pathToTail.length * 2; // gently stall while tail stays reachable
    if (apple) {
      const manhattan = Math.abs(nxt.x - apple.x) + Math.abs(nxt.y - apple.y);
      score -= manhattan * 3;
    }
    if (dir === currentDir) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestDir = dir;
    }
  }

  return bestDir ?? currentDir;
}
