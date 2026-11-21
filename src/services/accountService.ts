import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { DIFFICULTIES, DIFFICULTY_ORDER } from '../constants/difficulties';
import { OperationType, db, handleFirestoreError } from '../firebase';
import type { DifficultyConfig, DifficultyId } from '../types/game';

export interface PlayerProfile {
  uid: string;
  handle: string;
  bestEasy: number;
  bestMedium: number;
  bestHard: number;
  bestInsane: number;
  bestExtreme: number;
}

export interface LeaderboardEntry {
  id: string;
  uid: string;
  handle: string;
  difficulty: DifficultyId;
  score: number;
  winTarget: number;
  won: boolean;
  durationMs: number;
}

export const HANDLE_MIN_LENGTH = 2;
export const HANDLE_MAX_LENGTH = 20;
const HANDLE_REGEX = /^[a-zA-Z0-9_\- ]+$/;

const RESERVED_EXACT_HANDLES = new Set([
  'admin',
  'administrator',
  'mod',
  'moderator',
  'staff',
  'owner',
  'dev',
  'developer',
  'system',
  'support',
  'official',
  'constriction',
  'bot',
]);

const BLOCKED_HANDLE_TERMS = [
  'nigger',
  'nigga',
  'faggot',
  'fag',
  'retard',
  'kike',
  'chink',
  'spic',
  'wetback',
  'tranny',
  'dyke',
  'cunt',
  'whore',
  'slut',
  'bitch',
  'fuck',
  'shit',
  'dick',
  'cock',
  'pussy',
  'penis',
  'vagina',
  'porno',
  'porn',
  'rape',
  'rapist',
  'nazi',
  'hitler',
  'kkk',
  'kys',
  'suicide',
  'pedophile',
  'pedo',
];

function normalizeForModeration(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/[1!]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z]/g, '');
}

export function validateHandle(raw: string): string | null {
  const collapsed = raw.trim().replace(/\s+/g, ' ');
  if (collapsed.length < HANDLE_MIN_LENGTH) {
    return `Username must be at least ${HANDLE_MIN_LENGTH} characters.`;
  }
  if (collapsed.length > HANDLE_MAX_LENGTH) {
    return `Username must be ${HANDLE_MAX_LENGTH} characters or fewer.`;
  }
  if (!HANDLE_REGEX.test(collapsed)) {
    return 'Use only letters, numbers, spaces, underscores (_), or hyphens (-).';
  }
  const compact = normalizeForModeration(collapsed);
  if (RESERVED_EXACT_HANDLES.has(compact)) {
    return 'That username is reserved (no staff/system/bot impersonation).';
  }
  for (const term of BLOCKED_HANDLE_TERMS) {
    if (compact.includes(term)) {
      return 'Keep usernames respectful — offensive or explicit terms are not allowed.';
    }
  }
  return null;
}

export function sanitizeHandle(raw: string): string {
  const cleaned = raw
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, HANDLE_MAX_LENGTH);
  if (validateHandle(cleaned) === null) return cleaned;
  return 'SnakePlayer';
}

export function isValidHandleInput(raw: string): boolean {
  return validateHandle(raw) === null;
}

export function getBestFieldForDifficulty(diff: DifficultyId): keyof Pick<
  PlayerProfile,
  'bestEasy' | 'bestMedium' | 'bestHard' | 'bestInsane' | 'bestExtreme'
> {
  switch (diff) {
    case 'easy':
      return 'bestEasy';
    case 'medium':
      return 'bestMedium';
    case 'hard':
      return 'bestHard';
    case 'insane':
      return 'bestInsane';
    case 'extreme':
      return 'bestExtreme';
  }
}

export async function ensureUserAccount(
  user: User
): Promise<{ profile: PlayerProfile; isNewAccount: boolean }> {
  const uid = user.uid;
  const email = (user.email ?? 'player@example.com').slice(0, 254);

  // 1. Private user document (PII isolated)
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);
  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid,
        email,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  // 2. Public profile document (handle + best scores)
  const profilePath = `profiles/${uid}`;
  const profileRef = doc(db, 'profiles', uid);
  try {
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        isNewAccount: false,
        profile: {
          uid,
          handle:
            typeof data.handle === 'string'
              ? data.handle
              : sanitizeHandle(user.displayName ?? ''),
          bestEasy: Number(data.bestEasy ?? 0),
          bestMedium: Number(data.bestMedium ?? 0),
          bestHard: Number(data.bestHard ?? 0),
          bestInsane: Number(data.bestInsane ?? 0),
          bestExtreme: Number(data.bestExtreme ?? 0),
        },
      };
    }

    const defaultHandle = sanitizeHandle(
      user.displayName || (user.email ? user.email.split('@')[0] : 'SnakePlayer')
    );

    await setDoc(profileRef, {
      uid,
      handle: defaultHandle,
      bestEasy: 0,
      bestMedium: 0,
      bestHard: 0,
      bestInsane: 0,
      bestExtreme: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      isNewAccount: true,
      profile: {
        uid,
        handle: defaultHandle,
        bestEasy: 0,
        bestMedium: 0,
        bestHard: 0,
        bestInsane: 0,
        bestExtreme: 0,
      },
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, profilePath);
  }
}

