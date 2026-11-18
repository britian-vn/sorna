# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Identity & Ownership (`/users/{userId}`)**:
   - A `UserProfile` document's `uid` field must strictly match both the path `{userId}` and `request.auth.uid`.
   - Zero PII (`email`, `phone`, `address`) is stored in `/users/{userId}`. Only the owner (`request.auth.uid == userId`) may read, create, or update their profile.
2. **Relational Subcollection Sync (`/users/{userId}/srsCards/{cardId}` & `/users/{userId}/attempts/{attemptId}`)**:
   - Every `SrsCard` and `PracticeAttempt` must belong to an existing `/users/{userId}` document (`exists(/databases/$(database)/documents/users/$(userId))`) on single-document operations (`get`, `create`, `update`, `delete`), and `uid` must equal `request.auth.uid` and `userId`.
   - `allow list` enforces `request.auth.uid == userId && resource.data.uid == request.auth.uid` without `get()`/`exists()` inside `list`.
3. **Strict Keys & Action-Based Updates**:
   - Every `create` validates `hasAll` and `hasOnly` allowed keys via standalone `isValid[Entity]` helpers.
   - Every `update` wraps logic in `isValid[Entity](incoming())` and uses `incoming().diff(existing()).affectedKeys().hasOnly(...)` action gates while preserving immutable identity fields (`uid`, `id`, `authorUid`) and enforcing server timestamps (`request.time`).
4. **Community Peer Submissions (`/peerSubmissions/{submissionId}`)**:
   - Creation requires verified user (`request.auth.token.email_verified == true`), `authorUid == request.auth.uid`, and `visibility == 'public'`.
   - Peer review updates (`reviewCount`, `averageBand`, `latestReviewComment`, `latestReviewerHandle`, `updatedAt`) are restricted via `affectedKeys().hasOnly(...)` and require immutable `authorUid`, `id`, `promptTitle`, and `content`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Identity Spoofing on UserProfile)**: Authenticated as `user_A`, creating `/users/user_B` or setting `uid: "user_B"` -> `PERMISSION_DENIED`.
2. **Payload 2 (Unverified Email Write)**: Authenticated user with `email_verified: false` attempting to create `/users/user_A` -> `PERMISSION_DENIED`.
3. **Payload 3 (Shadow Field Injection)**: Sending `isAdmin: true` or `ghostField: "hack"` on `/users/user_A` create or update -> `PERMISSION_DENIED`.
4. **Payload 4 (Cross-User Profile Read)**: `user_B` attempting `get` or `list` on `/users/user_A` -> `PERMISSION_DENIED`.
5. **Payload 5 (Orphaned Subcollection Write)**: `user_A` creating `/users/user_A/srsCards/card_1` before `/users/user_A` exists -> `PERMISSION_DENIED`.
6. **Payload 6 (Path ID Poisoning)**: Creating an `SrsCard` with invalid characters `card$@#` or length > 128 -> `PERMISSION_DENIED`.
7. **Payload 7 (Denial-of-Wallet Oversized String)**: Writing a 50,000-character `definition` in `SrsCard` (max 600) -> `PERMISSION_DENIED`.
8. **Payload 8 (Array Overflow Attack)**: Writing 500 items into `completedMilestones` (max 100) -> `PERMISSION_DENIED`.
9. **Payload 9 (Client Timestamp Forgery)**: Creating `UserProfile` or `PracticeAttempt` with a forged past/future timestamp instead of `request.time` -> `PERMISSION_DENIED`.
10. **Payload 10 (Immutable Field Tampering)**: Updating `uid` on an existing `SrsCard` or `authorUid` on a `PeerSubmission` -> `PERMISSION_DENIED`.
11. **Payload 11 (Unauthorized Peer Content Mutation)**: Reviewer `user_B` attempting to modify `content` or `promptTitle` of `user_A`'s `PeerSubmission` during a peer review update -> `PERMISSION_DENIED`.
12. **Payload 12 (Unfiltered List Scrape)**: Querying `/users/user_A/srsCards` as `user_B` -> `PERMISSION_DENIED`.
