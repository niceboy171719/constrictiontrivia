# Constriction Firestore Security Specification

## Data Invariants
1. Private account PII (`email`) lives strictly under `/users/{userId}` and can only be read or created by the authenticated, email-verified owner (`request.auth.uid == userId`). List queries on `/users` are denied.
2. Player handles and per-difficulty best scores live under `/profiles/{userId}`. Only the owner can create or update their profile; `uid` and `createdAt` are immutable.
3. Leaderboard entries live under `/leaderboard/{entryId}` where `entryId == request.auth.uid + '_' + difficulty`. A user can only create or update their own entry for a valid difficulty (`easy`, `medium`, `hard`, `insane`, `extreme`), with bounded integer scores (`0 <= score <= winTarget`) matching difficulty rules.
4. All timestamps (`createdAt`, `updatedAt`) must equal `request.time`.
5. No shadow/ghost fields are allowed (`keys().hasOnly(...)` and `affectedKeys().hasOnly(...)`).

## Dirty Dozen Adversarial Payloads
1. `{ uid: "other-uid", email: "victim@example.com", createdAt: request.time }` written to `/users/{attackerUid}` -> DENIED (uid mismatch).
2. Read `/users/{victimUid}` by attacker -> DENIED (`!isOwner`).
3. List `/users` by attacker -> DENIED (`allow list: if false`).
4. Create `/profiles/{attackerUid}` with shadow field `isAdmin: true` -> DENIED (`keys().hasOnly`).
5. Create `/profiles/{attackerUid}` with 500-char handle -> DENIED (`handle.size() <= 16`).
6. Update `/profiles/{attackerUid}` changing `uid` or `createdAt` -> DENIED (immutable fields + `affectedKeys().hasOnly`).
7. Create `/profiles/{attackerUid}` with `bestExtreme: 999` -> DENIED (exceeds max target 30).
8. Create `/leaderboard/{attackerUid}_hard` with fake `createdAt` in 1999 -> DENIED (`createdAt == request.time`).
9. Create `/leaderboard/{victimUid}_hard` by attacker -> DENIED (`entryId == request.auth.uid + '_' + difficulty`).
10. Update `/leaderboard/{attackerUid}_hard` lowering score (`score: 2` when existing is `10`) or changing `difficulty` -> DENIED (`difficulty` immutable, score cannot regress unless updating handle only).
11. Unverified email user writing to `/leaderboard/{uid}_easy` -> DENIED (`email_verified == true`).
12. Create `/leaderboard/{attackerUid}_extreme` with `won: true, score: 5` -> DENIED (`won == (score == winTarget)`).
