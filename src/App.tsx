/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  doc,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Layers,
  GraduationCap,
  Newspaper,
  Video,
  Bell,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Menu,
  X,
  Flame,
  Sparkles,
  Languages,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  UserCheck,
} from 'lucide-react';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  persistUserProfile,
  persistSrsCard,
  removeSrsCard,
  persistPracticeAttempt,
  publishPeerSubmission,
  submitCommunityPeerReview,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  BandLevelId,
  CefrLevel,
  LanguageMode,
  PeerSubmissionData,
  PracticeAttemptData,
  SkillType,
  SrsCardData,
  SrsRecallRating,
  UserProfileData,
  VocabWordItem,
} from './types';
import {
  getInitialSrsDeck,
  calculateSm2,
  INITIAL_PEER_SUBMISSIONS,
} from './data/curriculum';
import {
  ErrorBoundary,
  PWAInstallButton,
  OfflineIndicator,
} from './components/ErrorBoundary';
import { PlacementModal } from './components/PlacementModal';
import { DashboardAndPathways } from './components/DashboardAndPathways';
import { VocabAndSrsModules } from './components/VocabAndSrsModules';
import { SkillsLabAndPeerModule } from './components/SkillsLabAndPeerModule';
import { NewsShadowingReminders } from './components/NewsShadowingReminders';

const LOCAL_PROFILE_KEY = 'scholarband_offline_profile_v1';
const LOCAL_SRS_KEY = 'scholarband_offline_srs_v1';
const LOCAL_LANG_KEY = 'scholarband_lang_mode_v1';

function createDefaultProfile(uid: string, displayName = 'Academic Scholar'): UserProfileData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    uid,
    displayName,
    currentBandLevel: '5.0-6.0',
    targetBand: 7.5,
    diagnosticCompleted: false,
    listeningScore: 6.0,
    readingScore: 6.5,
    writingScore: 5.5,
    speakingScore: 5.5,
    completedMilestones: ['m_f1', 'm_e2'],
    completedLessons: ['vg_a1_edu'],
    earnedBadges: ['badge_srs_master'],
    studyStreak: 4,
    lastStudyDate: today,
    reminderEnabled: true,
    reminderTime: '19:00',
    reminderDays: [1, 2, 3, 4, 5],
    browserPushEnabled: false,
  };
}

