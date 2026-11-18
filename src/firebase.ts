import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  UserProfileData,
  SrsCardData,
  PracticeAttemptData,
  PeerSubmissionData,
} from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory startup connection check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  return firebaseSignOut(auth);
}

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : 'item_1';
}

export async function persistUserProfile(profile: UserProfileData): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== profile.uid) return;
  const path = `users/${profile.uid}`;
  try {
    const payload: Record<string, unknown> = {
      uid: sanitizeId(profile.uid),
      displayName: (profile.displayName || 'Scholar').slice(0, 80),
      currentBandLevel: profile.currentBandLevel,
      targetBand: Math.min(9.0, Math.max(3.0, Number(profile.targetBand) || 7.0)),
      diagnosticCompleted: Boolean(profile.diagnosticCompleted),
      listeningScore: Math.min(9.0, Math.max(0, Number(profile.listeningScore) || 5.5)),
      readingScore: Math.min(9.0, Math.max(0, Number(profile.readingScore) || 5.5)),
      writingScore: Math.min(9.0, Math.max(0, Number(profile.writingScore) || 5.0)),
      speakingScore: Math.min(9.0, Math.max(0, Number(profile.speakingScore) || 5.0)),
      completedMilestones: (profile.completedMilestones || []).slice(0, 100).map((s) => String(s).slice(0, 120)),
      completedLessons: (profile.completedLessons || []).slice(0, 200).map((s) => String(s).slice(0, 120)),
      earnedBadges: (profile.earnedBadges || []).slice(0, 50).map((s) => String(s).slice(0, 120)),
      studyStreak: Math.min(10000, Math.max(0, Math.floor(Number(profile.studyStreak) || 1))),
      lastStudyDate: String(profile.lastStudyDate || new Date().toISOString().slice(0, 10)).slice(0, 20),
      reminderEnabled: Boolean(profile.reminderEnabled),
      reminderTime: String(profile.reminderTime || '19:00').slice(0, 10),
      reminderDays: (profile.reminderDays || [1, 2, 3, 4, 5]).slice(0, 7).map((d) => Math.min(6, Math.max(0, Number(d)))),
      browserPushEnabled: Boolean(profile.browserPushEnabled),
      updatedAt: serverTimestamp(),
    };

    if (profile.diagnosticMode) {
      payload.diagnosticMode = profile.diagnosticMode;
    }
    if (typeof profile.diagnosticStep === 'number') {
      payload.diagnosticStep = Math.min(20, Math.max(0, profile.diagnosticStep));
    }
    if (profile.diagnosticSavedState) {
      payload.diagnosticSavedState = profile.diagnosticSavedState.slice(0, 4000);
    }
    if (profile.offlinePackSyncedAt) {
      payload.offlinePackSyncedAt = profile.offlinePackSyncedAt.slice(0, 40);
    }

    await setDoc(doc(db, 'users', profile.uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistSrsCard(card: SrsCardData): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== card.uid) return;
  const safeId = sanitizeId(card.id);
  const path = `users/${card.uid}/srsCards/${safeId}`;
  try {
    await setDoc(doc(db, 'users', card.uid, 'srsCards', safeId), {
      id: safeId,
      uid: sanitizeId(card.uid),
      word: (card.word || 'term').slice(0, 120),
      phonetic: (card.phonetic || '/tɜːm/').slice(0, 120),
      partOfSpeech: (card.partOfSpeech || 'noun').slice(0, 40),
      definition: (card.definition || 'Academic vocabulary item.').slice(0, 600),
      exampleSentence: (card.exampleSentence || '').slice(0, 600),
      topic: (card.topic || 'Education').slice(0, 60),
      cefrLevel: card.cefrLevel || 'B2',
      source: card.source || 'vocab-hub',
      masteryLevel: card.masteryLevel || 'New',
      intervalDays: Math.min(3650, Math.max(0, Number(card.intervalDays) || 0)),
      easeFactor: Math.min(5.0, Math.max(1.3, Number(card.easeFactor) || 2.5)),
      repetitions: Math.min(1000, Math.max(0, Number(card.repetitions) || 0)),
      nextReviewAt: (card.nextReviewAt || new Date().toISOString()).slice(0, 40),
      lastReviewedAt: (card.lastReviewedAt || new Date().toISOString()).slice(0, 40),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeSrsCard(uid: string, cardId: string): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const safeId = sanitizeId(cardId);
  const path = `users/${uid}/srsCards/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'srsCards', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function persistPracticeAttempt(attempt: PracticeAttemptData): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== attempt.uid) return;
  const safeId = sanitizeId(attempt.id);
  const path = `users/${attempt.uid}/attempts/${safeId}`;
  try {
    await setDoc(doc(db, 'users', attempt.uid, 'attempts', safeId), {
      id: safeId,
      uid: sanitizeId(attempt.uid),
      skill: attempt.skill,
      testTitle: (attempt.testTitle || 'IELTS Practice').slice(0, 200),
      bandScore: Math.min(9.0, Math.max(0, Number(attempt.bandScore) || 6.0)),
      userResponse: (attempt.userResponse || '').slice(0, 8000),
      aiFeedbackSummary: (attempt.aiFeedbackSummary || '').slice(0, 8000),
      durationSeconds: Math.min(86400, Math.max(0, Math.floor(Number(attempt.durationSeconds) || 60))),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function publishPeerSubmission(submission: PeerSubmissionData): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== submission.authorUid) return;
  const safeId = sanitizeId(submission.id);
  const path = `peerSubmissions/${safeId}`;
  try {
    await setDoc(doc(db, 'peerSubmissions', safeId), {
      id: safeId,
      authorUid: sanitizeId(submission.authorUid),
      anonymousHandle: (submission.anonymousHandle || 'Scholar #104').slice(0, 60),
      authorBand: submission.authorBand,
      skill: submission.skill,
      promptTitle: (submission.promptTitle || 'IELTS Task').slice(0, 240),
      content: (submission.content || '').slice(0, 6000),
      wordCount: Math.min(2000, Math.max(1, Number(submission.wordCount) || 50)),
      visibility: 'public',
      reviewCount: Math.min(1000, Math.max(0, Number(submission.reviewCount) || 0)),
      averageBand: Math.min(9.0, Math.max(0, Number(submission.averageBand) || 0)),
      latestReviewComment: (submission.latestReviewComment || 'Awaiting community peer review.').slice(0, 1500),
      latestReviewerHandle: (submission.latestReviewerHandle || 'None').slice(0, 60),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function submitCommunityPeerReview(
  existing: PeerSubmissionData,
  bandGiven: number,
  comment: string,
  reviewerHandle: string
): Promise<void> {
  if (!auth.currentUser) return;
  const safeId = sanitizeId(existing.id);
  const path = `peerSubmissions/${safeId}`;
  const newCount = existing.reviewCount + 1;
  const newAvg =
    existing.reviewCount === 0
      ? bandGiven
      : Number(((existing.averageBand * existing.reviewCount + bandGiven) / newCount).toFixed(1));

  try {
    await setDoc(doc(db, 'peerSubmissions', safeId), {
      id: safeId,
      authorUid: existing.authorUid,
      anonymousHandle: existing.anonymousHandle,
      authorBand: existing.authorBand,
      skill: existing.skill,
      promptTitle: existing.promptTitle,
      content: existing.content,
      wordCount: existing.wordCount,
      visibility: 'public',
      reviewCount: newCount,
      averageBand: Math.min(9.0, Math.max(0, newAvg)),
      latestReviewComment: comment.slice(0, 1500),
      latestReviewerHandle: reviewerHandle.slice(0, 60),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
