import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  Bot,
  Pause,
  Play,
  Trophy,
  User as UserIcon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AccountModal } from './components/AccountModal';
import { GameCanvas } from './components/GameCanvas';
import { SnakeLogo } from './components/SnakeLogo';
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  formatSpikeCount,
  getSpikeCountForDifficulty,
} from './constants/difficulties';
import { GAME_THEMES, THEME_ORDER } from './constants/themes';
import { auth, googleProvider } from './firebase';
import {
  ensureUserAccount,
  getBestFieldForDifficulty,
  recordRunToCloud,
  updatePlayerHandle,
  type PlayerProfile,
} from './services/accountService';
import type {
  DifficultyId,
  Direction,
  FloatingCallout,
  GameState,
  Point,
  QuestionItem,
  RunMode,
  ThemeId,
} from './types/game';
import { soundEngine } from './utils/audio';
import {
  isInsideGrid,
  isOppositeDirection,
  keyOf,
  nextPoint,
  spawnApple,
  spawnRandomizedSpikes,
  spawnStones,
} from './utils/board';
import { chooseBestBotDirection } from './utils/bot';
import { isAnswerCorrect, pickQuestion } from './utils/questions';

const STORAGE_BEST_KEY = 'constriction_best_scores_v1';
const STORAGE_THEME_KEY = 'constriction_theme_v1';

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

type BestScoresMap = Record<DifficultyId, number>;

function loadBestScores(): BestScoresMap {
  const defaults: BestScoresMap = { easy: 0, medium: 0, hard: 0, insane: 0, extreme: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_BEST_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<BestScoresMap>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function loadTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(STORAGE_THEME_KEY) as ThemeId | null;
    if (raw && raw in GAME_THEMES) return raw;
  } catch {
    // ignore storage errors
  }
  return 'crimson';
}