export async function updatePlayerHandle(uid: string, rawHandle: string): Promise<string> {
  const cleanHandle = sanitizeHandle(rawHandle);
  const profilePath = `profiles/${uid}`;
  const profileRef = doc(db, 'profiles', uid);

  try {
    await updateDoc(profileRef, {
      handle: cleanHandle,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, profilePath);
  }

  // Sync handle to any existing leaderboard entries for this user
  for (const diff of DIFFICULTY_ORDER) {
    const entryId = `${uid}_${diff}`;
    const entryPath = `leaderboard/${entryId}`;
    const entryRef = doc(db, 'leaderboard', entryId);
    try {
      const snap = await getDoc(entryRef);
      if (snap.exists()) {
        const prevData = snap.data();
        const target = DIFFICULTIES[diff].winTarget;
        const prevScore = Math.min(target, Number(prevData.score ?? 0));
        await updateDoc(entryRef, {
          handle: cleanHandle,
          winTarget: target,
          won: prevScore === target,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, entryPath);
    }
  }

  return cleanHandle;
}

export async function recordRunToCloud(
  profile: PlayerProfile,
  difficulty: DifficultyConfig,
  rawScore: number,
  rawDurationMs: number
): Promise<PlayerProfile> {
  const score = Math.max(0, Math.min(difficulty.winTarget, Math.floor(rawScore)));
  const durationMs = Math.max(0, Math.min(3600000, Math.round(rawDurationMs)));
  const won = score === difficulty.winTarget;
  const bestField = getBestFieldForDifficulty(difficulty.id);

  let updatedProfile = { ...profile };

  // 1. Update personal best in profile if improved
  if (score > profile[bestField]) {
    const profilePath = `profiles/${profile.uid}`;
    const profileRef = doc(db, 'profiles', profile.uid);
    try {
      await updateDoc(profileRef, {
        [bestField]: score,
        updatedAt: serverTimestamp(),
      });
      updatedProfile = { ...profile, [bestField]: score };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, profilePath);
    }
  }

  // 2. Record to global leaderboard if score > 0 and beats existing entry
  if (score > 0) {
    const safeHandle = sanitizeHandle(profile.handle);
    const entryId = `${profile.uid}_${difficulty.id}`;
    const entryPath = `leaderboard/${entryId}`;
    const entryRef = doc(db, 'leaderboard', entryId);
    try {
      const existingSnap = await getDoc(entryRef);
      if (!existingSnap.exists()) {
        await setDoc(entryRef, {
          uid: profile.uid,
          handle: safeHandle,
          difficulty: difficulty.id,
          score,
          winTarget: difficulty.winTarget,
          won,
          durationMs,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const existingData = existingSnap.data();
        const prevScore = Number(existingData.score ?? 0);
        const prevDuration = Number(existingData.durationMs ?? 3600000);
        const isBetter =
          score > prevScore || (score === prevScore && durationMs < prevDuration);
        if (isBetter) {
          await updateDoc(entryRef, {
            handle: safeHandle,
            score,
            winTarget: difficulty.winTarget,
            won,
            durationMs,
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, entryPath);
    }
  }

  return updatedProfile;
}

export function subscribeLeaderboard(
  difficultyId: DifficultyId,
  onEntries: (entries: LeaderboardEntry[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'leaderboard'),
    where('difficulty', '==', difficultyId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: LeaderboardEntry[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          uid: String(data.uid ?? ''),
          handle: String(data.handle ?? 'Player'),
          difficulty: (data.difficulty as DifficultyId) ?? difficultyId,
          score: Number(data.score ?? 0),
          winTarget: Number(data.winTarget ?? DIFFICULTIES[difficultyId].winTarget),
          won: Boolean(data.won),
          durationMs: Number(data.durationMs ?? 0),
        };
      });

      items.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.durationMs - b.durationMs;
      });

      onEntries(items.slice(0, 15));
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'leaderboard');
      }
    }
  );
}
