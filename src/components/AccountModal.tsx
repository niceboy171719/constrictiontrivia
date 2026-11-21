import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { X, Trophy, User as UserIcon, LogOut, Check } from 'lucide-react';
import { DIFFICULTIES, DIFFICULTY_ORDER } from '../constants/difficulties';
import {
  HANDLE_MAX_LENGTH,
  HANDLE_MIN_LENGTH,
  getBestFieldForDifficulty,
  subscribeLeaderboard,
  validateHandle,
  type LeaderboardEntry,
  type PlayerProfile,
} from '../services/accountService';
import type { DifficultyId, GameTheme } from '../types/game';

interface AccountModalProps {
  isOpen: boolean;
  initialTab: 'leaderboard' | 'account';
  initialDifficulty: DifficultyId;
  onClose: () => void;
  theme: GameTheme;
  user: User | null;
  profile: PlayerProfile | null;
  needsUsernameSetup: boolean;
  onCompleteUsernameSetup: () => void;
  authLoading: boolean;
  authError: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onUpdateHandle: (newHandle: string) => Promise<void>;
  localBests: Record<DifficultyId, number>;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  initialTab,
  initialDifficulty,
  onClose,
  theme,
  user,
  profile,
  needsUsernameSetup,
  onCompleteUsernameSetup,
  authLoading,
  authError,
  onSignIn,
  onSignOut,
  onUpdateHandle,
  localBests,
}) => {
  const [tab, setTab] = useState<'leaderboard' | 'account'>(initialTab);
  const [boardDiff, setBoardDiff] = useState<DifficultyId>(initialDifficulty);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [boardLoading, setBoardLoading] = useState<boolean>(true);
  const [boardError, setBoardError] = useState<string | null>(null);

  const [handleDraft, setHandleDraft] = useState<string>(profile?.handle ?? '');
  const [handleSaving, setHandleSaving] = useState<boolean>(false);
  const [handleStatus, setHandleStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setBoardDiff(initialDifficulty);
      setHandleStatus(null);
    }
  }, [isOpen, initialTab, initialDifficulty]);

  useEffect(() => {
    if (profile?.handle) {
      setHandleDraft(profile.handle);
    }
  }, [profile?.handle]);

  useEffect(() => {
    if (!isOpen || tab !== 'leaderboard') return;
    setBoardLoading(true);
    setBoardError(null);

    const unsub = subscribeLeaderboard(
      boardDiff,
      (items) => {
        setEntries(items);
        setBoardLoading(false);
      },
      (err) => {
        setBoardError(err instanceof Error ? err.message : 'Unable to load leaderboard.');
        setBoardLoading(false);
      }
    );

    return () => unsub();
  }, [isOpen, tab, boardDiff]);

  if (!isOpen) return null;

  const handleSaveHandle = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateHandle(handleDraft);
    if (validationError) {
      setHandleStatus(validationError);
      return;
    }
    setHandleSaving(true);
    setHandleStatus(null);
    try {
      await onUpdateHandle(handleDraft);
      if (needsUsernameSetup) {
        onCompleteUsernameSetup();
      }
      setHandleStatus('Username saved.');
    } catch (err) {
      setHandleStatus(err instanceof Error ? err.message : 'Could not update username.');
    } finally {
      setHandleSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{ backgroundColor: 'rgba(6, 6, 10, 0.84)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Account and Leaderboard"
    >
      <div
        className="w-full max-w-[500px] max-h-[88vh] flex flex-col crt-scanlines overflow-hidden"
        style={{
          backgroundColor: theme.panelBg,
          border: `2px solid ${theme.accent}`,
          color: theme.text,
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: theme.panelBorder }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('leaderboard')}
              className="min-h-[38px] px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
              style={{
                backgroundColor: tab === 'leaderboard' ? theme.buttonBg : theme.arenaBg,
                color: tab === 'leaderboard' ? theme.buttonText : theme.muted,
                border: `1px solid ${theme.panelBorder}`,
              }}
            >
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setTab('account')}
              className="min-h-[38px] px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
              style={{
                backgroundColor: tab === 'account' ? theme.buttonBg : theme.arenaBg,
                color: tab === 'account' ? theme.buttonText : theme.muted,
                border: `1px solid ${theme.panelBorder}`,
              }}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Account
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center border hover:opacity-80"
            style={{ borderColor: theme.panelBorder, backgroundColor: theme.arenaBg }}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {tab === 'leaderboard' && (
            <>
              {/* Difficulty Tabs */}
              <div className="grid grid-cols-5 gap-1">
                {DIFFICULTY_ORDER.map((id) => {
                  const active = id === boardDiff;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBoardDiff(id)}
                      className="min-h-[36px] px-1.5 py-1 text-[11px] font-bold whitespace-nowrap truncate transition-colors"
                      style={{
                        backgroundColor: active ? 'rgba(255,255,255,0.12)' : theme.arenaBg,
                        color: active ? theme.text : theme.muted,
                        border: active ? `1px solid ${theme.text}` : `1px solid ${theme.panelBorder}`,
                      }}
                    >
                      {DIFFICULTIES[id].label}
                    </button>
                  );
                })}
              </div>

              {/* Leaderboard Table */}
              {boardLoading ? (
                <div className="py-10 text-center text-xs" style={{ color: theme.muted }}>
                  Loading {DIFFICULTIES[boardDiff].label} rankings...
                </div>
              ) : boardError ? (
                <div className="py-6 text-center text-xs text-red-400 break-words">
                  {boardError}
                </div>
              ) : entries.length === 0 ? (
                <div
                  className="py-10 px-4 text-center border text-xs flex flex-col gap-2"
                  style={{ borderColor: theme.panelBorder, backgroundColor: theme.arenaBg }}
                >
                  <p>No runs recorded on {DIFFICULTIES[boardDiff].label} yet.</p>
                  <p style={{ color: theme.muted }}>
                    {user
                      ? 'Finish a run to claim the #1 spot.'
                      : 'Sign in and finish a run to claim the #1 spot.'}
                  </p>
                </div>
              ) : (
                <div
                  className="border overflow-hidden"
                  style={{ borderColor: theme.panelBorder, backgroundColor: theme.arenaBg }}
                >
                  <div
                    className="grid grid-cols-[36px_1fr_64px_66px_54px] px-3 py-2 text-[11px] border-b"
                    style={{ borderColor: theme.panelBorder, color: theme.muted }}
                  >
                    <span>#</span>
                    <span>Player</span>
                    <span className="text-right">Score</span>
                    <span className="text-right">Time</span>
                    <span className="text-right">Run</span>
                  </div>
                  <div className="divide-y" style={{ borderColor: theme.panelBorder }}>
                    {entries.map((entry, idx) => {
                      const isSelf = user?.uid === entry.uid;
                      return (
                        <div
                          key={entry.id}
                          className="grid grid-cols-[36px_1fr_64px_66px_54px] items-center px-3 py-2 text-xs tabular-nums"
                          style={{
                            backgroundColor: isSelf ? theme.accentSoft : 'transparent',
                            borderColor: theme.panelBorder,
                          }}
                        >
                          <span style={{ color: idx === 0 ? theme.accent : theme.muted }}>
                            {idx + 1}
                          </span>
                          <span className="truncate pr-2 font-bold">
                            {entry.handle}
                            {isSelf ? ' (You)' : ''}
                          </span>
                          <span className="text-right">
                            {entry.score}/{entry.winTarget}
                          </span>
                          <span className="text-right" style={{ color: theme.muted }}>
                            {(entry.durationMs / 1000).toFixed(1)}s
                          </span>
                          <span
                            className="text-right text-[11px]"
                            style={{ color: entry.won ? '#4ADE80' : theme.muted }}
                          >
                            {entry.won ? 'WIN' : 'END'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!user && (
                <div
                  className="flex items-center justify-between gap-3 p-3 border text-xs"
                  style={{ borderColor: theme.panelBorder, backgroundColor: theme.arenaBg }}
                >
                  <span style={{ color: theme.muted }}>Sign in to post your scores globally.</span>
                  <button
                    type="button"
                    onClick={() => setTab('account')}
                    className="min-h-[36px] px-3 py-1.5 text-xs font-bold shrink-0 whitespace-nowrap"
                    style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                  >
                    Sign in
                  </button>
                </div>
              )}
            </>
          )}

          {tab === 'account' && (
            <>
              {!user ? (
                <div
                  className="p-4 border flex flex-col gap-3"
                  style={{ borderColor: theme.panelBorder, backgroundColor: theme.arenaBg }}
                >
                  <h3 className="text-sm font-bold">Player Account</h3>
                  <p className="text-xs leading-relaxed" style={{ color: theme.muted }}>
                    Sign up or sign in with Google to save your personal bests across devices, customize your arcade handle, and compete on the global Constriction leaderboard.
                  </p>

                  {authError && (
                    <p className="text-xs text-red-400 break-words">{authError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => void onSignIn()}
                    disabled={authLoading}
                    className="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold pixel-shadow disabled:opacity-60"
                    style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                  >
                    {authLoading ? 'Connecting...' : 'Continue with Google'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div
                    className="p-3.5 border flex items-center justify-between gap-3"
                    style={{ borderColor: theme.panelBorder, backgroundColor: theme.arenaBg }}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">
                        {profile?.handle ?? 'Loading...'}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: theme.muted }}>
                        {user.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void onSignOut()}
                      className="min-h-[36px] px-3 py-1.5 text-xs border flex items-center gap-1.5 shrink-0"
                      style={{ borderColor: theme.panelBorder, color: theme.text }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>

                  {/* Arcade Username Setup / Editor */}
                  <form
                    onSubmit={(e) => void handleSaveHandle(e)}
                    className="p-3.5 border flex flex-col gap-2"
                    style={{
                      borderColor: needsUsernameSetup ? theme.accent : theme.panelBorder,
                      backgroundColor: theme.arenaBg,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="handle-input" className="text-xs font-bold">
                        {needsUsernameSetup ? 'Choose your username' : 'Leaderboard Username'}
                      </label>
                      <span className="text-[11px] tabular-nums" style={{ color: theme.muted }}>
                        {handleDraft.trim().length}/{HANDLE_MAX_LENGTH}
                      </span>
                    </div>
                    {needsUsernameSetup && (
                      <p className="text-[11px]" style={{ color: theme.muted }}>
                        Pick the name shown on the global leaderboard (up to {HANDLE_MAX_LENGTH} characters).
                      </p>
                    )}
                    <div className="flex items-stretch gap-2">
                      <input
                        id="handle-input"
                        type="text"
                        autoFocus={needsUsernameSetup}
                        maxLength={HANDLE_MAX_LENGTH}
                        value={handleDraft}
                        onChange={(e) => setHandleDraft(e.target.value)}
                        className="font-mono-input flex-1 min-h-[40px] px-3 text-xs border outline-none"
                        style={{
                          backgroundColor: theme.panelBg,
                          borderColor: needsUsernameSetup ? theme.accent : theme.panelBorder,
                          color: theme.text,
                        }}
                        placeholder={`${HANDLE_MIN_LENGTH}-${HANDLE_MAX_LENGTH} characters`}
                      />
                      <button
                        type="submit"
                        disabled={handleSaving}
                        className="min-h-[40px] px-3 text-xs font-bold flex items-center gap-1 shrink-0"
                        style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {needsUsernameSetup ? 'Save username' : 'Save'}
                      </button>
                    </div>
                    {handleStatus && (
                      <p
                        className="text-[11px]"
                        style={{
                          color: handleStatus === 'Username saved.' ? '#4ADE80' : '#F87171',
                        }}
                      >
                        {handleStatus}
                      </p>
                    )}

                    <div
                      className="pt-2 mt-1 border-t flex flex-col gap-1 text-[11px] leading-relaxed"
                      style={{ borderColor: theme.panelBorder, color: theme.muted }}
                    >
                      <span className="font-bold" style={{ color: theme.text }}>
                        Username Guidelines
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>
                          {HANDLE_MIN_LENGTH}–{HANDLE_MAX_LENGTH} characters: letters, numbers, spaces,{' '}
                          <span className="font-mono-input">_</span> or{' '}
                          <span className="font-mono-input">-</span> only.
                        </li>
                        <li>No profanity, slurs, hate speech, or sexually explicit names.</li>
                        <li>No impersonating staff, moderators, admins, or bots.</li>
                        <li>Shown publicly on the global leaderboard.</li>
                      </ul>
                    </div>
                  </form>

                  {/* Personal Bests */}
                  <div
                    className="p-3.5 border flex flex-col gap-2"
                    style={{ borderColor: theme.panelBorder, backgroundColor: theme.arenaBg }}
                  >
                    <h4 className="text-xs font-bold">Personal Bests</h4>
                    <div className="flex flex-col gap-1.5 text-xs tabular-nums">
                      {DIFFICULTY_ORDER.map((diff) => {
                        const cfg = DIFFICULTIES[diff];
                        const cloudVal = profile ? profile[getBestFieldForDifficulty(diff)] : 0;
                        const bestVal = Math.max(cloudVal, localBests[diff] ?? 0);
                        return (
                          <div key={diff} className="flex justify-between">
                            <span style={{ color: theme.muted }}>{cfg.label}</span>
                            <span>
                              {bestVal}/{cfg.winTarget}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
