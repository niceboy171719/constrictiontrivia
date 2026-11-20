export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'WON' | 'GAME_OVER';

export type RunMode = 'standard' | 'practice_snake' | 'practice_trivia';

export type PlayPhase = 'SEEK_APPLE' | 'ANSWER_QUESTION';

export type DifficultyId = 'easy' | 'medium' | 'hard' | 'insane' | 'extreme';

export type ThemeId = 'crimson' | 'venom' | 'amber' | 'moss' | 'cyber' | 'noir';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type QuestionTier = 'easy' | 'medium' | 'hard' | 'insane' | 'extreme';

export interface Point {
  x: number;
  y: number;
}

export interface GameTheme {
  id: ThemeId;
  name: string;
  swatchTopLeft: string;
  swatchBottomRight: string;
  bg: string;
  arenaBg: string;
  panelBg: string;
  panelBorder: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  buttonBg: string;
  buttonText: string;
  snakeHead: string;
  snakeBody: string;
  snakeBelly: string;
  appleFresh: string;
  appleRotting: string;
  appleLeaf: string;
  stoneBase: string;
  stoneHighlight: string;
}

export interface DifficultyConfig {
  id: DifficultyId;
  label: string;
  speed: number; // cells per second
  speedRampPerAnswer: number;
  appleRotSeconds: number;
  answerSeconds: number;
  stonesPerCorrect: number; // permanent stone blocks added per correct answer
  spikesPerApple: number; // randomized spikes relocated each new apple (min if range)
  spikesPerAppleMax?: number; // optional upper bound for randomized spike count
  winTarget: number;
  questionTiers: QuestionTier[];
  description: string;
}

export interface QuestionItem {
  id: string;
  prompt: string;
  answers: string[];
  tier: QuestionTier;
  category: string;
}

export interface FloatingCallout {
  id: number;
  gridX: number;
  gridY: number;
  text: string;
  color: string;
  createdAt: number;
}
