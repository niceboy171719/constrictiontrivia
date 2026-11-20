import type { DifficultyConfig, DifficultyId } from '../types/game';

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    speed: 6.5,
    speedRampPerAnswer: 0.04,
    appleRotSeconds: 9,
    answerSeconds: 22,
    stonesPerCorrect: 0,
    spikesPerApple: 0,
    winTarget: 25,
    questionTiers: ['easy'],
    description: 'Slow snake, easy questions (900+ pool), 9 s apple / 22 s answer, no stone blocks. Win: 25 correct.',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    speed: 9.0,
    speedRampPerAnswer: 0.06,
    appleRotSeconds: 8,
    answerSeconds: 18,
    stonesPerCorrect: 0.5,
    spikesPerApple: 0,
    winTarget: 25,
    questionTiers: ['medium'],
    description: 'Steady snake, medium questions (1,200+ pool), 8 s apple / 18 s answer, a stone block every 2 answers. Win: 25 correct.',
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    speed: 11.8,
    speedRampPerAnswer: 0.08,
    appleRotSeconds: 7,
    answerSeconds: 16,
    stonesPerCorrect: 1,
    spikesPerApple: 0,
    winTarget: 25,
    questionTiers: ['hard'],
    description: 'Fast snake, hard questions (1,500+ pool), 7 s apple / 16 s answer, a stone block every answer. Win: 25 correct.',
  },
  insane: {
    id: 'insane',
    label: 'Insane',
    speed: 14.2,
    speedRampPerAnswer: 0.1,
    appleRotSeconds: 6,
    answerSeconds: 13,
    stonesPerCorrect: 0,
    spikesPerApple: 5,
    spikesPerAppleMax: 10,
    winTarget: 25,
    questionTiers: ['insane'],
    description: 'Very fast snake, insane questions (9,500+ pool), 6 s apple / 13 s answer, 5-10 randomized spikes each apple. Win: 25 correct.',
  },
  extreme: {
    id: 'extreme',
    label: 'Extreme',
    speed: 16.5,
    speedRampPerAnswer: 0.14,
    appleRotSeconds: 5,
    answerSeconds: 11,
    stonesPerCorrect: 0,
    spikesPerApple: 17,
    winTarget: 30,
    questionTiers: ['extreme'],
    description: 'Relentless snake, extreme questions (25,000+ pool), 5 s apple / 11 s answer, 17 randomized spikes each apple. Win: 30 correct.',
  },
};

export const DIFFICULTY_ORDER: DifficultyId[] = ['easy', 'medium', 'hard', 'insane', 'extreme'];

export function getSpikeCountForDifficulty(cfg: DifficultyConfig): number {
  const min = cfg.spikesPerApple;
  const max = cfg.spikesPerAppleMax ?? min;
  if (max <= min) return min;
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function formatSpikeCount(cfg: DifficultyConfig): string {
  const min = cfg.spikesPerApple;
  const max = cfg.spikesPerAppleMax ?? min;
  return max > min ? `${min}-${max}` : `${min}`;
}