export default function App() {
  const [themeId, setThemeId] = useState<ThemeId>(() => loadTheme());
  const [difficultyId, setDifficultyId] = useState<DifficultyId>('hard');
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');

  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [apple, setApple] = useState<Point | null>({ x: 15, y: 10 });
  const [stones, setStones] = useState<Point[]>([]);
  const [spikes, setSpikes] = useState<Point[]>([]);
  const [spikesSpawnedAt, setSpikesSpawnedAt] = useState<number>(0);

  const [score, setScore] = useState<number>(0);
  const [bestScores, setBestScores] = useState<BestScoresMap>(() => loadBestScores());
  const [isNewBest, setIsNewBest] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(DIFFICULTIES.hard.speed);

  // Dual concurrent timers: shorter Apple rot timer + longer Question timer
  const [appleRemaining, setAppleRemaining] = useState<number>(DIFFICULTIES.hard.appleRotSeconds);
  const [questionRemaining, setQuestionRemaining] = useState<number>(DIFFICULTIES.hard.answerSeconds);

  const [activeQuestion, setActiveQuestion] = useState<QuestionItem | null>(null);
  const [questionQueue, setQuestionQueue] = useState<QuestionItem[]>([]);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<string>('');
  const [runElapsedSeconds, setRunElapsedSeconds] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);
  const [callouts, setCallouts] = useState<FloatingCallout[]>([]);

  // Firebase Auth & Account state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [needsUsernameSetup, setNeedsUsernameSetup] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [cloudSyncNote, setCloudSyncNote] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'leaderboard' | 'account'>('leaderboard');

  const [isBotRun, setIsBotRun] = useState<boolean>(false);
  const [botThinkDots, setBotThinkDots] = useState<number>(0);
  const [runMode, setRunMode] = useState<RunMode>('standard');
  const [practiceNote, setPracticeNote] = useState<string | null>(null);

  const theme = GAME_THEMES[themeId];
  const difficulty = DIFFICULTIES[difficultyId];

  // Mutable refs for crisp 60fps loop
  const gameStateRef = useRef<GameState>(gameState);
  const isBotRunRef = useRef<boolean>(isBotRun);
  const runModeRef = useRef<RunMode>(runMode);
  const snakeRef = useRef<Point[]>(snake);
  const dirRef = useRef<Direction>(direction);
  const dirQueueRef = useRef<Direction[]>([]);
  const pendingGrowthRef = useRef<number>(0);
  const appleRef = useRef<Point | null>(apple);
  const stonesRef = useRef<Point[]>(stones);
  const spikesRef = useRef<Point[]>(spikes);
  const scoreRef = useRef<number>(score);
  const stoneFractionRef = useRef<number>(0);
  const speedRef = useRef<number>(currentSpeed);

  const appleRemainingRef = useRef<number>(appleRemaining);
  const questionRemainingRef = useRef<number>(questionRemaining);
  const activeQuestionRef = useRef<QuestionItem | null>(activeQuestion);
  const questionQueueRef = useRef<QuestionItem[]>(questionQueue);

  const usedPromptsRef = useRef<Set<string>>(new Set());
  const difficultyRef = useRef(difficulty);
  const lastUrgentTickRef = useRef<number>(0);
  const runStartMsRef = useRef<number>(0);
  const pausedDurationMsRef = useRef<number>(0);
  const pauseStartedMsRef = useRef<number>(0);
  const calloutIdRef = useRef<number>(1);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const profileRef = useRef<PlayerProfile | null>(profile);
  const modalOpenRef = useRef<boolean>(modalOpen);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    modalOpenRef.current = modalOpen;
  }, [modalOpen]);

  useEffect(() => {
    difficultyRef.current = difficulty;
    if (gameStateRef.current === 'TITLE_MENU') {
      setCurrentSpeed(difficulty.speed);
      speedRef.current = difficulty.speed;
      setAppleRemaining(difficulty.appleRotSeconds);
      appleRemainingRef.current = difficulty.appleRotSeconds;
      setQuestionRemaining(difficulty.answerSeconds);
      questionRemainingRef.current = difficulty.answerSeconds;
    }
  }, [difficulty]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setNeedsUsernameSetup(false);
        return;
      }
      setAuthLoading(true);
      void ensureUserAccount(firebaseUser)
        .then(({ profile: loadedProfile, isNewAccount }) => {
          setProfile(loadedProfile);
          setAuthError(null);
          if (isNewAccount) {
            setNeedsUsernameSetup(true);
            setModalTab('account');
            setModalOpen(true);
          }
        })
        .catch((err) => {
          setAuthError(err instanceof Error ? err.message : 'Failed to load profile.');
        })
        .finally(() => {
          setAuthLoading(false);
        });
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      const msg = err instanceof Error ? err.message : 'Sign-in cancelled or blocked.';
      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        setAuthError(
          `Domain "${host}" is not in Firebase Auth Authorized domains yet. Add it in Firebase Console → Authentication → Settings → Authorized domains.`
        );
      } else {
        setAuthError(msg);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setProfile(null);
    setNeedsUsernameSetup(false);
  };

  const handleUpdateHandle = async (newHandle: string) => {
    if (!user || !profile) return;
    const savedHandle = await updatePlayerHandle(user.uid, newHandle);
    setProfile((prev) => (prev ? { ...prev, handle: savedHandle } : prev));
  };

  const openModal = (tab: 'leaderboard' | 'account') => {
    if (gameStateRef.current === 'PLAYING') {
      pauseStartedMsRef.current = performance.now();
      gameStateRef.current = 'PAUSED';
      setGameState('PAUSED');
    }
    setModalTab(tab);
    setModalOpen(true);
  };

  const handleSelectTheme = (id: ThemeId) => {
    setThemeId(id);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, id);
    } catch {
      // ignore
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  const addCallout = useCallback((gridX: number, gridY: number, text: string, color: string) => {
    const entry: FloatingCallout = {
      id: calloutIdRef.current++,
      gridX,
      gridY,
      text,
      color,
      createdAt: performance.now(),
    };
    setCallouts((prev) => [...prev.slice(-5), entry]);
  }, []);

  const updateBestScore = useCallback((diffId: DifficultyId, candidate: number) => {
    setBestScores((prev) => {
      if (candidate <= prev[diffId]) return prev;
      const updated = { ...prev, [diffId]: candidate };
      setIsNewBest(true);
      try {
        localStorage.setItem(STORAGE_BEST_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const endGame = useCallback(
    (outcome: 'WON' | 'GAME_OVER', reason: string) => {
      if (gameStateRef.current !== 'PLAYING') return;
      gameStateRef.current = outcome;
      setGameState(outcome);
      setEndReason(reason);
      const elapsedMs = Math.max(
        0,
        performance.now() - runStartMsRef.current - pausedDurationMsRef.current
      );
      setRunElapsedSeconds(elapsedMs / 1000);
      const isRankedRun = !isBotRunRef.current && runModeRef.current === 'standard';
      if (isRankedRun) {
        updateBestScore(difficultyRef.current.id, scoreRef.current);
      }

      if (outcome === 'WON') {
        soundEngine.playVictory();
      } else {
        soundEngine.playGameOver();
      }

      if (isBotRunRef.current) {
        setCloudSyncNote('Bot run · Unranked (does not count toward Best or Leaderboard).');
        return;
      }

      if (runModeRef.current !== 'standard') {
        setCloudSyncNote('Practice run · Unranked (does not count toward Best or Leaderboard).');
        return;
      }

      const activeProf = profileRef.current;
      if (activeProf && scoreRef.current > 0) {
        setCloudSyncNote('Saving run to leaderboard...');
        void recordRunToCloud(activeProf, difficultyRef.current, scoreRef.current, elapsedMs)
          .then((updated) => {
            setProfile(updated);
            setCloudSyncNote('Saved to global leaderboard.');
          })
          .catch((err) => {
            console.error('Leaderboard sync error:', err);
            setCloudSyncNote('Could not sync run to leaderboard.');
          });
      } else if (activeProf && scoreRef.current === 0) {
        setCloudSyncNote('Answer 1+ question to post to the leaderboard.');
      } else if (!activeProf && scoreRef.current > 0) {
        setCloudSyncNote('Sign in to post this score to the global leaderboard.');
      } else {
        setCloudSyncNote(null);
      }
    },
    [updateBestScore]
  );

  const enqueueDirection = useCallback((nextDir: Direction) => {
    if (
      gameStateRef.current !== 'PLAYING' ||
      isBotRunRef.current ||
      runModeRef.current === 'practice_trivia'
    ) {
      return;
    }
    const queue = dirQueueRef.current;
    const latest = queue.length > 0 ? queue[queue.length - 1] : dirRef.current;
    if (nextDir === latest || isOppositeDirection(latest, nextDir)) return;
    if (queue.length < 2) {
      queue.push(nextDir);
    }
  }, []);

  const spawnRoundAppleAndSpikes = useCallback(
    (
      currentSnake: Point[],
      currentDir: Direction,
      currentStones: Point[],
      cfg: typeof difficulty
    ) => {
      const nextApple = spawnApple(currentSnake, currentStones, []);
      const nextSpikes = spawnRandomizedSpikes(
        getSpikeCountForDifficulty(cfg),
        currentSnake,
        currentDir,
        nextApple,
        currentStones
      );

      appleRef.current = nextApple;
      spikesRef.current = nextSpikes;
      setApple(nextApple);
      setSpikes(nextSpikes);
      setSpikesSpawnedAt(performance.now());

      appleRemainingRef.current = cfg.appleRotSeconds;
      setAppleRemaining(cfg.appleRotSeconds);
    },
    []
  );

  const startGame = useCallback(
    (mode: RunMode = 'standard', botEnabled = false) => {
      soundEngine.unlock();
      const cfg = DIFFICULTIES[difficultyId];
      const startSnake: Point[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      const startDir: Direction = 'RIGHT';

      runModeRef.current = mode;
      setRunMode(mode);
      isBotRunRef.current = botEnabled;
      setIsBotRun(botEnabled);

      usedPromptsRef.current.clear();
      snakeRef.current = startSnake;
      dirRef.current = startDir;
      dirQueueRef.current = [];
      pendingGrowthRef.current = 0;
      stonesRef.current = [];
      spikesRef.current = [];
      scoreRef.current = 0;
      stoneFractionRef.current = 0;
      speedRef.current = cfg.speed;
      runStartMsRef.current = performance.now();
      pausedDurationMsRef.current = 0;

      activeQuestionRef.current = null;
      questionQueueRef.current = [];
      questionRemainingRef.current = cfg.answerSeconds;
      lastUrgentTickRef.current = 0;

      setSnake(startSnake);
      setDirection(startDir);
      setStones([]);
      setSpikes([]);
      setScore(0);
      setIsNewBest(false);
      setCloudSyncNote(null);
      setPracticeNote(null);
      setCurrentSpeed(cfg.speed);
      setActiveQuestion(null);
      setQuestionQueue([]);
      setQuestionRemaining(cfg.answerSeconds);
      setAnswerInput('');
      setWrongFeedback(null);
      setEndReason('');
      setCallouts([]);

      if (mode === 'practice_trivia') {
        appleRef.current = null;
        setApple(null);
        appleRemainingRef.current = cfg.appleRotSeconds;
        setAppleRemaining(cfg.appleRotSeconds);

        const firstQ = pickQuestion(cfg.questionTiers, usedPromptsRef.current);
        activeQuestionRef.current = firstQ;
        setActiveQuestion(firstQ);

        gameStateRef.current = 'PLAYING';
        setGameState('PLAYING');
        setTimeout(() => answerInputRef.current?.focus(), 20);
      } else {
        spawnRoundAppleAndSpikes(startSnake, startDir, [], cfg);
        gameStateRef.current = 'PLAYING';
        setGameState('PLAYING');
      }
    },
    [difficultyId, spawnRoundAppleAndSpikes]
  );

  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'PLAYING') {
      pauseStartedMsRef.current = performance.now();
      gameStateRef.current = 'PAUSED';
      setGameState('PAUSED');
    } else if (gameStateRef.current === 'PAUSED') {
      pausedDurationMsRef.current += performance.now() - pauseStartedMsRef.current;
      gameStateRef.current = 'PLAYING';
      setGameState('PLAYING');
      if (!isBotRunRef.current && activeQuestionRef.current !== null) {
        setTimeout(() => answerInputRef.current?.focus(), 20);
      }
    }
  }, []);

  const skipPracticeQuestion = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING' || runModeRef.current !== 'practice_trivia') return;
    const currentQ = activeQuestionRef.current;
    const cfg = difficultyRef.current;
    const revealed = currentQ?.answers[0];
    if (revealed) {
      setPracticeNote(`Skipped — answer was "${revealed}"`);
    }
    const nextQ = pickQuestion(cfg.questionTiers, usedPromptsRef.current);
    activeQuestionRef.current = nextQ;
    setActiveQuestion(nextQ);
    setAnswerInput('');
    setWrongFeedback(null);
    questionRemainingRef.current = cfg.answerSeconds;
    setQuestionRemaining(cfg.answerSeconds);
    setTimeout(() => answerInputRef.current?.focus(), 10);
  }, []);

  const submitAnswerValue = useCallback(
    (rawValue: string) => {
      if (gameStateRef.current !== 'PLAYING') return;
      const currentQ = activeQuestionRef.current;
      if (!currentQ) return;

      if (isAnswerCorrect(rawValue, currentQ)) {
        soundEngine.playCorrect();
        const cfg = difficultyRef.current;
        const nextScore = scoreRef.current + 1;
        scoreRef.current = nextScore;
        setScore(nextScore);
        if (!isBotRunRef.current && runModeRef.current === 'standard') {
          updateBestScore(cfg.id, nextScore);
        }

        setAnswerInput('');
        setWrongFeedback(null);

        if (runModeRef.current === 'practice_trivia') {
          setPracticeNote(`Correct! "${currentQ.answers[0]}"`);
          if (nextScore >= cfg.winTarget) {
            activeQuestionRef.current = null;
            setActiveQuestion(null);
            endGame('WON', `Answered all ${cfg.winTarget} ${cfg.label} questions!`);
            return;
          }

          const nextQ = pickQuestion(cfg.questionTiers, usedPromptsRef.current);
          activeQuestionRef.current = nextQ;
          setActiveQuestion(nextQ);
          questionRemainingRef.current = cfg.answerSeconds;
          setQuestionRemaining(cfg.answerSeconds);
          setTimeout(() => answerInputRef.current?.focus(), 10);
          return;
        }

        pendingGrowthRef.current += 1;

        const head = snakeRef.current[0];
        addCallout(head.x, head.y, '+1', theme.appleFresh);

        if (nextScore >= cfg.winTarget) {
          activeQuestionRef.current = null;
          questionQueueRef.current = [];
          setActiveQuestion(null);
          setQuestionQueue([]);
          endGame('WON', `Answered all ${cfg.winTarget} questions!`);
          return;
        }

        const nextSpeed = Number((speedRef.current + cfg.speedRampPerAnswer).toFixed(2));
        speedRef.current = nextSpeed;
        setCurrentSpeed(nextSpeed);

        // Add permanent stone blocks safely (protecting active apple & snake head)
        if (cfg.stonesPerCorrect > 0) {
          stoneFractionRef.current += cfg.stonesPerCorrect;
          const stonesToAdd = Math.floor(stoneFractionRef.current + 1e-9);
          if (stonesToAdd > 0) {
            stoneFractionRef.current -= stonesToAdd;
            const updatedStones = spawnStones(
              stonesToAdd,
              snakeRef.current,
              dirRef.current,
              appleRef.current,
              stonesRef.current,
              spikesRef.current
            );
            stonesRef.current = updatedStones;
            setStones(updatedStones);
          }
        }

        // Advance queue: pop next question if queued, otherwise go idle until next apple
        if (questionQueueRef.current.length > 0) {
          const [nextQ, ...rest] = questionQueueRef.current;
          questionQueueRef.current = rest;
          activeQuestionRef.current = nextQ;
          setQuestionQueue(rest);
          setActiveQuestion(nextQ);

          questionRemainingRef.current = cfg.answerSeconds;
          setQuestionRemaining(cfg.answerSeconds);
          if (!isBotRunRef.current) {
            setTimeout(() => answerInputRef.current?.focus(), 10);
          }
        } else {
          activeQuestionRef.current = null;
          setActiveQuestion(null);
          questionRemainingRef.current = cfg.answerSeconds;
          setQuestionRemaining(cfg.answerSeconds);
        }
      } else {
        soundEngine.playWrong();
        setWrongFeedback(
          runModeRef.current === 'practice_trivia'
            ? 'Not quite — try again or reveal & skip!'
            : 'Not quite — keep steering!'
        );
        setAnswerInput('');
      }
    },
    [addCallout, endGame, theme.appleFresh, updateBestScore]
  );

  const handleSubmitAnswer = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (isBotRunRef.current) return;
      submitAnswerValue(answerInput);
    },
    [answerInput, submitAnswerValue]
  );

  // Global keyboard controls (PC-first: Arrow keys ALWAYS steer even while typing!)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (modalOpenRef.current) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setModalOpen(false);
        }
        return;
      }

      if (e.key === 'Escape') {
        if (gameStateRef.current === 'PLAYING' || gameStateRef.current === 'PAUSED') {
          e.preventDefault();
          togglePause();
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        enqueueDirection('UP');
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        enqueueDirection('DOWN');
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        enqueueDirection('LEFT');
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        enqueueDirection('RIGHT');
        return;
      }

      // WASD steers whenever no question is active (input disabled)
      const inputFocused = document.activeElement === answerInputRef.current;
      if (!inputFocused && activeQuestionRef.current === null) {
        const lower = e.key.toLowerCase();
        if (lower === 'w') {
          e.preventDefault();
          enqueueDirection('UP');
        } else if (lower === 's') {
          e.preventDefault();
          enqueueDirection('DOWN');
        } else if (lower === 'a') {
          e.preventDefault();
          enqueueDirection('LEFT');
        } else if (lower === 'd') {
          e.preventDefault();
          enqueueDirection('RIGHT');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enqueueDirection, togglePause]);

  // Main 60fps game loop (concurrent Apple timer + Question timer + fixed-step movement)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let rafId = 0;
    let lastFrame = performance.now();
    let stepAccumulator = 0;
    let uiTimerSyncAccumulator = 0;

    const tick = (now: number) => {
      if (gameStateRef.current !== 'PLAYING') return;

      const dtMs = Math.min(80, now - lastFrame);
      const dtSec = dtMs / 1000;
      lastFrame = now;

      const mode = runModeRef.current;

      // Trivia-only practice: only run the question countdown (no apple or snake movement)
      if (mode === 'practice_trivia') {
        if (activeQuestionRef.current !== null) {
          questionRemainingRef.current = Math.max(0, questionRemainingRef.current - dtSec);
          if (questionRemainingRef.current <= 0) {
            setQuestionRemaining(0);
            const missedAns = activeQuestionRef.current.answers[0];
            endGame(
              'GAME_OVER',
              missedAns
                ? `Time ran out (answer: "${missedAns}").`
                : 'Time ran out on the question.'
            );
            return;
          }

          if (
            questionRemainingRef.current > 0 &&
            questionRemainingRef.current <= 2.0 &&
            now - lastUrgentTickRef.current > 550
          ) {
            lastUrgentTickRef.current = now;
            soundEngine.playUrgentTick();
          }

          uiTimerSyncAccumulator += dtMs;
          if (uiTimerSyncAccumulator >= 33) {
            uiTimerSyncAccumulator = 0;
            setQuestionRemaining(questionRemainingRef.current);
          }
        }

        rafId = requestAnimationFrame(tick);
        return;
      }

      // 1. Apple rot timer runs during standard and snake-practice play
      appleRemainingRef.current = Math.max(0, appleRemainingRef.current - dtSec);
      if (appleRemainingRef.current <= 0) {
        setAppleRemaining(0);
        endGame('GAME_OVER', 'The apple rotted before you reached it.');
        return;
      }

      // 2. Question timer runs whenever an active question is open
      if (mode === 'standard' && activeQuestionRef.current !== null) {
        questionRemainingRef.current = Math.max(0, questionRemainingRef.current - dtSec);
        if (questionRemainingRef.current <= 0) {
          setQuestionRemaining(0);
          endGame('GAME_OVER', 'Time ran out on the question.');
          return;
        }
      }

      // Urgent audio tick when either timer is < 2.0s
      const minTimer =
        mode === 'standard' && activeQuestionRef.current !== null
          ? Math.min(appleRemainingRef.current, questionRemainingRef.current)
          : appleRemainingRef.current;
      if (minTimer > 0 && minTimer <= 2.0 && now - lastUrgentTickRef.current > 550) {
        lastUrgentTickRef.current = now;
        soundEngine.playUrgentTick();
      }

      uiTimerSyncAccumulator += dtMs;
      if (uiTimerSyncAccumulator >= 33) {
        uiTimerSyncAccumulator = 0;
        setAppleRemaining(appleRemainingRef.current);
        if (mode === 'standard' && activeQuestionRef.current !== null) {
          setQuestionRemaining(questionRemainingRef.current);
        }
      }

      // 3. Fixed-step snake grid movement
      const stepIntervalMs = 1000 / speedRef.current;
      stepAccumulator += dtMs;

      let stepped = false;
      while (stepAccumulator >= stepIntervalMs) {
        stepAccumulator -= stepIntervalMs;
        stepped = true;

        if (isBotRunRef.current) {
          dirRef.current = chooseBestBotDirection(
            snakeRef.current,
            dirRef.current,
            appleRef.current,
            stonesRef.current,
            spikesRef.current,
            pendingGrowthRef.current
          );
        } else if (dirQueueRef.current.length > 0) {
          const nextD = dirQueueRef.current.shift()!;
          if (!isOppositeDirection(dirRef.current, nextD)) {
            dirRef.current = nextD;
          }
        }

        const currentSnake = snakeRef.current;
        const head = currentSnake[0];
        const nextHead = nextPoint(head, dirRef.current);

        if (!isInsideGrid(nextHead)) {
          endGame('GAME_OVER', 'Slammed into the arena wall.');
          return;
        }

        const nextKey = keyOf(nextHead);
        if (stonesRef.current.some((st) => keyOf(st) === nextKey)) {
          endGame('GAME_OVER', 'Crashed into a stone block.');
          return;
        }

        if (spikesRef.current.some((sp) => keyOf(sp) === nextKey)) {
          endGame('GAME_OVER', 'Impaled on a randomized spike.');
          return;
        }

        const willGrow = pendingGrowthRef.current > 0;
        const bodyLimit = willGrow ? currentSnake.length : currentSnake.length - 1;
        for (let i = 0; i < bodyLimit; i++) {
          if (currentSnake[i].x === nextHead.x && currentSnake[i].y === nextHead.y) {
            endGame('GAME_OVER', 'Bit your own tail.');
            return;
          }
        }

        const nextSnake = [nextHead, ...currentSnake];
        if (willGrow) {
          pendingGrowthRef.current -= 1;
        } else {
          nextSnake.pop();
        }
        snakeRef.current = nextSnake;

        // Check apple eat
        const curApple = appleRef.current;
        if (curApple && nextHead.x === curApple.x && nextHead.y === curApple.y) {
          soundEngine.playAppleEat();
          const cfg = difficultyRef.current;

          if (mode === 'practice_snake') {
            const nextScore = scoreRef.current + 1;
            scoreRef.current = nextScore;
            setScore(nextScore);
            pendingGrowthRef.current += 1;
            addCallout(nextHead.x, nextHead.y, '+1', theme.appleFresh);

            if (nextScore >= cfg.winTarget) {
              endGame('WON', `Cleared all ${cfg.winTarget} apples in Snake Practice!`);
              return;
            }

            const nextSpeed = Number((speedRef.current + cfg.speedRampPerAnswer).toFixed(2));
            speedRef.current = nextSpeed;
            setCurrentSpeed(nextSpeed);

            if (cfg.stonesPerCorrect > 0) {
              stoneFractionRef.current += cfg.stonesPerCorrect;
              const stonesToAdd = Math.floor(stoneFractionRef.current + 1e-9);
              if (stonesToAdd > 0) {
                stoneFractionRef.current -= stonesToAdd;
                const updatedStones = spawnStones(
                  stonesToAdd,
                  nextSnake,
                  dirRef.current,
                  null,
                  stonesRef.current,
                  []
                );
                stonesRef.current = updatedStones;
                setStones(updatedStones);
              }
            }
          } else {
            const newQ = pickQuestion(cfg.questionTiers, usedPromptsRef.current);

            if (activeQuestionRef.current === null) {
              activeQuestionRef.current = newQ;
              setActiveQuestion(newQ);
              setAnswerInput('');
              setWrongFeedback(null);
              questionRemainingRef.current = cfg.answerSeconds;
              setQuestionRemaining(cfg.answerSeconds);
              addCallout(nextHead.x, nextHead.y, 'CHOMP!', theme.accent);
              if (!isBotRunRef.current) {
                setTimeout(() => answerInputRef.current?.focus(), 10);
              }
            } else {
              const nextQueue = [...questionQueueRef.current, newQ];
              questionQueueRef.current = nextQueue;
              setQuestionQueue(nextQueue);
              addCallout(nextHead.x, nextHead.y, `Q+${nextQueue.length}`, theme.accent);
            }
          }

          // Immediately spawn fresh apple (and re-randomize spikes on Insane/Extreme)
          spawnRoundAppleAndSpikes(nextSnake, dirRef.current, stonesRef.current, cfg);
        }
      }

      if (stepped) {
        setSnake(snakeRef.current);
        setDirection(dirRef.current);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, addCallout, endGame, spawnRoundAppleAndSpikes, theme.accent]);

  // Bot realistic thinking pause + variable human-like typing while Watch Bot is active
  useEffect(() => {
    if (gameState !== 'PLAYING' || !isBotRun || !activeQuestion) {
      setBotThinkDots(0);
      return;
    }

    const target = activeQuestion.answers[0] ?? '';
    const promptLen = activeQuestion.prompt.length;
    const maxBudgetMs = Math.max(2200, difficultyRef.current.answerSeconds * 1000 - 3500);
    // Longer prompts / harder tiers look like they take slightly longer to compute, while staying well within timer
    const baseThinkMs =
      950 + Math.min(950, promptLen * 24) + Math.floor(Math.random() * 550);
    const thinkDelayMs = Math.min(maxBudgetMs - target.length * 140, Math.max(900, baseThinkMs));

    let charIdx = 0;
    let cancelled = false;
    let timerId: number | undefined;
    let dotTimerId: number | undefined;

    setBotThinkDots(1);
    dotTimerId = window.setInterval(() => {
      if (!cancelled) {
        setBotThinkDots((d) => (d % 3) + 1);
      }
    }, 320);

    const stepType = () => {
      if (cancelled || gameStateRef.current !== 'PLAYING') return;
      if (dotTimerId !== undefined) {
        window.clearInterval(dotTimerId);
        dotTimerId = undefined;
        setBotThinkDots(0);
      }
      if (charIdx < target.length) {
        charIdx += 1;
        setAnswerInput(target.slice(0, charIdx));
        soundEngine.playKeyType(false);
        if (charIdx >= target.length) {
          timerId = window.setTimeout(() => {
            if (!cancelled && gameStateRef.current === 'PLAYING') {
              submitAnswerValue(target);
            }
          }, 55);
        } else {
          const nextCharDelay = 85 + Math.floor(Math.random() * 65);
          timerId = window.setTimeout(stepType, nextCharDelay);
        }
      }
    };

    timerId = window.setTimeout(stepType, thinkDelayMs);

    return () => {
      cancelled = true;
      setBotThinkDots(0);
      if (timerId !== undefined) window.clearTimeout(timerId);
      if (dotTimerId !== undefined) window.clearInterval(dotTimerId);
    };
  }, [gameState, isBotRun, activeQuestion, submitAnswerValue]);

  // Clean up expired floating callouts
  useEffect(() => {
    if (callouts.length === 0) return;
    const t = setTimeout(() => {
      const now = performance.now();
      setCallouts((prev) => prev.filter((c) => now - c.createdAt < 750));
    }, 300);
    return () => clearTimeout(t);
  }, [callouts]);

  const appleRatio = useMemo(() => {
    if (difficulty.appleRotSeconds <= 0) return 0;
    return Math.max(0, Math.min(1, appleRemaining / difficulty.appleRotSeconds));
  }, [appleRemaining, difficulty.appleRotSeconds]);

  const questionRatio = useMemo(() => {
    if (difficulty.answerSeconds <= 0) return 0;
    return Math.max(0, Math.min(1, questionRemaining / difficulty.answerSeconds));
  }, [questionRemaining, difficulty.answerSeconds]);

  const cloudBestForSelected = profile ? profile[getBestFieldForDifficulty(difficultyId)] : 0;
  const bestForSelected = Math.max(bestScores[difficultyId] ?? 0, cloudBestForSelected);

  const getBarColor = (ratio: number) =>
    ratio < 0.25 ? '#EF4444' : ratio < 0.5 ? '#F59E0B' : theme.accent;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-3 py-3 sm:py-4 transition-colors duration-200"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <main className="w-full max-w-[520px] md:max-w-[880px] flex flex-col gap-2.5 md:gap-3">
        {/* Compact Account, Leaderboard & Utility Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => openModal('leaderboard')}
              className="min-h-[38px] px-2.5 py-1.5 text-[11px] sm:text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap hover:opacity-90"
              style={{
                backgroundColor: theme.panelBg,
                borderColor: theme.panelBorder,
                color: theme.text,
              }}
            >
              <Trophy className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              Leaderboard
            </button>
            <button
              type="button"
              onClick={() => openModal('account')}
              className="min-h-[38px] px-2.5 py-1.5 text-[11px] sm:text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap max-w-[165px] hover:opacity-90"
              style={{
                backgroundColor: theme.panelBg,
                borderColor: user ? theme.accent : theme.panelBorder,
                color: theme.text,
              }}
            >
              <UserIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {user ? profile?.handle ?? 'Account' : 'Sign in'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
              <button
                type="button"
                onClick={togglePause}
                className="w-9 h-9 flex items-center justify-center border hover:opacity-90"
                style={{
                  borderColor: theme.panelBorder,
                  backgroundColor: theme.panelBg,
                  color: theme.text,
                }}
                aria-label={gameState === 'PAUSED' ? 'Resume game' : 'Pause game'}
                title={gameState === 'PAUSED' ? 'Resume (Esc)' : 'Pause (Esc)'}
              >
                {gameState === 'PAUSED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={toggleMute}
              className="w-9 h-9 flex items-center justify-center border hover:opacity-90"
              style={{
                borderColor: theme.panelBorder,
                backgroundColor: theme.panelBg,
                color: theme.text,
              }}
              aria-label={muted ? 'Unmute sound' : 'Mute sound'}
              title={muted ? 'Unmute sound' : 'Mute sound'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mascot + CONSTRICTION Logo */}
        <header className="flex items-center justify-center gap-4">
          <SnakeLogo theme={theme} className="w-12 h-14 sm:w-14 sm:h-16 shrink-0" />
          <h1
            className="font-display-pixel text-xl sm:text-2xl tracking-wider select-none"
            style={{
              color: theme.accent,
              textShadow: '2px 2px 0px rgba(0,0,0,0.85)',
            }}
          >
            CONSTRICTION
          </h1>
        </header>

        {/* 6 Theme Swatches */}
        <div className="flex items-center justify-center gap-2.5" role="group" aria-label="Color theme">
          {THEME_ORDER.map((id) => {
            const t = GAME_THEMES[id];
            const active = id === themeId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectTheme(id)}
                title={`${t.name} theme`}
                aria-label={`${t.name} theme`}
                aria-pressed={active}
                className="w-8 h-8 sm:w-9 sm:h-9 p-[3px] transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  border: active ? `2px solid ${theme.text}` : `1px solid ${theme.panelBorder}`,
                  backgroundColor: theme.panelBg,
                }}
              >
                <span
                  className="block w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${t.swatchTopLeft} 0%, ${t.swatchTopLeft} 49%, ${t.swatchBottomRight} 51%, ${t.swatchBottomRight} 100%)`,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Tagline */}
        <p
          className="text-center text-[11px] sm:text-xs leading-snug px-2"
          style={{ color: theme.muted }}
        >
          Eat each apple before it rots to queue questions, and answer them before time runs out. The snake never stops.
        </p>

        {/* Responsive Play Layout: stacked on mobile, Board (left) + Question (right) on computer */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,480px)_minmax(300px,1fr)] gap-2.5 md:gap-5 items-stretch">
          {/* HUD Telemetry Row + Dual Timers */}
          <section className="md:col-start-1 flex flex-col gap-1.5" aria-label="Game status">
          <div className="flex items-center justify-between text-xs sm:text-sm tabular-nums">
            <span>
              Score {score}/{difficulty.winTarget}
            </span>
            <span>
              {runMode === 'practice_trivia' && gameState !== 'TITLE_MENU'
                ? 'Trivia drill'
                : `Speed ${currentSpeed.toFixed(1)}/s`}
            </span>
            <span>
              {isBotRun && gameState !== 'TITLE_MENU'
                ? 'Bot · Unranked'
                : runMode !== 'standard' && gameState !== 'TITLE_MENU'
                  ? 'Practice · Unranked'
                  : `Best ${bestForSelected}`}
            </span>
          </div>

          {/* Apple Rot Timer (always active during standard / snake practice) */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] sm:text-xs w-14 shrink-0" style={{ color: theme.muted }}>
              Apple
            </span>
            <div
              className="relative flex-1 h-2 overflow-hidden"
              style={{ backgroundColor: theme.panelBg, border: `1px solid ${theme.panelBorder}` }}
            >
              <div
                className="h-full transition-[width] duration-75 ease-linear"
                style={{
                  width: `${
                    gameState === 'PLAYING' && runMode !== 'practice_trivia' ? appleRatio * 100 : 0
                  }%`,
                  backgroundColor:
                    runMode === 'practice_trivia' ? theme.panelBorder : getBarColor(appleRatio),
                }}
              />
            </div>
            <span className="text-[11px] tabular-nums w-11 text-right shrink-0" style={{ color: theme.muted }}>
              {runMode === 'practice_trivia' && gameState !== 'TITLE_MENU'
                ? 'Off'
                : gameState === 'PLAYING'
                  ? `${appleRemaining.toFixed(1)}s`
                  : `${difficulty.appleRotSeconds}s`}
            </span>
          </div>

          {/* Question Timer (active whenever a question is in the box) */}
          <div className="flex items-center gap-2.5">
            <span
              className="text-[11px] sm:text-xs w-14 shrink-0"
              style={{
                color:
                  runMode !== 'practice_snake' && activeQuestion ? theme.accent : theme.muted,
              }}
            >
              Answer
            </span>
            <div
              className="relative flex-1 h-2 overflow-hidden"
              style={{ backgroundColor: theme.panelBg, border: `1px solid ${theme.panelBorder}` }}
            >
              <div
                className="h-full transition-[width] duration-75 ease-linear"
                style={{
                  width: `${
                    gameState === 'PLAYING' &&
                    runMode !== 'practice_snake' &&
                    activeQuestion
                      ? questionRatio * 100
                      : 0
                  }%`,
                  backgroundColor:
                    runMode !== 'practice_snake' && activeQuestion
                      ? getBarColor(questionRatio)
                      : theme.panelBorder,
                }}
              />
            </div>
            <span className="text-[11px] tabular-nums w-11 text-right shrink-0" style={{ color: theme.muted }}>
              {runMode === 'practice_snake' && gameState !== 'TITLE_MENU'
                ? 'Off'
                : gameState === 'PLAYING' && activeQuestion
                  ? `${questionRemaining.toFixed(1)}s`
                  : `${difficulty.answerSeconds}s`}
            </span>
          </div>
        </section>

        {/* Play Arena */}
        <section
          className="md:col-start-1 md:row-start-2 relative w-full aspect-square overflow-hidden crt-scanlines"
          style={{
            border: `2px solid ${theme.accent}`,
            backgroundColor: theme.arenaBg,
          }}
        >
          <GameCanvas
            snake={snake}
            direction={direction}
            apple={apple}
            appleRotRatio={appleRatio}
            stones={stones}
            spikes={spikes}
            spikesSpawnedAt={spikesSpawnedAt}
            theme={theme}
            callouts={callouts}
            isPlaying={gameState === 'PLAYING' && runMode !== 'practice_trivia'}
          />

          {/* TRIVIA PRACTICE ARENA VIEW */}
          {gameState === 'PLAYING' && runMode === 'practice_trivia' && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center crt-scanlines"
              style={{ backgroundColor: 'rgba(11, 11, 17, 0.90)' }}
            >
              <p className="text-[11px] mb-1.5" style={{ color: theme.muted }}>
                {difficulty.label} · Unranked Drill
              </p>
              <h2 className="font-display-pixel text-base sm:text-lg mb-3" style={{ color: theme.accent }}>
                TRIVIA PRACTICE
              </h2>
              <div
                className="w-full max-w-[270px] p-3 mb-4 border text-xs tabular-nums flex flex-col gap-1.5"
                style={{
                  backgroundColor: theme.panelBg,
                  borderColor: theme.panelBorder,
                }}
              >
                <div className="flex justify-between">
                  <span style={{ color: theme.muted }}>Progress</span>
                  <span>
                    {score}/{difficulty.winTarget}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.muted }}>Timer per Q</span>
                  <span>{difficulty.answerSeconds}s</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.muted }}>Snake hazards</span>
                  <span>Disabled</span>
                </div>
              </div>
              {practiceNote && (
                <p className="text-xs mb-4 max-w-[280px]" style={{ color: theme.text }}>
                  {practiceNote}
                </p>
              )}
              <button
                type="button"
                onClick={skipPracticeQuestion}
                className="min-h-[38px] px-4 py-1.5 text-xs font-bold border hover:opacity-90 whitespace-nowrap"
                style={{
                  backgroundColor: theme.panelBg,
                  color: theme.text,
                  borderColor: theme.panelBorder,
                }}
              >
                Reveal & skip
              </button>
            </div>
          )}

          {/* Touch swipe fallback on arena */}
          {gameState === 'PLAYING' && runMode !== 'practice_trivia' && (
            <div
              className="absolute inset-0 z-10 touch-none"
              onTouchStart={(e) => {
                const t = e.touches[0];
                touchStartRef.current = { x: t.clientX, y: t.clientY };
              }}
              onTouchEnd={(e) => {
                if (!touchStartRef.current) return;
                const t = e.changedTouches[0];
                const dx = t.clientX - touchStartRef.current.x;
                const dy = t.clientY - touchStartRef.current.y;
                touchStartRef.current = null;
                if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
                if (Math.abs(dx) > Math.abs(dy)) {
                  enqueueDirection(dx > 0 ? 'RIGHT' : 'LEFT');
                } else {
                  enqueueDirection(dy > 0 ? 'DOWN' : 'UP');
                }
              }}
            />
          )}

          {/* TITLE MENU OVERLAY */}
          {gameState === 'TITLE_MENU' && (
            <div
              className="absolute inset-0 z-20 flex flex-col justify-center p-3.5 sm:p-6 crt-scanlines"
              style={{ backgroundColor: 'rgba(11, 11, 17, 0.92)' }}
            >
              <h2 className="text-xs sm:text-base font-bold mb-2 sm:mb-3" style={{ color: theme.text }}>
                Pick a difficulty
              </h2>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 mb-2.5 sm:mb-3">
                {DIFFICULTY_ORDER.map((id) => {
                  const cfg = DIFFICULTIES[id];
                  const selected = id === difficultyId;
                  const isFullWidth = id === 'extreme';
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setDifficultyId(id)}
                      className={`min-h-[36px] sm:min-h-[42px] px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        isFullWidth ? 'col-span-2' : ''
                      }`}
                      style={{
                        backgroundColor: selected ? 'rgba(255,255,255,0.12)' : theme.panelBg,
                        color: theme.text,
                        border: selected ? `2px solid ${theme.text}` : `1px solid ${theme.panelBorder}`,
                        boxShadow: selected ? `inset 0 0 0 1px ${theme.panelBorder}` : 'none',
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              <p
                className="text-[11px] sm:text-xs leading-snug sm:leading-relaxed mb-2.5 sm:mb-3.5 min-h-[2.6rem] sm:min-h-[3rem]"
                style={{ color: theme.muted }}
              >
                {difficulty.description}
              </p>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => startGame('standard', false)}
                  className="w-full min-h-[40px] sm:min-h-[44px] py-2 px-4 text-xs sm:text-base font-bold pixel-shadow transition-transform active:translate-y-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap"
                  style={{
                    backgroundColor: theme.buttonBg,
                    color: theme.buttonText,
                  }}
                >
                  Start game
                </button>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => startGame('practice_snake', false)}
                    className="min-h-[36px] sm:min-h-[38px] py-1.5 px-2 text-[11px] sm:text-xs font-bold border hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap"
                    style={{
                      backgroundColor: theme.panelBg,
                      color: theme.text,
                      borderColor: theme.panelBorder,
                    }}
                  >
                    Practice Snake
                  </button>
                  <button
                    type="button"
                    onClick={() => startGame('practice_trivia', false)}
                    className="min-h-[36px] sm:min-h-[38px] py-1.5 px-2 text-[11px] sm:text-xs font-bold border hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap"
                    style={{
                      backgroundColor: theme.panelBg,
                      color: theme.text,
                      borderColor: theme.panelBorder,
                    }}
                  >
                    Practice Trivia
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => startGame('standard', true)}
                  className="w-full min-h-[34px] sm:min-h-[38px] py-1.5 px-4 text-[11px] sm:text-xs font-bold border flex items-center justify-center gap-2 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap"
                  style={{
                    backgroundColor: theme.panelBg,
                    color: theme.text,
                    borderColor: theme.panelBorder,
                  }}
                >
                  <Bot className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                  Watch Bot (unranked)
                </button>
              </div>
            </div>
          )}

          {/* PAUSED OVERLAY */}
          {gameState === 'PAUSED' && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center crt-scanlines"
              style={{ backgroundColor: 'rgba(11, 11, 17, 0.88)' }}
            >
              <h2 className="font-display-pixel text-lg sm:text-xl mb-2" style={{ color: theme.accent }}>
                PAUSED
              </h2>
              <p className="text-xs mb-5" style={{ color: theme.muted }}>
                {difficulty.label}
                {runMode === 'practice_snake'
                  ? ' · Snake Practice'
                  : runMode === 'practice_trivia'
                    ? ' · Trivia Practice'
                    : isBotRun
                      ? ' · Bot'
                      : ''}{' '}
                · Score {score}/{difficulty.winTarget}
              </p>
              <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
                <button
                  type="button"
                  onClick={togglePause}
                  className="min-h-[44px] py-2 px-4 text-sm font-bold pixel-shadow"
                  style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => {
                    isBotRunRef.current = false;
                    setIsBotRun(false);
                    runModeRef.current = 'standard';
                    setRunMode('standard');
                    setGameState('TITLE_MENU');
                  }}
                  className="min-h-[44px] py-2 px-4 text-xs border"
                  style={{
                    backgroundColor: theme.panelBg,
                    color: theme.text,
                    borderColor: theme.panelBorder,
                  }}
                >
                  Change difficulty
                </button>
              </div>
            </div>
          )}

          {/* WIN / GAME OVER OVERLAY */}
          {(gameState === 'WON' || gameState === 'GAME_OVER') && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-5 text-center crt-scanlines"
              style={{ backgroundColor: 'rgba(11, 11, 17, 0.92)' }}
            >
              <h2
                className="font-display-pixel text-lg sm:text-xl mb-1.5"
                style={{ color: gameState === 'WON' ? '#4ADE80' : theme.accent }}
              >
                {isBotRun
                  ? gameState === 'WON'
                    ? 'BOT VICTORY'
                    : 'BOT OVER'
                  : runMode !== 'standard'
                    ? gameState === 'WON'
                      ? 'PRACTICE CLEARED'
                      : 'PRACTICE OVER'
                    : gameState === 'WON'
                      ? 'VICTORY'
                      : 'GAME OVER'}
              </h2>
              <p className="text-xs sm:text-sm mb-3 max-w-[300px]" style={{ color: theme.text }}>
                {endReason}
              </p>

              <div
                className="w-full max-w-[280px] p-3 mb-3 border text-xs tabular-nums flex flex-col gap-1.5"
                style={{
                  backgroundColor: theme.panelBg,
                  borderColor: theme.panelBorder,
                }}
              >
                <div className="flex justify-between">
                  <span style={{ color: theme.muted }}>Mode</span>
                  <span>
                    {difficulty.label}
                    {runMode === 'practice_snake'
                      ? ' (Snake)'
                      : runMode === 'practice_trivia'
                        ? ' (Trivia)'
                        : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.muted }}>Score</span>
                  <span>
                    {score}/{difficulty.winTarget}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.muted }}>Run time</span>
                  <span>{runElapsedSeconds.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.muted }}>Best</span>
                  <span
                    style={{
                      color:
                        !isBotRun && runMode === 'standard' && isNewBest ? theme.accent : theme.text,
                    }}
                  >
                    {bestForSelected}
                    {!isBotRun && runMode === 'standard' && isNewBest ? ' (New!)' : ''}
                  </span>
                </div>
              </div>

              {cloudSyncNote && (
                <p className="text-[11px] mb-3" style={{ color: theme.muted }}>
                  {cloudSyncNote}
                </p>
              )}

              <div className="flex flex-col gap-2 w-full max-w-[280px]">
                <button
                  type="button"
                  onClick={() => startGame(runMode, isBotRun)}
                  className="min-h-[42px] py-2 px-4 text-sm font-bold pixel-shadow transition-transform active:translate-y-[2px]"
                  style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                >
                  {isBotRun
                    ? 'Watch Bot again'
                    : runMode !== 'standard'
                      ? 'Practice again'
                      : 'Play again'}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      isBotRunRef.current = false;
                      setIsBotRun(false);
                      runModeRef.current = 'standard';
                      setRunMode('standard');
                      setGameState('TITLE_MENU');
                    }}
                    className="min-h-[40px] py-2 px-2 text-xs border whitespace-nowrap"
                    style={{
                      backgroundColor: theme.panelBg,
                      color: theme.text,
                      borderColor: theme.panelBorder,
                    }}
                  >
                    Difficulty
                  </button>
                  {isBotRun || runMode !== 'standard' ? (
                    <button
                      type="button"
                      onClick={() => startGame('standard', false)}
                      className="min-h-[40px] py-2 px-2 text-xs border whitespace-nowrap"
                      style={{
                        backgroundColor: theme.panelBg,
                        color: theme.text,
                        borderColor: theme.panelBorder,
                      }}
                    >
                      {isBotRun ? 'Play yourself' : 'Play full mode'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openModal(user ? 'leaderboard' : 'account')}
                      className="min-h-[40px] py-2 px-2 text-xs border whitespace-nowrap"
                      style={{
                        backgroundColor: theme.panelBg,
                        color: theme.text,
                        borderColor: theme.panelBorder,
                      }}
                    >
                      {user ? 'Leaderboard' : 'Sign in'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right-Side (Desktop) / Bottom (Mobile) Question & Answer Box */}
        <section
          className="md:col-start-2 md:row-start-2 w-full p-3.5 sm:p-4 md:p-5 border crt-scanlines flex flex-col justify-between gap-3 md:gap-4"
          style={{
            backgroundColor: theme.panelBg,
            borderColor: theme.panelBorder,
          }}
          aria-live="polite"
        >
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <span
              style={{
                color:
                  runMode !== 'practice_snake' && activeQuestion ? theme.accent : theme.muted,
              }}
            >
              {gameState === 'PLAYING' && runMode === 'practice_snake'
                ? `Snake Practice · ${difficulty.label}`
                : gameState === 'PLAYING' && activeQuestion
                  ? `${activeQuestion.category}${questionQueue.length > 0 ? ` · ${questionQueue.length} queued` : ''}`
                  : `${difficulty.label} · ${difficulty.winTarget} to win`}
            </span>
            <span className="tabular-nums" style={{ color: theme.muted }}>
              {gameState === 'PLAYING' && runMode === 'practice_snake'
                ? 'Unranked'
                : gameState === 'PLAYING' && activeQuestion
                  ? `${questionRemaining.toFixed(1)}s`
                  : isBotRun && gameState === 'PLAYING'
                    ? 'Bot active'
                    : 'Question'}
            </span>
          </div>

          <div className="min-h-[3.4rem] md:flex-1 flex flex-col justify-center">
            {gameState === 'PLAYING' && runMode === 'practice_snake' ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs sm:text-sm md:text-base font-bold" style={{ color: theme.text }}>
                  Snake-only practice active
                </p>
                <p className="text-[11px] sm:text-xs leading-relaxed" style={{ color: theme.muted }}>
                  No questions here—just eat {difficulty.winTarget} apples before they rot while dodging{' '}
                  {difficulty.spikesPerApple > 0
                    ? `${formatSpikeCount(difficulty)} shifting spikes.`
                    : difficulty.stonesPerCorrect > 0
                      ? 'incoming stone blocks.'
                      : 'walls and your tail.'}
                </p>
              </div>
            ) : gameState === 'PLAYING' && activeQuestion ? (
              <>
                <p
                  className="text-sm sm:text-base md:text-lg font-bold leading-snug"
                  style={{ color: theme.text }}
                >
                  {activeQuestion.prompt}
                </p>
                {wrongFeedback && (
                  <p className="text-[11px] sm:text-xs mt-1.5" style={{ color: '#F87171' }}>
                    {wrongFeedback}
                  </p>
                )}
              </>
            ) : gameState === 'PLAYING' ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs sm:text-sm md:text-base font-bold" style={{ color: theme.text }}>
                  {isBotRun ? 'Bot hunting the apple...' : 'Eat the apple before it rots!'}
                </p>
                <p className="text-[11px] sm:text-xs leading-relaxed" style={{ color: theme.muted }}>
                  {isBotRun
                    ? 'Algorithmic BFS pathfinder active · Esc to pause'
                    : 'Every apple adds a question to your queue while spawning the next apple.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs sm:text-sm md:text-base font-bold" style={{ color: theme.text }}>
                  Eat an apple to get a question.
                </p>
                <p className="hidden md:block text-xs leading-relaxed" style={{ color: theme.muted }}>
                  Pick standard play, Snake-only practice, or Trivia-only practice on the board.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <form onSubmit={handleSubmitAnswer} className="flex items-stretch gap-2">
              <input
                ref={answerInputRef}
                type="text"
                value={answerInput}
                readOnly={isBotRun}
                onChange={(e) => {
                  if (isBotRun) return;
                  const nextVal = e.target.value;
                  if (nextVal !== answerInput) {
                    soundEngine.playKeyType(nextVal.length < answerInput.length);
                  }
                  const currentQ = activeQuestionRef.current;
                  if (currentQ && isAnswerCorrect(nextVal, currentQ)) {
                    submitAnswerValue(nextVal);
                    return;
                  }
                  if (wrongFeedback) setWrongFeedback(null);
                  setAnswerInput(nextVal);
                }}
                disabled={
                  gameState !== 'PLAYING' ||
                  runMode === 'practice_snake' ||
                  activeQuestion === null
                }
                placeholder={
                  runMode === 'practice_snake' && gameState === 'PLAYING'
                    ? 'Trivia disabled in Snake Practice'
                    : isBotRun
                      ? botThinkDots > 0
                        ? `Bot thinking${'.'.repeat(botThinkDots)}`
                        : 'Bot typing...'
                      : 'Type answer (auto-checks)'
                }
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="font-mono-input flex-1 min-h-[42px] px-3 text-sm border outline-none transition-colors disabled:opacity-45"
                style={{
                  backgroundColor: theme.arenaBg,
                  borderColor:
                    gameState === 'PLAYING' &&
                    runMode !== 'practice_snake' &&
                    activeQuestion !== null
                      ? theme.accent
                      : theme.panelBorder,
                  color: theme.text,
                }}
              />
            </form>

            <div
              className="hidden md:flex items-center justify-between pt-2.5 border-t text-[11px]"
              style={{ borderColor: theme.panelBorder, color: theme.muted }}
            >
              <span>
                {runMode === 'practice_trivia' && gameState === 'PLAYING'
                  ? 'Auto-checks as you type · Esc pause'
                  : isBotRun
                    ? 'Bot · Unranked · Esc pause'
                    : 'Arrows steer · Auto-checks answer'}
              </span>
              <span>
                {runMode === 'practice_trivia' && gameState === 'PLAYING'
                  ? `${difficulty.answerSeconds}s per question`
                  : difficulty.spikesPerApple > 0
                    ? `${formatSpikeCount(difficulty)} spikes/apple`
                    : difficulty.stonesPerCorrect > 0
                      ? `${difficulty.stonesPerCorrect === 1 ? '1 stone/answer' : '1 stone / 2 ans'}`
                      : 'Clear arena'}
              </span>
            </div>
          </div>
        </section>
        </div>
      </main>

      <AccountModal
        isOpen={modalOpen}
        initialTab={modalTab}
        initialDifficulty={difficultyId}
        onClose={() => setModalOpen(false)}
        theme={theme}
        user={user}
        profile={profile}
        needsUsernameSetup={needsUsernameSetup}
        onCompleteUsernameSetup={() => setNeedsUsernameSetup(false)}
        authLoading={authLoading}
        authError={authError}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onUpdateHandle={handleUpdateHandle}
        localBests={bestScores}
      />
    </div>
  );
}
