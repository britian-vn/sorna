/**
 * Phase 0 TDD Security Rules Test Suite for ScholarBand
 * Verifies that all 12 "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on UserProfile',
    collectionPath: '/users/user_B',
    operation: 'create',
    auth: { uid: 'user_A', email_verified: true },
    payload: { uid: 'user_B', displayName: 'Spoofer' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    collectionPath: '/users/user_A',
    operation: 'create',
    auth: { uid: 'user_A', email_verified: false },
    payload: { uid: 'user_A', displayName: 'Unverified' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on UserProfile',
    collectionPath: '/users/user_A',
    operation: 'update',
    auth: { uid: 'user_A', email_verified: true },
    payload: { uid: 'user_A', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-User Profile Read',
    collectionPath: '/users/user_A',
    operation: 'get',
    auth: { uid: 'user_B', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Orphaned Subcollection Write on SrsCard',
    collectionPath: '/users/user_orphan/srsCards/card_1',
    operation: 'create',
    auth: { uid: 'user_orphan', email_verified: true },
    payload: { id: 'card_1', uid: 'user_orphan', word: 'ubiquitous' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Path ID Poisoning',
    collectionPath: '/users/user_A/srsCards/invalid$id!',
    operation: 'create',
    auth: { uid: 'user_A', email_verified: true },
    payload: { id: 'invalid$id!', uid: 'user_A' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Denial-of-Wallet Oversized String',
    collectionPath: '/users/user_A/srsCards/card_1',
    operation: 'create',
    auth: { uid: 'user_A', email_verified: true },
    payload: { id: 'card_1', uid: 'user_A', definition: 'x'.repeat(2000) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Array Overflow Attack on completedMilestones',
    collectionPath: '/users/user_A',
    operation: 'update',
    auth: { uid: 'user_A', email_verified: true },
    payload: { completedMilestones: Array.from({ length: 150 }, (_, i) => `m_${i}`) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client Timestamp Forgery',
    collectionPath: '/users/user_A/attempts/att_1',
    operation: 'create',
    auth: { uid: 'user_A', email_verified: true },
    payload: { id: 'att_1', uid: 'user_A', createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable Field Tampering on SrsCard',
    collectionPath: '/users/user_A/srsCards/card_1',
    operation: 'update',
    auth: { uid: 'user_A', email_verified: true },
    payload: { uid: 'user_B' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unauthorized Peer Content Mutation',
    collectionPath: '/peerSubmissions/sub_1',
    operation: 'update',
    auth: { uid: 'user_B', email_verified: true },
    payload: { content: 'Tampered essay text' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unfiltered Cross-User Subcollection List',
    collectionPath: '/users/user_A/srsCards',
    operation: 'list',
    auth: { uid: 'user_B', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