function ScholarBandWorkspace() {
  // Theme State (Light warm paper vs Dark midnight library)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('scholarband_theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('scholarband_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Bilingual Language Mode ('bilingual' | 'vi' | 'en')
  const [langMode, setLangMode] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_LANG_KEY) as LanguageMode | null;
      if (saved === 'bilingual' || saved === 'vi' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'bilingual';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_LANG_KEY, langMode);
    } catch {
      // ignore
    }
  }, [langMode]);

  // Navigation & UI State
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Auth & Local Account Fallback State (Fixes login on GitHub Pages / iframe popup blockers)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [localScholarAccount, setLocalScholarAccount] = useState<{
    name: string;
    email: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('scholarband_local_account_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [loginNameInput, setLoginNameInput] = useState('');
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginErrorMsg, setLoginErrorMsg] = useState<string | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  const [profile, setProfile] = useState<UserProfileData>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return createDefaultProfile('guest_scholar', 'Visiting Scholar');
  });

  const [srsCards, setSrsCards] = useState<SrsCardData[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_SRS_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return getInitialSrsDeck('guest_scholar');
  });

  const [attempts, setAttempts] = useState<PracticeAttemptData[]>([]);
  const [peerSubmissions, setPeerSubmissions] = useState<PeerSubmissionData[]>(
    INITIAL_PEER_SUBMISSIONS
  );

  // In-app Notifications Log
  const [notifications, setNotifications] = useState<
    { id: string; title: string; body: string; time: string }[]
  >([
    {
      id: 'notif_init',
      title: 'Nhắc Ôn Tập Thẻ Từ Vựng SRS Song Ngữ',
      body: 'Bạn có thẻ từ vựng cần ôn tập hôm nay để duy trì chuỗi 4 ngày học liên tiếp.',
      time: 'Hôm nay',
    },
  ]);
  const [toastAlert, setToastAlert] = useState<{ title: string; body: string } | null>(null);
  const lastFiredReminderMinute = useRef<string>('');

  const addNotificationToast = (title: string, body: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNotifications((prev) => [{ id: `n_${Date.now()}`, title, body, time }, ...prev.slice(0, 9)]);
    setToastAlert({ title, body });
    setTimeout(() => {
      setToastAlert((cur) => (cur?.title === title ? null : cur));
    }, 4500);
  };

  // Persist local cache whenever profile or srsCards change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_SRS_KEY, JSON.stringify(srsCards));
    } catch {
      // ignore
    }
  }, [srsCards]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  // Firestore Real-Time Listeners when authenticated
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    const uid = currentUser.uid;
    const userPath = `users/${uid}`;
    const srsPath = `users/${uid}/srsCards`;
    const attemptsPath = `users/${uid}/attempts`;
    const peerPath = 'peerSubmissions';

    // 1. UserProfile Document Listener
    const unsubProfile = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfileData;
          setProfile(data);
        } else {
          const initial = createDefaultProfile(
            uid,
            currentUser.displayName || 'Academic Scholar'
          );
          setProfile(initial);
          persistUserProfile(initial).then(() => {
            const starterDeck = getInitialSrsDeck(uid);
            starterDeck.forEach((card) => {
              persistSrsCard(card);
            });
          });
          setShowPlacementModal(true);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userPath);
      }
    );

    // 2. SRS Flashcards Subcollection Listener
    const unsubSrs = onSnapshot(
      collection(db, 'users', uid, 'srsCards'),
      (snap) => {
        if (!snap.empty) {
          const loaded: SrsCardData[] = [];
          snap.forEach((d) => loaded.push(d.data() as SrsCardData));
          setSrsCards(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, srsPath);
      }
    );

    // 3. Practice Attempts Subcollection Listener
    const unsubAttempts = onSnapshot(
      collection(db, 'users', uid, 'attempts'),
      (snap) => {
        const loaded: PracticeAttemptData[] = [];
        snap.forEach((d) => loaded.push(d.data() as PracticeAttemptData));
        setAttempts(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, attemptsPath);
      }
    );

    // 4. Public Peer Submissions Listener
    const peerQuery = query(
      collection(db, 'peerSubmissions'),
      where('visibility', '==', 'public')
    );
    const unsubPeer = onSnapshot(
      peerQuery,
      (snap) => {
        const cloudPeers: PeerSubmissionData[] = [];
        snap.forEach((d) => cloudPeers.push(d.data() as PeerSubmissionData));
        if (cloudPeers.length > 0) {
          const combined = [
            ...cloudPeers,
            ...INITIAL_PEER_SUBMISSIONS.filter(
              (seed) => !cloudPeers.some((cp) => cp.id === seed.id)
            ),
          ];
          setPeerSubmissions(combined);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, peerPath);
      }
    );

    return () => {
      unsubProfile();
      unsubSrs();
      unsubAttempts();
      unsubPeer();
    };
  }, [isAuthReady, currentUser]);

  // Smart Study Reminder Background Scheduler (checks every 30s)
  useEffect(() => {
    if (!profile.reminderEnabled) return;
    const interval = setInterval(() => {
      const now = new Date();
      const dayIdx = now.getDay();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      if (
        profile.reminderDays.includes(dayIdx) &&
        profile.reminderTime === hhmm &&
        lastFiredReminderMinute.current !== hhmm
      ) {
        lastFiredReminderMinute.current = hhmm;
        const dueCount = srsCards.filter(
          (c) => c.nextReviewAt <= now.toISOString()
        ).length;
        const title = `ScholarBand · Giờ Học Hàng Ngày (${hhmm})`;
        const body = `Duy trì chuỗi ${profile.studyStreak} ngày học liên tiếp! Bạn có ${dueCount} thẻ SRS cần ôn tập.`;
        if (
          profile.browserPushEnabled &&
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          new Notification(title, { body });
        }
        addNotificationToast(title, body);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [profile, srsCards]);

  // State Mutation Handlers
  const updateProfileState = (updates: Partial<UserProfileData>) => {
    const merged: UserProfileData = { ...profile, ...updates };

    const badges = new Set(merged.earnedBadges);
    if (merged.diagnosticCompleted) badges.add('badge_diagnostic');
    if (merged.completedMilestones.length >= 3) badges.add('badge_pathway_pioneer');
    if (srsCards.length >= 10) badges.add('badge_srs_master');
    merged.earnedBadges = Array.from(badges);

    setProfile(merged);
    if (currentUser) {
      persistUserProfile(merged);
    }
  };

  const handleToggleMilestone = (milestoneId: string) => {
    const exists = profile.completedMilestones.includes(milestoneId);
    const nextMilestones = exists
      ? profile.completedMilestones.filter((id) => id !== milestoneId)
      : [...profile.completedMilestones, milestoneId];
    updateProfileState({ completedMilestones: nextMilestones });
  };

  const handleAddSrsWord = (
    wordItem: VocabWordItem,
    topic: string,
    cefrLevel: CefrLevel,
    source: 'vocab-hub' | 'news-reader' | 'custom'
  ) => {
    const cleanId = `card_${wordItem.word.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    if (srsCards.some((c) => c.id === cleanId)) {
      addNotificationToast(
        'Đã Có Trong Bộ Thẻ SRS',
        `Từ "${wordItem.word}" đã có sẵn trong danh sách ôn tập SRS của bạn.`
      );
      return;
    }

    const nowIso = new Date().toISOString();
    const formattedDef =
      wordItem.vietnameseMeaning && !wordItem.definition.includes('Nghĩa TV:')
        ? `Nghĩa TV: ${wordItem.vietnameseMeaning} — ${wordItem.definition}`
        : wordItem.definition;

    const newCard: SrsCardData = {
      id: cleanId,
      uid: currentUser?.uid || profile.uid,
      word: wordItem.word,
      phonetic: wordItem.phonetic,
      partOfSpeech: wordItem.partOfSpeech,
      definition: formattedDef,
      vietnameseMeaning: wordItem.vietnameseMeaning,
      exampleSentence: wordItem.exampleSentence,
      exampleTranslationVi: wordItem.exampleTranslationVi,
      topic,
      cefrLevel,
      source,
      masteryLevel: 'New',
      intervalDays: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewAt: nowIso,
      lastReviewedAt: nowIso,
    };

    const nextDeck = [newCard, ...srsCards];
    setSrsCards(nextDeck);
    if (currentUser) {
      persistSrsCard(newCard);
    }
    addNotificationToast(
      'Đã Lưu Vào Bộ Thẻ SRS Song Ngữ',
      `Từ "${wordItem.word}" (${cefrLevel}) đã được thêm kèm nghĩa Tiếng Việt.`
    );
  };

  const handleReviewSrsCard = (card: SrsCardData, rating: SrsRecallRating) => {
    const updatedCard = calculateSm2(card, rating);
    setSrsCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
    );
    if (currentUser) {
      persistSrsCard(updatedCard);
    }
  };

  const handleDeleteSrsCard = (cardId: string) => {
    setSrsCards((prev) => prev.filter((c) => c.id !== cardId));
    if (currentUser) {
      removeSrsCard(currentUser.uid, cardId);
    }
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (!profile.completedLessons.includes(lessonId)) {
      updateProfileState({
        completedLessons: [...profile.completedLessons, lessonId],
      });
      addNotificationToast(
        'Hoàn Thành Bài Học',
        'Đã lưu tiến độ bài học Từ vựng & Ngữ pháp CEFR vào hồ sơ.'
      );
    }
  };

  const handleSyncOfflinePack = () => {
    const nowIso = new Date().toISOString();
    localStorage.setItem(LOCAL_SRS_KEY, JSON.stringify(srsCards));
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    updateProfileState({ offlinePackSyncedAt: nowIso });
    addNotificationToast(
      'Đã Tải Bộ Dữ Liệu Học Offline',
      `Đã lưu ${srsCards.length} thẻ từ vựng SRS song ngữ và bài giảng vào bộ nhớ đệm.`
    );
  };

  const handleRecordSkillAttempt = (
    skill: SkillType,
    testTitle: string,
    bandScore: number,
    userResponse: string,
    aiFeedbackSummary: string,
    durationSeconds: number
  ) => {
    const newAttempt: PracticeAttemptData = {
      id: `att_${Date.now()}`,
      uid: currentUser?.uid || profile.uid,
      skill,
      testTitle,
      bandScore,
      userResponse,
      aiFeedbackSummary,
      durationSeconds,
      createdAtIso: new Date().toISOString(),
    };
    setAttempts((prev) => [newAttempt, ...prev]);
    if (currentUser) {
      persistPracticeAttempt(newAttempt);
    }

    const scoreField =
      skill === 'listening'
        ? { listeningScore: bandScore }
        : skill === 'reading'
        ? { readingScore: bandScore }
        : skill === 'writing'
        ? { writingScore: bandScore }
        : { speakingScore: bandScore };

    const nextBadges = Array.from(
      new Set([...profile.earnedBadges, 'badge_ai_examiner'])
    );
    updateProfileState({
      ...scoreField,
      earnedBadges: nextBadges,
    });
  };

  const handleSharePeerSubmission = (
    skill: 'writing' | 'speaking',
    promptTitle: string,
    content: string
  ) => {
    const handleNum = Math.floor(100 + Math.random() * 899);
    const newSub: PeerSubmissionData = {
      id: `peer_${Date.now()}`,
      authorUid: currentUser?.uid || profile.uid,
      anonymousHandle: `Scholar #${handleNum}`,
      authorBand: profile.currentBandLevel,
      skill,
      promptTitle,
      content,
      wordCount: content.trim().split(/\s+/).length,
      visibility: 'public',
      reviewCount: 0,
      averageBand: profile.targetBand - 0.5,
      latestReviewComment: 'Submitted for community IELTS rubric evaluation.',
      latestReviewerHandle: 'Awaiting Peer',
    };
    setPeerSubmissions((prev) => [newSub, ...prev]);
    if (currentUser) {
      publishPeerSubmission(newSub);
    }
    const nextBadges = Array.from(
      new Set([...profile.earnedBadges, 'badge_peer_mentor'])
    );
    updateProfileState({ earnedBadges: nextBadges });
  };

  const handleReviewPeerSubmission = (
    submission: PeerSubmissionData,
    bandGiven: number,
    comment: string
  ) => {
    const reviewerHandle = `Scholar (${profile.currentBandLevel})`;
    const newCount = submission.reviewCount + 1;
    const newAvg =
      submission.reviewCount === 0
        ? bandGiven
        : Number(
            (
              (submission.averageBand * submission.reviewCount + bandGiven) /
              newCount
            ).toFixed(1)
          );

    const updated: PeerSubmissionData = {
      ...submission,
      reviewCount: newCount,
      averageBand: newAvg,
      latestReviewComment: comment,
      latestReviewerHandle: reviewerHandle,
    };

    setPeerSubmissions((prev) =>
      prev.map((s) => (s.id === submission.id ? updated : s))
    );
    if (currentUser) {
      submitCommunityPeerReview(submission, bandGiven, comment, reviewerHandle);
    }

    const nextBadges = Array.from(
      new Set([...profile.earnedBadges, 'badge_peer_mentor'])
    );
    updateProfileState({ earnedBadges: nextBadges });
    addNotificationToast(
      'Đã Gửi Đánh Giá Chéo',
      'Cảm ơn bạn! Bạn đã mở khóa huy hiệu Cố Vấn Chấm Chéo (Peer Review Mentor).'
    );
  };

  const dueSrsCount = srsCards.filter(
    (c) => c.nextReviewAt <= new Date().toISOString()
  ).length;

  const navGroups: {
    groupTitle: string;
    items: {
      id: string;
      label: string;
      badge?: string;
      badgeAlert?: boolean;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }[] = [
    {
      groupTitle:
        langMode === 'en' ? '1. Overview & Roadmap' : '1. Tổng Quan & Lộ Trình',
      items: [
        {
          id: 'dashboard',
          label: langMode === 'en' ? 'Dashboard' : 'Tổng Quan Học Tập',
          badge: `Band ${profile.currentBandLevel}`,
          icon: LayoutDashboard,
        },
        {
          id: 'pathways',
          label: langMode === 'en' ? 'Band Roadmap' : 'Lộ Trình 4 Chặng',
          badge: `${profile.completedMilestones.length} mốc`,
          icon: Compass,
        },
      ],
    },
    {
      groupTitle:
        langMode === 'en' ? '2. Vocabulary & Grammar' : '2. Từ Vựng & Ngữ Pháp',
      items: [
        {
          id: 'vocab-grammar',
          label: langMode === 'en' ? 'Vocabulary & 20-Q Grammar' : 'Từ Vựng & Ngữ Pháp (20 Câu)',
          badge: '16.750 từ',
          icon: BookOpen,
        },
        {
          id: 'srs-deck',
          label: langMode === 'en' ? 'SRS Flashcards' : 'Ôn Thẻ Từ Vựng SRS',
          badge: dueSrsCount > 0 ? `${dueSrsCount} cần ôn` : `${srsCards.length} thẻ`,
          badgeAlert: dueSrsCount > 0,
          icon: Layers,
        },
      ],
    },
    {
      groupTitle:
        langMode === 'en' ? '3. Practice & Media Studio' : '3. Luyện Kỹ Năng & Video',
      items: [
        {
          id: 'shadowing',
          label:
            langMode === 'en' ? 'Video Cloze & Shadowing' : 'Video YouTube & Điền Từ',
          badge: '62+ video',
          icon: Video,
        },
        {
          id: 'news-reader',
          label: langMode === 'en' ? 'Bilingual News Reader' : 'Đọc Báo Song Ngữ',
          icon: Newspaper,
        },
        {
          id: 'skills-lab',
          label: langMode === 'en' ? '4-Skills & AI Grader' : 'Luyện 4 Kỹ Năng & Chấm AI',
          icon: GraduationCap,
        },
        {
          id: 'reminders',
          label: langMode === 'en' ? 'Reminders & Offline' : 'Lịch Nhắc & Lưu Offline',
          badge: profile.reminderTime,
          icon: Bell,
        },
      ],
    },
  ];

  const navItems = navGroups.flatMap((g) => g.items);

  const currentModuleTitle =
    navItems.find((n) => n.id === activeModule)?.label || 'Workspace';

  const handleGoogleSignIn = async () => {
    setLoginErrorMsg(null);
    setIsSigningInGoogle(true);
    try {
      const cred = await signInWithGoogle();
      if (cred?.user) {
        setShowLoginModal(false);
        addNotificationToast(
          'Đăng Nhập Thành Công',
          `Chào mừng ${cred.user.displayName || cred.user.email || 'Học viên'}!`
        );
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err);
      if (raw.includes('unauthorized-domain')) {
        setLoginErrorMsg(
          'Tên miền hiện tại (ví dụ: GitHub Pages) chưa được thêm vào danh sách Authorized Domains của Firebase Popup. Bạn có thể đăng nhập ngay bằng Tên & Email ở khung bên dưới!'
        );
      } else if (raw.includes('popup-blocked') || raw.includes('popup-closed')) {
        setLoginErrorMsg(
          'Cửa sổ Popup Google bị trình duyệt chặn hoặc đã đóng. Bạn có thể dùng Đăng nhập Nhanh bằng Tên & Email ngay bên dưới!'
        );
      } else {
        setLoginErrorMsg(
          'Không thể mở cửa sổ Google Auth trong môi trường này. Hãy điền Tên & Email bên dưới để đăng nhập ngay!'
        );
      }
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleQuickScholarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = loginNameInput.trim() || 'Học viên IELTS';
    const cleanEmail = loginEmailInput.trim() || 'scholar@ielts.edu.vn';
    const account = { name: cleanName, email: cleanEmail };
    setLocalScholarAccount(account);
    try {
      localStorage.setItem('scholarband_local_account_v1', JSON.stringify(account));
    } catch {
      // ignore
    }
    updateProfileState({ displayName: cleanName });
    setShowLoginModal(false);
    setLoginErrorMsg(null);
    addNotificationToast(
      'Đã Đăng Nhập Tài Khoản Học Tập',
      `Xin chào ${cleanName}! Toàn bộ tiến độ và thẻ SRS của bạn đã được kích hoạt.`
    );
  };

  const handleSignOutAll = async () => {
    if (currentUser) {
      try {
        await signOutUser();
      } catch {
        // ignore
      }
    }
    setLocalScholarAccount(null);
    try {
      localStorage.removeItem('scholarband_local_account_v1');
    } catch {
      // ignore
    }
    addNotificationToast('Đã Đăng Xuất', 'Bạn đã đăng xuất khỏi tài khoản hiện tại.');
  };

  const isUserLoggedIn = Boolean(currentUser || localScholarAccount);
  const activeDisplayName =
    currentUser?.displayName ||
    localScholarAccount?.name ||
    profile.displayName ||
    'Scholar';

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] dark:bg-[#0B0F17] text-[#18181B] dark:text-[#F3F0E6]">
      <OfflineIndicator />

      {/* Desktop Collapsible Sidebar Navigation (Can be toggled open/closed anytime) */}
      {isDesktopSidebarOpen && (
        <aside className="hidden lg:flex flex-col justify-between w-[276px] shrink-0 border-r border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] p-5 select-none transition-all">
          <div className="space-y-6">
            {/* Brand Wordmark + Collapse Sidebar Button */}
            <div className="flex items-center justify-between border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModule('dashboard')}
                  className="text-xl font-bold tracking-tight text-[#18181B] dark:text-[#F3F0E6] cursor-pointer"
                >
                  ScholarBand
                </button>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] text-[11px] font-mono-tabular text-[#991B1B] dark:text-[#D97706] font-semibold">
                  Band {profile.targetBand.toFixed(1)}
                </span>
              </div>
              <button
                onClick={() => setIsDesktopSidebarOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-[#18181B] dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#0B0F17] cursor-pointer"
                title="Thu gọn menu sang trái"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Grouped Scientific Navigation Links */}
            <nav className="space-y-6" aria-label="Main Learning Navigation">
              {navGroups.map((group) => (
                <div key={group.groupTitle} className="space-y-2">
                  <p className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                    {group.groupTitle}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveModule(item.id)}
                          className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17] font-semibold shadow-xs'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-[#FAF8F5] dark:hover:bg-[#0B0F17]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[11px] font-mono-tabular shrink-0 px-1.5 py-0.5 rounded ${
                                active
                                  ? 'bg-black/15 text-white dark:text-[#0B0F17]'
                                  : item.badgeAlert
                                  ? 'bg-red-50 dark:bg-amber-950/50 text-[#991B1B] dark:text-[#D97706] font-semibold'
                                  : 'text-zinc-400 dark:text-zinc-500'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Placement & Settings Card */}
          <div className="space-y-2.5 pt-4 border-t border-[#E6E2DA] dark:border-[#263042]">
            <button
              onClick={() => setShowPlacementModal(true)}
              className="w-full py-2.5 px-3 text-[13px] font-semibold rounded-xl border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] hover:border-[#991B1B] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
              <span>
                {profile.diagnosticSavedState && !profile.diagnosticCompleted
                  ? langMode === 'en'
                    ? 'Resume Placement Test'
                    : 'Tiếp Tục Thi Đầu Vào'
                  : langMode === 'en'
                  ? '4-Skill Placement Test'
                  : 'Kiểm Tra Xếp Lớp 4 Kỹ Năng'}
              </span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-[#E6E2DA] dark:border-[#263042] hover:border-zinc-400 flex items-center justify-between text-zinc-600 dark:text-zinc-300 cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
                <span>Cài đặt Ngôn ngữ &amp; Giao diện</span>
              </span>
              <span className="font-mono-tabular text-[11px] opacity-75">
                {langMode === 'bilingual' ? 'Song ngữ' : langMode === 'vi' ? 'VI' : 'EN'}
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white dark:bg-[#151C28] border-r border-[#E6E2DA] dark:border-[#263042] p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E6E2DA] dark:border-[#263042] pb-3">
                <span className="text-lg font-bold">ScholarBand</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-zinc-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-5">
                {navGroups.map((group) => (
                  <div key={group.groupTitle} className="space-y-1.5">
                    <p className="px-2 text-xs font-semibold text-zinc-400">
                      {group.groupTitle}
                    </p>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveModule(item.id);
                            setMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer ${
                            active
                              ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17]'
                              : 'text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[11px] font-mono-tabular opacity-80">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
            <div className="pt-4 border-t border-[#E6E2DA] dark:border-[#263042] space-y-2">
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  setShowSettingsModal(true);
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-[#E6E2DA] dark:border-[#263042] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Cài đặt Ngôn ngữ &amp; Giao diện</span>
              </button>
              <PWAInstallButton />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Uncluttered Top Workspace Header */}
        <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0B0F17]/95 backdrop-blur border-b border-[#E6E2DA] dark:border-[#263042] px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Sidebar Toggle Button (Desktop & Mobile) + Section Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Sidebar Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsDesktopSidebarOpen((prev) => !prev)}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] hover:border-[#991B1B] text-xs font-medium cursor-pointer"
              title={isDesktopSidebarOpen ? 'Thu gọn menu' : 'Mở menu điều hướng'}
            >
              {isDesktopSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
              )}
              <span>{isDesktopSidebarOpen ? 'Thu gọn Menu' : 'Mở Menu'}</span>
            </button>

            <div className="flex items-center gap-2 text-sm truncate">
              <button
                onClick={() => setActiveModule('dashboard')}
                className="font-medium text-zinc-500 hover:text-[#18181B] dark:hover:text-[#F3F0E6] cursor-pointer"
              >
                ScholarBand
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="truncate text-[#18181B] dark:text-[#F3F0E6] font-bold">
                {currentModuleTitle}
              </span>
            </div>
          </div>

          {/* Right: Streak, Notification Bell, Unified Settings Button, and Login/Account Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Streak Indicator */}
            <button
              onClick={() => setActiveModule('reminders')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono-tabular border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] rounded-lg cursor-pointer"
              title="Chuỗi ngày học liên tiếp"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>{profile.studyStreak} ngày</span>
            </button>

            {/* In-App Notification Bell & Due SRS Count */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono-tabular border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] rounded-lg cursor-pointer"
                aria-label="Notifications and Due SRS Flashcards"
              >
                <Bell className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
                <span>{dueSrsCount}</span>
              </button>

              {showNotifPopover && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl shadow-lg p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between border-b border-[#E6E2DA] dark:border-[#263042] pb-2">
                    <span className="text-xs font-bold">
                      Thông Báo &amp; Thẻ SRS Đến Hạn
                    </span>
                    <button
                      onClick={() => {
                        setShowNotifPopover(false);
                        setActiveModule('srs-deck');
                      }}
                      className="text-[11px] text-[#991B1B] dark:text-[#D97706] hover:underline cursor-pointer"
                    >
                      Ôn {dueSrsCount} thẻ ngay →
                    </button>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span>{n.title}</span>
                          <span className="text-zinc-400 font-mono-tabular">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                          {n.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Unified Settings Button (Contains Language Mode + Light/Dark Theme) */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] hover:border-[#991B1B] cursor-pointer"
              title="Cài đặt Ngôn ngữ & Giao diện Sáng/Tối"
            >
              <Settings className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
              <span className="hidden sm:inline">
                {langMode === 'en' ? 'Settings' : 'Cài đặt'}
              </span>
            </button>

            {/* Account / Login Button */}
            {isUserLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-pointer"
                  title="Tài khoản đang đăng nhập"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{activeDisplayName}</span>
                </button>
                <button
                  onClick={handleSignOutAll}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] rounded-lg hover:border-red-600 cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {langMode === 'en' ? 'Sign Out' : 'Thoát'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginNameInput(
                    profile.displayName !== 'Visiting Scholar' ? profile.displayName : ''
                  );
                  setLoginErrorMsg(null);
                  setShowLoginModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-[#D97706] dark:text-[#0B0F17] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{langMode === 'en' ? 'Sign in' : 'Đăng nhập'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Floating In-App Toast Banner */}
        {toastAlert && (
          <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17] px-4 py-3 rounded-xl shadow-lg border border-[#991B1B] space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold font-serif-editorial">
                {toastAlert.title}
              </span>
              <button
                onClick={() => setToastAlert(null)}
                className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs opacity-90">{toastAlert.body}</p>
          </div>
        )}

        {/* Main Workspace Stage (Wide 1280px Scientific Layout) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
          {(activeModule === 'dashboard' || activeModule === 'pathways') && (
            <DashboardAndPathways
              mode={activeModule}
              langMode={langMode}
              profile={profile}
              srsCards={srsCards}
              attempts={attempts}
              onNavigate={(mod) => setActiveModule(mod)}
              onOpenPlacement={() => setShowPlacementModal(true)}
              onToggleMilestone={handleToggleMilestone}
              onSelectBandLevel={(band: BandLevelId) =>
                updateProfileState({ currentBandLevel: band })
              }
            />
          )}

          {(activeModule === 'vocab-grammar' || activeModule === 'srs-deck') && (
            <VocabAndSrsModules
              mode={activeModule}
              langMode={langMode}
              srsCards={srsCards}
              completedLessons={profile.completedLessons}
              offlinePackSyncedAt={profile.offlinePackSyncedAt}
              onAddSrsWord={handleAddSrsWord}
              onReviewSrsCard={handleReviewSrsCard}
              onDeleteSrsCard={handleDeleteSrsCard}
              onCompleteLesson={handleCompleteLesson}
              onSyncOfflinePack={handleSyncOfflinePack}
            />
          )}

          {activeModule === 'skills-lab' && (
            <SkillsLabAndPeerModule
              langMode={langMode}
              currentBandLevel={profile.currentBandLevel}
              targetBand={profile.targetBand}
              peerSubmissions={peerSubmissions}
              onRecordAttempt={handleRecordSkillAttempt}
              onSharePeerSubmission={handleSharePeerSubmission}
              onReviewPeerSubmission={handleReviewPeerSubmission}
            />
          )}

          {(activeModule === 'news-reader' ||
            activeModule === 'shadowing' ||
            activeModule === 'reminders') && (
            <NewsShadowingReminders
              mode={activeModule}
              langMode={langMode}
              profile={profile}
              srsCards={srsCards}
              onAddSrsWord={handleAddSrsWord}
              onUpdateReminders={(updates) => updateProfileState(updates)}
              onTriggerNotificationToast={addNotificationToast}
            />
          )}
        </main>

        {/* Quiet Editorial Footer */}
        <footer className="border-t border-[#E6E2DA] dark:border-[#263042] px-4 md:px-8 py-4 text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            ScholarBand · Nền Tảng Học IELTS &amp; Tiếng Anh Học Thuật Song Ngữ Anh – Việt
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPlacementModal(true)}
              className="hover:underline cursor-pointer"
            >
              {langMode === 'en' ? 'Diagnostic Placement' : 'Kiểm Tra Đầu Vào'}
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveModule('shadowing')}
              className="hover:underline cursor-pointer"
            >
              {langMode === 'en' ? 'YouTube Anime/Movie Cloze' : 'Video Anime/Phim & Điền Từ'}
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveModule('srs-deck')}
              className="hover:underline cursor-pointer"
            >
              SM-2 Flashcards ({srsCards.length})
            </button>
          </div>
        </footer>
      </div>

      {/* Dual-Mode Placement & Calibration Modal */}
      {showPlacementModal && (
        <PlacementModal
          langMode={langMode}
          profile={profile}
          onClose={() => setShowPlacementModal(false)}
          onSaveProgress={(savedPartial) => updateProfileState(savedPartial)}
          onCompletePlacement={(res) => {
            updateProfileState({
              currentBandLevel: res.bandLevel,
              targetBand: res.targetBand,
              listeningScore: res.listeningScore,
              readingScore: res.readingScore,
              writingScore: res.writingScore,
              speakingScore: res.speakingScore,
              diagnosticCompleted: true,
              diagnosticMode: res.mode,
              diagnosticStep: 0,
              diagnosticSavedState: '',
            });
            setShowPlacementModal(false);
            if (res.summaryText) {
              addNotificationToast('Đã Xác Định Lộ Trình Band', res.summaryText);
            }
          }}
        />
      )}

      {/* Unified Settings Modal (Language Mode + Light/Dark Theme + Quick Study Preferences) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E2DA] dark:border-[#263042] pb-3.5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#991B1B] dark:text-[#D97706]" />
                <h2 className="text-lg font-bold">
                  {langMode === 'en' ? 'Workspace Settings' : 'Cài Đặt Hệ Thống'}
                </h2>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Language Mode Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
                <span>Chế Độ Ngôn Ngữ Hiển Thị (Language Mode)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'bilingual', label: 'Song ngữ Anh-Việt' },
                    { id: 'vi', label: 'Tiếng Việt' },
                    { id: 'en', label: 'English' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setLangMode(m.id)}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      langMode === m.id
                        ? 'bg-[#991B1B] text-white border-[#991B1B] dark:bg-[#D97706] dark:text-[#0B0F17] dark:border-[#D97706]'
                        : 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#E6E2DA] dark:border-[#263042] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Light / Dark Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                {darkMode ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-600" />
                )}
                <span>Giao Diện Sáng / Tối (Appearance)</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    !darkMode
                      ? 'bg-[#991B1B] text-white border-[#991B1B]'
                      : 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#E6E2DA] dark:border-[#263042] text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Giao diện Sáng</span>
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    darkMode
                      ? 'bg-[#D97706] text-[#0B0F17] border-[#D97706]'
                      : 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#E6E2DA] dark:border-[#263042] text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Giao diện Tối</span>
                </button>
              </div>
            </div>

            {/* 3. Navigation Sidebar Visibility */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                <PanelLeftOpen className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
                <span>Thanh Menu Điều Hướng Bên Trái</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setIsDesktopSidebarOpen(true)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
                    isDesktopSidebarOpen
                      ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                      : 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#E6E2DA] dark:border-[#263042]'
                  }`}
                >
                  Đang mở Menu
                </button>
                <button
                  onClick={() => setIsDesktopSidebarOpen(false)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
                    !isDesktopSidebarOpen
                      ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                      : 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#E6E2DA] dark:border-[#263042]'
                  }`}
                >
                  Thu gọn Menu
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E6E2DA] dark:border-[#263042] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setActiveModule('reminders');
                }}
                className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706] hover:underline cursor-pointer"
              >
                Mở cài đặt Lịch nhắc &amp; Lưu Offline →
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login & Account Modal (Supports both Google Auth & Instant Scholar Account Login) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E2DA] dark:border-[#263042] pb-3.5">
              <div>
                <h2 className="text-lg font-bold">
                  {isUserLoggedIn ? 'Thông Tin Tài Khoản Học Viên' : 'Đăng Nhập ScholarBand'}
                </h2>
                <p className="text-xs text-zinc-500">
                  Lưu tiến độ học tập, bộ thẻ từ vựng SRS và lộ trình Band IELTS
                </p>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Option 1: Direct Scholar Profile Login (Works everywhere including GitHub Pages & Iframes) */}
            <form onSubmit={handleQuickScholarLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Tên học viên hiển thị
                </label>
                <input
                  type="text"
                  required
                  value={loginNameInput}
                  onChange={(e) => setLoginNameInput(e.target.value)}
                  placeholder="Ví dụ: Minh Anh, Hoàng Nam..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email học viên (Tùy chọn)
                </label>
                <input
                  type="email"
                  value={loginEmailInput}
                  onChange={(e) => setLoginEmailInput(e.target.value)}
                  placeholder="hocvien@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white dark:bg-[#D97706] dark:text-[#0B0F17] cursor-pointer"
              >
                {isUserLoggedIn ? 'Cập Nhật Hồ Sơ Học Viên' : 'Đăng Nhập Ngay'}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E6E2DA] dark:border-[#263042]" />
              <span className="shrink-0 mx-3 text-xs text-zinc-400">Hoặc đồng bộ Cloud</span>
              <div className="flex-grow border-t border-[#E6E2DA] dark:border-[#263042]" />
            </div>

            {/* Option 2: Google Cloud OAuth Popup */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningInGoogle}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] hover:border-[#991B1B] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
                <span>
                  {isSigningInGoogle
                    ? 'Đang kết nối Google...'
                    : 'Đăng nhập bằng Tài khoản Google (Cloud Sync)'}
                </span>
              </button>

              {loginErrorMsg && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  {loginErrorMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScholarBandWorkspace />
    </ErrorBoundary>
  );
}
