import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Plus,
  Check,
  Sparkles,
  Repeat,
  Mic,
  Square,
  Play,
  Pause,
  Bell,
  CheckCircle2,
  BookOpen,
  Languages,
  Youtube,
  HelpCircle,
  Edit3,
  X,
  RotateCcw,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  BandLevelId,
  CefrLevel,
  IeltsTopic,
  LanguageMode,
  NewsArticleItem,
  ShadowingSentence,
  ShadowingVideoLesson,
  SrsCardData,
  UserProfileData,
  VideoCategory,
  VocabWordItem,
} from '../types';
import {
  NEWS_ARTICLES,
  SHADOWING_LESSONS,
  lookupWordDefinition,
  speakText,
  extractYoutubeId,
} from '../data/curriculum';
import { MEGA_YOUTUBE_VIDEOS } from '../data/megaCatalog';
import { PWAInstallButton } from './ErrorBoundary';

interface NewsShadowingRemindersProps {
  mode: 'news-reader' | 'shadowing' | 'reminders';
  langMode: LanguageMode;
  profile: UserProfileData;
  srsCards: SrsCardData[];
  onAddSrsWord: (
    wordItem: VocabWordItem,
    topic: string,
    cefrLevel: CefrLevel,
    source: 'vocab-hub' | 'news-reader' | 'custom'
  ) => void;
  onUpdateReminders: (updates: Partial<UserProfileData>) => void;
  onTriggerNotificationToast: (title: string, body: string) => void;
}

const CUSTOM_VIDEOS_STORAGE_KEY = 'scholarband_custom_youtube_videos_v1';

export const NewsShadowingReminders: React.FC<NewsShadowingRemindersProps> = ({
  mode,
  langMode,
  profile,
  srsCards,
  onAddSrsWord,
  onUpdateReminders,
  onTriggerNotificationToast,
}) => {
  const showVi = langMode === 'bilingual' || langMode === 'vi';

  // Module 5 State: Dynamic English News Reader
  const [articles, setArticles] = useState<NewsArticleItem[]>(NEWS_ARTICLES);
  const [activeArticleId, setActiveArticleId] = useState<string>(NEWS_ARTICLES[0].id);
  const [showArticleViTranslation, setShowArticleViTranslation] = useState<boolean>(true);
  const [selectedWordInfo, setSelectedWordInfo] = useState<{
    tokenKey: string;
    word: string;
    phraseContext: string;
    phonetic: string;
    partOfSpeech: string;
    definition: string;
    vietnameseMeaning: string;
    cefrLevel: CefrLevel;
    exampleSentence: string;
    horizontalAlign: 'left' | 'center' | 'right';
  } | null>(null);
  const [newsQuizAnswers, setNewsQuizAnswers] = useState<Record<string, number>>({});
  const [newsQuizSubmitted, setNewsQuizSubmitted] = useState<Record<string, boolean>>({});

  // AI News Adapter State
  const [customNewsTitle, setCustomNewsTitle] = useState('');
  const [customNewsSourceText, setCustomNewsSourceText] = useState('');
  const [adaptBandTarget, setAdaptBandTarget] = useState<BandLevelId>(profile.currentBandLevel);
  const [isAdaptingNews, setIsAdaptingNews] = useState(false);
  const [adaptError, setAdaptError] = useState<string | null>(null);

  // Module 6 State: Video Shadowing & Listen-Fill-in-the-Blank Studio (62+ Curated Videos + Continuous AI Updates)
  const ALL_BUILTIN_VIDEOS = [...SHADOWING_LESSONS, ...MEGA_YOUTUBE_VIDEOS];
  const [videoLessons, setVideoLessons] = useState<ShadowingVideoLesson[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_VIDEOS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ShadowingVideoLesson[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...ALL_BUILTIN_VIDEOS];
        }
      }
    } catch {
      // ignore
    }
    return ALL_BUILTIN_VIDEOS;
  });

  const [selectedVideoCat, setSelectedVideoCat] = useState<'ALL' | VideoCategory>('ALL');
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [videoPage, setVideoPage] = useState(1);
  const [showFullVideoGrid, setShowFullVideoGrid] = useState(false);
  const [isFetchingAiVideoFeed, setIsFetchingAiVideoFeed] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string>(SHADOWING_LESSONS[0].id);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(0);
  const [videoPracticeMode, setVideoPracticeMode] = useState<'shadowing' | 'cloze'>('cloze');
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1.0 | 1.25>(1.0);
  const [isLoopingSentence, setIsLoopingSentence] = useState(false);
  const [isShadowPlaying, setIsShadowPlaying] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [isRecordingShadow, setIsRecordingShadow] = useState(false);
  const [shadowRecordings, setShadowRecordings] = useState<Record<string, string>>({});
  const shadowMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const shadowChunksRef = useRef<Blob[]>([]);

  // Fill-in-the-Blank Cloze State
  const [clozeInputs, setClozeInputs] = useState<Record<string, string>>({});
  const [clozeChecked, setClozeChecked] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [focusedSentenceId, setFocusedSentenceId] = useState<string | null>(null);

  // User Add Custom YouTube Video Modal State
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newYtUrl, setNewYtUrl] = useState('');
  const [newYtTitle, setNewYtTitle] = useState('');
  const [newYtTitleVi, setNewYtTitleVi] = useState('');
  const [newYtCategory, setNewYtCategory] = useState<VideoCategory>('Anime');
  const [newYtSpeaker, setNewYtSpeaker] = useState('YouTube Creator');
  const [newYtRawScript, setNewYtRawScript] = useState('');
  const [isGeneratingClozeAi, setIsGeneratingClozeAi] = useState(false);
  const [draftSentences, setDraftSentences] = useState<ShadowingSentence[]>([
    {
      id: 'draft_1',
      startTime: 0,
      endTime: 8,
      speaker: 'Speaker',
      text: 'Even when the journey feels overwhelming, taking one deliberate step forward changes your destiny.',
      translationVi: 'Ngay cả khi hành trình có vẻ quá sức, việc tiến lên một bước có chủ đích sẽ thay đổi vận mệnh của bạn.',
      phoneticFocus: '/ˌəʊvəˈwelmɪŋ/ · /ˈdestɪni/',
      stressTip: 'Stress OVER-whelming and DES-tiny.',
      stressTipVi: 'Nhấn trọng âm vào OVER-whelming và DES-tiny.',
      clozeWord: 'overwhelming',
      clozeHintVi: 'tính từ (12 chữ cái): quá tải, choáng ngợp',
      clozeExplanationEn: '"Overwhelming" is an adjective meaning very intense or hard to deal with.',
      clozeExplanationVi: 'Chữa lỗi: "overwhelming" (adj) nghĩa là choáng ngợp, quá sức chịu đựng.',
    },
  ]);

  const filteredVideos = videoLessons.filter((v) => {
    if (selectedVideoCat !== 'ALL' && v.category !== selectedVideoCat) return false;
    if (videoSearchQuery.trim()) {
      const q = videoSearchQuery.trim().toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        (v.titleVi || '').toLowerCase().includes(q) ||
        v.speakerName.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const VIDEOS_PER_PAGE = 9;
  const totalVideoPages = Math.max(1, Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE));
  const safeVideoPage = Math.min(Math.max(1, videoPage), totalVideoPages);
  const paginatedVideos = filteredVideos.slice(
    (safeVideoPage - 1) * VIDEOS_PER_PAGE,
    safeVideoPage * VIDEOS_PER_PAGE
  );

  const activeShadowLesson =
    videoLessons.find((v) => v.id === activeVideoId) ||
    filteredVideos[0] ||
    videoLessons[0];
  const activeSentence =
    activeShadowLesson.sentences[activeSentenceIdx] || activeShadowLesson.sentences[0];

  // Synchronized Sentence Playback & Loop Handler
  useEffect(() => {
    if (!isShadowPlaying) return;
    speakText(activeSentence.text, playbackSpeed);
    const durationMs = Math.max(
      3500,
      Math.round(((activeSentence.endTime - activeSentence.startTime) * 1000) / playbackSpeed)
    );
    const timer = setTimeout(() => {
      if (isLoopingSentence) {
        speakText(activeSentence.text, playbackSpeed);
      } else if (activeSentenceIdx < activeShadowLesson.sentences.length - 1) {
        setActiveSentenceIdx((i) => i + 1);
      } else {
        setIsShadowPlaying(false);
      }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [
    isShadowPlaying,
    activeSentenceIdx,
    isLoopingSentence,
    playbackSpeed,
    activeSentence,
    activeShadowLesson,
  ]);

  const startShadowRecording = async (sentenceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      shadowChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) shadowChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(shadowChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setShadowRecordings((prev) => ({ ...prev, [sentenceId]: url }));
        stream.getTracks().forEach((t) => t.stop());
      };
      shadowMediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingShadow(true);
    } catch {
      onTriggerNotificationToast(
        'Thông báo Micro',
        'Vui lòng cấp quyền truy cập Microphone trên trình duyệt để thu âm giọng đọc Shadowing của bạn.'
      );
    }
  };

  const stopShadowRecording = () => {
    if (shadowMediaRecorderRef.current && isRecordingShadow) {
      shadowMediaRecorderRef.current.stop();
      setIsRecordingShadow(false);
    }
  };

  // Generate Cloze Sentences with AI for Custom YouTube Video
  const handleGenerateVideoClozeWithAi = async () => {
    setIsGeneratingClozeAi(true);
    try {
      const response = await fetch('/api/ai/generate-video-cloze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: newYtTitle.trim() || 'Short Anime & Movie Scene',
          category: newYtCategory,
          rawTranscriptOrTopic:
            newYtRawScript.trim() ||
            newYtTitle.trim() ||
            'Inspiring anime/movie dialogue with B2-C1 vocabulary',
        }),
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.sentences) && data.sentences.length > 0) {
        if (data.titleVi && !newYtTitleVi) {
          setNewYtTitleVi(data.titleVi);
        }
        const generated: ShadowingSentence[] = data.sentences.map(
          (
            s: {
              speaker?: string;
              text: string;
              translationVi: string;
              phoneticFocus: string;
              stressTip: string;
              stressTipVi: string;
              clozeWord: string;
              clozeHintVi: string;
              clozeExplanationEn: string;
              clozeExplanationVi: string;
            },
            idx: number
          ) => ({
            id: `custom_sent_${Date.now()}_${idx}`,
            startTime: idx * 8,
            endTime: (idx + 1) * 8,
            speaker: s.speaker || newYtSpeaker || 'Speaker',
            text: s.text,
            translationVi: s.translationVi,
            phoneticFocus: s.phoneticFocus,
            stressTip: s.stressTip,
            stressTipVi: s.stressTipVi,
            clozeWord: s.clozeWord,
            clozeHintVi: s.clozeHintVi,
            clozeExplanationEn: s.clozeExplanationEn,
            clozeExplanationVi: s.clozeExplanationVi,
          })
        );
        setDraftSentences(generated);
        onTriggerNotificationToast(
          'Đã Tạo Phụ Đề & Bài Điền Từ Bằng AI',
          `Đã tạo ${generated.length} câu phụ đề song ngữ Anh-Việt kèm từ khuyết để nghe điền từ!`
        );
      }
    } catch {
      onTriggerNotificationToast(
        'Lỗi Tạo Tự Động',
        'Không thể kết nối AI lúc này, bạn vẫn có thể chỉnh sửa trực tiếp các câu bên dưới.'
      );
    } finally {
      setIsGeneratingClozeAi(false);
    }
  };

  const handleSaveCustomYoutubeVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYoutubeId(newYtUrl) || 'dQw4w9WgXcQ';
    const newVideo: ShadowingVideoLesson = {
      id: `vid_user_${Date.now()}`,
      title: newYtTitle.trim() || 'Custom YouTube Practice Clip',
      titleVi: newYtTitleVi.trim() || 'Video YouTube Tự Thêm Để Luyện Shadowing & Điền Từ',
      speakerName: newYtSpeaker.trim() || 'YouTube Creator',
      accent: 'Original Audio + Dual TTS',
      topic: 'Education',
      bandTarget: profile.currentBandLevel,
      durationLabel: '01:00',
      category: newYtCategory,
      youtubeId: ytId,
      sentences: draftSentences.filter((s) => s.text.trim().length > 0),
    };

    const nextVideos = [newVideo, ...videoLessons];
    setVideoLessons(nextVideos);
    try {
      const userOnly = nextVideos.filter((v) => v.id.startsWith('vid_user_'));
      localStorage.setItem(CUSTOM_VIDEOS_STORAGE_KEY, JSON.stringify(userOnly));
    } catch {
      // ignore
    }

    setActiveVideoId(newVideo.id);
    setActiveSentenceIdx(0);
    setShowAddVideoModal(false);
    setNewYtUrl('');
    setNewYtTitle('');
    setNewYtTitleVi('');
    setNewYtRawScript('');
    onTriggerNotificationToast(
      'Đã Thêm Video YouTube Mới!',
      `Video "${newVideo.title}" đã sẵn sàng để luyện Shadowing và Nghe Điền Từ.`
    );
  };

  // Helper to render sentence with interactive blank for `clozeWord`
  const renderClozeSentence = (sent: ShadowingSentence) => {
    const target = sent.clozeWord.trim();
    const userVal = clozeInputs[sent.id] || '';
    const isChecked = clozeChecked[activeShadowLesson.id];
    const isCorrect = userVal.trim().toLowerCase() === target.toLowerCase();

    const regex = new RegExp(`\\b(${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i');
    const parts = sent.text.split(regex);

    if (parts.length < 2) {
      // Fallback if word not exact match in sentence
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <span>{sent.text}</span>
          <input
            type="text"
            value={userVal}
            onFocus={() => setFocusedSentenceId(sent.id)}
            onChange={(e) =>
              setClozeInputs((prev) => ({ ...prev, [sent.id]: e.target.value }))
            }
            placeholder="Điền từ..."
            className={`px-2.5 py-1 text-xs font-mono-tabular rounded border w-36 ${
              isChecked
                ? isCorrect
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                  : 'border-red-600 bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200'
                : 'border-[#991B1B] dark:border-[#D97706] bg-white dark:bg-[#151C28]'
            }`}
          />
        </div>
      );
    }

    return (
      <p className="text-sm md:text-base font-medium leading-relaxed text-[#18181B] dark:text-[#F3F0E6]">
        {parts.map((part, i) => {
          if (part.toLowerCase() === target.toLowerCase()) {
            return (
              <span key={i} className="inline-flex items-center mx-1 align-baseline">
                <input
                  type="text"
                  value={userVal}
                  onFocus={() => setFocusedSentenceId(sent.id)}
                  onChange={(e) =>
                    setClozeInputs((prev) => ({ ...prev, [sent.id]: e.target.value }))
                  }
                  placeholder={`(${target.length} chữ cái)`}
                  aria-label="Fill in the blank word"
                  className={`px-2.5 py-0.5 text-xs md:text-sm font-mono-tabular rounded-md border text-center w-36 transition-colors focus:outline-none ${
                    isChecked
                      ? isCorrect
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-red-600 bg-red-50 dark:bg-red-950/70 text-red-900 dark:text-red-200 font-bold'
                      : 'border-[#991B1B] dark:border-[#D97706] bg-white dark:bg-[#151C28] text-[#991B1B] dark:text-[#D97706] font-semibold'
                  }`}
                />
                {isChecked && !isCorrect && (
                  <span className="ml-1.5 px-2 py-0.5 text-xs font-mono-tabular font-bold rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                    ✓ {target}
                  </span>
                )}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  // Module 5: English News Reader
  if (mode === 'news-reader') {
    const currentArticle =
      articles.find((a) => a.id === activeArticleId) || articles[0];

    const handleAdaptArticleWithAi = async (e: React.FormEvent) => {
      e.preventDefault();
      const rawText =
        customNewsSourceText.trim() ||
        currentArticle.paragraphs.join('\n\n');
      setIsAdaptingNews(true);
      setAdaptError(null);
      try {
        const response = await fetch('/api/ai/adapt-news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: customNewsTitle.trim() || currentArticle.title,
            sourceText: rawText,
            targetBandLevel: adaptBandTarget,
            topic: currentArticle.topic,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to adapt article.');
        }

        const newId = `news_ai_${Date.now()}`;
        const validCefr: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
        const cefr: CefrLevel = validCefr.includes(data.cefrBadge) ? data.cefrBadge : 'B2';

        const adaptedArticle: NewsArticleItem = {
          id: newId,
          title: data.adaptedTitle || `${currentArticle.title} (Band ${adaptBandTarget})`,
          titleVi: data.adaptedTitleVi || currentArticle.titleVi,
          sourcePublication: `AI Level-Adapted Edition · Band ${adaptBandTarget}`,
          topic: currentArticle.topic,
          bandLevel: adaptBandTarget,
          cefrLevel: cefr,
          readTimeMinutes: Number(data.readTimeMinutes) || 3,
          publishedDate: 'Adapted Today',
          summary: `Dynamically calibrated by AI to match IELTS Band ${adaptBandTarget} (${cefr}) syntactic and lexical complexity.`,
          summaryVi: `Bài báo đã được AI biên tập lại từ vựng và cấu trúc câu khớp với trình độ Band ${adaptBandTarget} (${cefr}).`,
          paragraphs:
            Array.isArray(data.paragraphs) && data.paragraphs.length > 0
              ? data.paragraphs
              : currentArticle.paragraphs,
          paragraphsVi:
            Array.isArray(data.paragraphsVi) && data.paragraphsVi.length > 0
              ? data.paragraphsVi
              : currentArticle.paragraphsVi,
          comprehensionQuestions: Array.isArray(data.comprehensionQuestions)
            ? data.comprehensionQuestions.map(
                (
                  q: {
                    question: string;
                    questionVi?: string;
                    options: string[];
                    correctIndex: number;
                    explanation: string;
                    explanationVi?: string;
                  },
                  i: number
                ) => ({
                  id: `${newId}_q_${i}`,
                  question: q.question,
                  questionVi: q.questionVi,
                  options: q.options,
                  correctIndex: q.correctIndex,
                  explanation: q.explanation,
                  explanationVi: q.explanationVi,
                })
              )
            : [],
        };

        setArticles((prev) => [adaptedArticle, ...prev]);
        setActiveArticleId(newId);
        setCustomNewsSourceText('');
        setCustomNewsTitle('');
      } catch (err: unknown) {
        setAdaptError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsAdaptingNews(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-[#E6E2DA] dark:border-[#263042] pb-5 space-y-1.5">
          <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
            {langMode === 'vi'
              ? 'Học phần 05 · Đọc Báo Tiếng Anh Tương Tác (Chạm Từ Tra Nghĩa Tiếng Việt) & AI Điều Chỉnh Cấp Độ'
              : 'Module 05 · Interactive Click-to-Define Bilingual Journalism & AI Level Adapter'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold font-serif-editorial">
            {langMode === 'vi'
              ? 'Đọc Báo Tiếng Anh Song Ngữ & Từ Điển Chạm Trực Tiếp'
              : 'English News Reader (Từ Điển Chạm Anh – Việt)'}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl">
            {langMode === 'en'
              ? 'Click on any word in an article to inspect its instant definition, Vietnamese translation, phonetic transcription, and audio pronunciation, and add it directly to your SRS flashcard deck.'
              : 'Nhấn vào bất kỳ từ tiếng Anh nào trong bài báo để xem ngay Nghĩa Tiếng Việt, Định nghĩa Anh, phiên âm IPA, nghe phát âm và lưu thẳng vào bộ thẻ SRS.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols): Article Feed + AI Level Adapter */}
          <div className="lg:col-span-4 space-y-5">
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold font-serif-editorial uppercase tracking-wider text-zinc-500">
                {langMode === 'en'
                  ? `Graded News Editions (${articles.length})`
                  : `Ấn Bản Báo Học Thuật (${articles.length})`}
              </h2>
              {articles.map((art) => (
                <button
                  key={art.id}
                  onClick={() => {
                    setActiveArticleId(art.id);
                    setSelectedWordInfo(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                    art.id === currentArticle.id
                      ? 'bg-white dark:bg-[#151C28] border-[#991B1B] dark:border-[#D97706]'
                      : 'bg-white/75 dark:bg-[#151C28]/60 border-[#E6E2DA] dark:border-[#263042]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono-tabular text-zinc-500">
                    <span className="text-[#991B1B] dark:text-[#D97706] font-semibold">
                      Band {art.bandLevel} · CEFR {art.cefrLevel}
                    </span>
                    <span>{art.readTimeMinutes} min read</span>
                  </div>
                  <h3 className="text-sm font-bold font-serif-editorial">{art.title}</h3>
                  {showVi && art.titleVi && (
                    <p className="text-xs font-medium text-[#991B1B] dark:text-[#D97706]">
                      🇻🇳 {art.titleVi}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500">
                    {art.sourcePublication} · {art.topic}
                  </p>
                </button>
              ))}
            </div>

            {/* Dynamic AI News Level Adapter */}
            <form
              onSubmit={handleAdaptArticleWithAi}
              className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#991B1B] dark:text-[#D97706]">
                <Sparkles className="w-4 h-4" />
                <span>
                  {langMode === 'en'
                    ? 'AI Dynamic News Level Adapter'
                    : 'AI Chuyển Đổi Cấp Độ Bài Báo & Dịch Song Ngữ'}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {langMode === 'en'
                  ? 'Paste any BBC/Economist paragraph (or leave blank to adapt the current article) to rewrite its vocabulary & syntax to your target Band:'
                  : 'Dán bất kỳ đoạn báo tiếng Anh nào (hoặc để trống để chuyển đổi bài hiện tại) sang cấp độ Band của bạn kèm bản dịch và câu hỏi song ngữ:'}
              </p>
              <input
                type="text"
                placeholder="Tiêu đề bài báo tùy chọn..."
                value={customNewsTitle}
                onChange={(e) => setCustomNewsTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
              />
              <textarea
                rows={3}
                placeholder="Dán nội dung bài báo tiếng Anh vào đây (hoặc để trống để AI viết lại bài hiện tại)..."
                value={customNewsSourceText}
                onChange={(e) => setCustomNewsSourceText(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
              />
              <div className="flex items-center justify-between gap-2 text-xs">
                <span>Chuyển sang Band:</span>
                <select
                  value={adaptBandTarget}
                  onChange={(e) => setAdaptBandTarget(e.target.value as BandLevelId)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] font-mono-tabular"
                >
                  <option value="0-3.5">Band 0 – 3.5 (A1–A2)</option>
                  <option value="3.5-5.0">Band 3.5 – 5.0 (B1)</option>
                  <option value="5.0-6.0">Band 5.0 – 6.0 (B2)</option>
                  <option value="6.0-7.0+">Band 6.0 – 7.0+ (C1)</option>
                </select>
              </div>
              {adaptError && <p className="text-xs text-red-600">{adaptError}</p>}
              <button
                type="submit"
                disabled={isAdaptingNews}
                className="w-full py-2 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {isAdaptingNews
                  ? 'AI Đang Biên Tập Lại Bài Báo...'
                  : `Biên Tập Sang Band ${adaptBandTarget}`}
              </button>
            </form>
          </div>

          {/* Right Column (8 cols): Interactive Word-Clickable Article + Popover + Quiz */}
          <div className="lg:col-span-8 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 md:p-8 space-y-6">
            {currentArticle.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-[#E6E2DA] dark:border-[#263042] max-h-60 bg-zinc-900">
                <img
                  src={currentArticle.imageUrl}
                  alt={currentArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-56 object-cover"
                />
              </div>
            )}

            <div className="border-b border-[#E6E2DA] dark:border-[#263042] pb-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <span>
                  {currentArticle.sourcePublication} · {currentArticle.publishedDate} · Band{' '}
                  {currentArticle.bandLevel} (CEFR {currentArticle.cefrLevel})
                </span>
                <div className="flex items-center gap-2">
                  {showVi && (
                    <button
                      onClick={() => setShowArticleViTranslation(!showArticleViTranslation)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                    >
                      <Languages className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{showArticleViTranslation ? 'Ẩn dịch đoạn văn' : 'Hiện dịch đoạn văn'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => speakText(currentArticle.paragraphs.join(' '), 0.98)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
                    <span>{langMode === 'en' ? 'Listen to Article' : 'Nghe Đọc Bài Báo'}</span>
                  </button>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-serif-editorial">
                {currentArticle.title}
              </h2>
              {showVi && currentArticle.titleVi && (
                <p className="text-sm font-semibold text-[#991B1B] dark:text-[#D97706]">
                  🇻🇳 {currentArticle.titleVi}
                </p>
              )}
              <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                {langMode === 'vi' && currentArticle.summaryVi
                  ? currentArticle.summaryVi
                  : currentArticle.summary}
              </p>
            </div>

            {/* Concise Reading Tip */}
            <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] text-xs text-zinc-500 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706] shrink-0" />
                <span>
                  {langMode === 'en'
                    ? 'Click any word below to open an instant popup definition right next to the word.'
                    : 'Chạm vào bất kỳ từ nào trong bài để mở cửa sổ nhỏ giải thích từ/cụm từ ngay cạnh từ đó.'}
                </span>
              </span>
              {selectedWordInfo && (
                <button
                  onClick={() => setSelectedWordInfo(null)}
                  className="text-[11px] font-semibold text-[#991B1B] dark:text-[#D97706] hover:underline shrink-0 cursor-pointer"
                >
                  Đóng khung tra từ ✕
                </button>
              )}
            </div>

            {/* Tokenized Interactive Article Paragraphs with Floating Inline Popover Next to Clicked Word */}
            <div className="space-y-5 text-base leading-relaxed">
              {currentArticle.paragraphs.map((para, pIdx) => {
                const tokens = para.split(/(\s+)/);
                return (
                  <div key={pIdx} className="space-y-2">
                    <div className="text-[#18181B] dark:text-[#F3F0E6] leading-8">
                      {tokens.map((tok, tIdx) => {
                        if (/^\s+$/.test(tok)) return tok;
                        const tokenKey = `${pIdx}_${tIdx}`;
                        const isActive = selectedWordInfo?.tokenKey === tokenKey;

                        return (
                          <span key={tIdx} className="relative inline-block">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isActive) {
                                  setSelectedWordInfo(null);
                                  return;
                                }
                                const info = lookupWordDefinition(tok, para);
                                if (info) {
                                  // Build surrounding 2-3 word phrase context
                                  const prevWord =
                                    tIdx >= 2 ? tokens[tIdx - 2]?.replace(/[^a-zA-Z-]/g, '') : '';
                                  const nextWord =
                                    tIdx + 2 < tokens.length
                                      ? tokens[tIdx + 2]?.replace(/[^a-zA-Z-]/g, '')
                                      : '';
                                  const phraseContext = [prevWord, info.word, nextWord]
                                    .filter(Boolean)
                                    .join(' ');

                                  // Determine horizontal alignment so popover never overflows viewport
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const winW =
                                    typeof window !== 'undefined' ? window.innerWidth : 1024;
                                  const horizontalAlign: 'left' | 'center' | 'right' =
                                    rect.left < 220
                                      ? 'left'
                                      : winW - rect.right < 240
                                      ? 'right'
                                      : 'center';

                                  setSelectedWordInfo({
                                    ...info,
                                    tokenKey,
                                    phraseContext,
                                    horizontalAlign,
                                  });
                                  speakText(info.word);
                                }
                              }}
                              className={`cursor-pointer rounded px-1 py-0.5 transition-colors select-text ${
                                isActive
                                  ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17] font-semibold shadow-xs'
                                  : 'hover:bg-[#991B1B]/15 dark:hover:bg-[#D97706]/25'
                              }`}
                            >
                              {tok}
                            </span>

                            {/* Floating Small Popup Window Directly Next to Clicked Word */}
                            {isActive && selectedWordInfo && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute z-40 top-full mt-2 w-72 sm:w-80 p-3.5 rounded-2xl bg-white dark:bg-[#151C28] border-2 border-[#991B1B] dark:border-[#D97706] shadow-2xl text-left space-y-2.5 leading-normal ${
                                  selectedWordInfo.horizontalAlign === 'left'
                                    ? 'left-0'
                                    : selectedWordInfo.horizontalAlign === 'right'
                                    ? 'right-0'
                                    : 'left-1/2 -translate-x-1/2'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 border-b border-[#E6E2DA] dark:border-[#263042] pb-2">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-base font-bold text-[#18181B] dark:text-[#F3F0E6]">
                                        {selectedWordInfo.word}
                                      </span>
                                      <span className="text-xs font-mono-tabular text-zinc-500">
                                        {selectedWordInfo.phonetic}
                                      </span>
                                      <button
                                        onClick={() => speakText(selectedWordInfo.word)}
                                        className="p-1 rounded-md border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] hover:border-[#991B1B] cursor-pointer"
                                        title="Nghe phát âm"
                                      >
                                        <Volume2 className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
                                      </button>
                                    </div>
                                    <p className="text-[11px] text-zinc-500">
                                      <em>{selectedWordInfo.partOfSpeech}</em> · CEFR{' '}
                                      <strong>{selectedWordInfo.cefrLevel}</strong>
                                      {selectedWordInfo.phraseContext &&
                                        selectedWordInfo.phraseContext !== selectedWordInfo.word && (
                                          <span> · Cụm: “{selectedWordInfo.phraseContext}”</span>
                                        )}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setSelectedWordInfo(null)}
                                    className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
                                    title="Đóng"
                                  >
                                    ✕
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                                    🇻🇳 Nghĩa: {selectedWordInfo.vietnameseMeaning}
                                  </div>
                                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                    {selectedWordInfo.definition}
                                  </p>
                                </div>

                                <div className="pt-1 flex items-center justify-between gap-2">
                                  <button
                                    onClick={() =>
                                      speakText(selectedWordInfo.phraseContext || selectedWordInfo.word)
                                    }
                                    className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] cursor-pointer"
                                  >
                                    🔊 Nghe cả cụm
                                  </button>

                                  {(() => {
                                    const alreadyInDeck = srsCards.some(
                                      (c) =>
                                        c.word.toLowerCase() ===
                                        selectedWordInfo.word.toLowerCase()
                                    );
                                    return (
                                      <button
                                        onClick={() =>
                                          onAddSrsWord(
                                            {
                                              word: selectedWordInfo.word,
                                              phonetic: selectedWordInfo.phonetic,
                                              partOfSpeech: selectedWordInfo.partOfSpeech,
                                              definition: `Nghĩa TV: ${selectedWordInfo.vietnameseMeaning} — ${selectedWordInfo.definition}`,
                                              vietnameseMeaning:
                                                selectedWordInfo.vietnameseMeaning,
                                              exampleSentence: selectedWordInfo.exampleSentence,
                                              collocations: [],
                                            },
                                            currentArticle.topic as IeltsTopic,
                                            selectedWordInfo.cefrLevel,
                                            'news-reader'
                                          )
                                        }
                                        disabled={alreadyInDeck}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer ${
                                          alreadyInDeck
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            : 'bg-[#991B1B] text-white hover:bg-[#7F1D1D] dark:bg-[#D97706] dark:text-[#0B0F17]'
                                        }`}
                                      >
                                        {alreadyInDeck ? (
                                          <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Đã lưu SRS</span>
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>+ Lưu Thẻ SRS</span>
                                          </>
                                        )}
                                      </button>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </span>
                        );
                      })}
                    </div>
                    {showVi &&
                      showArticleViTranslation &&
                      currentArticle.paragraphsVi?.[pIdx] && (
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-[#FAF8F5] dark:bg-[#0B0F17] p-3 rounded-lg border border-[#E6E2DA] dark:border-[#263042] leading-relaxed">
                          🇻🇳 {currentArticle.paragraphsVi[pIdx]}
                        </p>
                      )}
                  </div>
                );
              })}
            </div>

            {/* Reading Comprehension Check with Bilingual Explanations */}
            {currentArticle.comprehensionQuestions.length > 0 && (
              <div className="pt-5 border-t border-[#E6E2DA] dark:border-[#263042] space-y-4">
                <h3 className="text-base font-bold font-serif-editorial">
                  {langMode === 'en'
                    ? 'Article Comprehension Check'
                    : 'Câu Hỏi Đọc Hiểu & Giải Thích Song Ngữ Anh – Việt'}
                </h3>
                {currentArticle.comprehensionQuestions.map((q, qIdx) => {
                  const chosen = newsQuizAnswers[q.id];
                  const isSub = newsQuizSubmitted[currentArticle.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2.5"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-semibold">
                          {qIdx + 1}. {q.question}
                        </p>
                        {showVi && q.questionVi && (
                          <p className="text-[11px] text-zinc-500">🇻🇳 {q.questionVi}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oIdx) => {
                          const selected = chosen === oIdx;
                          const correct = q.correctIndex === oIdx;
                          let cls =
                            'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042]';
                          if (isSub) {
                            if (correct)
                              cls =
                                'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-semibold';
                            else if (selected)
                              cls =
                                'bg-red-50 dark:bg-red-950/60 border-red-600 text-red-900 dark:text-red-200';
                          } else if (selected) {
                            cls = 'bg-[#991B1B] text-white border-[#991B1B] dark:bg-[#D97706]';
                          }
                          return (
                            <button
                              key={oIdx}
                              onClick={() =>
                                setNewsQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                              }
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs border cursor-pointer ${cls}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {isSub && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-[#E6E2DA] dark:border-[#263042] text-xs">
                          <div className="p-2.5 rounded bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042]">
                            <strong>🇬🇧 EN:</strong> {q.explanation}
                          </div>
                          {q.explanationVi && (
                            <div className="p-2.5 rounded bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                              <strong>🇻🇳 Giải thích TV:</strong> {q.explanationVi}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      setNewsQuizSubmitted((prev) => ({ ...prev, [currentArticle.id]: true }))
                    }
                    className="px-4 py-2 text-xs font-medium text-white bg-[#991B1B] rounded-lg cursor-pointer"
                  >
                    {langMode === 'en'
                      ? 'Verify Comprehension Answers'
                      : 'Kiểm Tra Đáp Án & Xem Chữa Lỗi Song Ngữ'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Module 6: Video Shadowing & Listen-and-Fill-in-the-Blank Studio (Anime, Animation, Movies, Academic + User Added)
  if (mode === 'shadowing') {
    const wordBankList = activeShadowLesson.sentences.map((s) => s.clozeWord);
    const totalBlanks = activeShadowLesson.sentences.length;
    const correctBlanksCount = activeShadowLesson.sentences.filter(
      (s) =>
        (clozeInputs[s.id] || '').trim().toLowerCase() === s.clozeWord.trim().toLowerCase()
    ).length;

    const handleAutoUpdateNewVideoWithAi = async () => {
      setIsFetchingAiVideoFeed(true);
      const targetCat: VideoCategory =
        selectedVideoCat === 'ALL' || selectedVideoCat === 'User Added'
          ? 'Anime'
          : selectedVideoCat;
      const sampleIds: Record<VideoCategory, string[]> = {
        Anime: ['MGRm4IzK1SQ', 'VQGCKyvzIM4', 'h7MYJghRWt0', '3fumBcKC6RE'],
        Animation: ['yRUAzGQ3nSY', 'CaimKeDcudo', 'xU47nhruN-Q', 's7L2PVdrb_8'],
        Movies: ['zSWdZVtXT7E', 'YoHD9XEInc0', '8hP9D6kZseM', 'EXeTwQWrcwY'],
        Academic: ['UF8uR6Z6KLc', 'P6FORpg0KVo', 'arj7oStGLkU', 'iCvmsMzlF7o'],
        'User Added': ['UF8uR6Z6KLc'],
        Custom: ['UF8uR6Z6KLc'],
      };
      const pool = sampleIds[targetCat] || sampleIds.Anime;
      const pickedYtId = pool[videoLessons.length % pool.length];

      try {
        const res = await fetch('/api/ai/generate-video-cloze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${targetCat} Special Edition #${videoLessons.length + 1}`,
            category: targetCat,
            rawTranscriptOrTopic: `Create a fresh ${targetCat} scene with rich B2-C1 vocabulary for IELTS Listening & Shadowing practice.`,
          }),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.sentences) && data.sentences.length > 0) {
          const newVid: ShadowingVideoLesson = {
            id: `vid_user_ai_${Date.now()}`,
            title: `${targetCat} AI Update #${videoLessons.length + 1}: ${data.speakerName || 'Special Scene'}`,
            titleVi:
              data.titleVi ||
              `Video ${targetCat} Mới Cập Nhật Tự Động #${videoLessons.length + 1}`,
            speakerName: data.speakerName || `${targetCat} Narrator`,
            accent: 'Clear Studio English',
            topic: 'Society',
            bandTarget: profile.currentBandLevel,
            durationLabel: '00:45',
            category: targetCat,
            youtubeId: pickedYtId,
            sentences: data.sentences.map(
              (
                s: {
                  speaker?: string;
                  text: string;
                  translationVi: string;
                  phoneticFocus: string;
                  stressTip: string;
                  stressTipVi: string;
                  clozeWord: string;
                  clozeHintVi: string;
                  clozeExplanationEn: string;
                  clozeExplanationVi: string;
                },
                idx: number
              ) => ({
                id: `ai_feed_sent_${Date.now()}_${idx}`,
                startTime: idx * 8,
                endTime: (idx + 1) * 8,
                speaker: s.speaker || data.speakerName || 'Speaker',
                text: s.text,
                translationVi: s.translationVi,
                phoneticFocus: s.phoneticFocus,
                stressTip: s.stressTip,
                stressTipVi: s.stressTipVi,
                clozeWord: s.clozeWord,
                clozeHintVi: s.clozeHintVi,
                clozeExplanationEn: s.clozeExplanationEn,
                clozeExplanationVi: s.clozeExplanationVi,
              })
            ),
          };
          const nextList = [newVid, ...videoLessons];
          setVideoLessons(nextList);
          setActiveVideoId(newVid.id);
          setActiveSentenceIdx(0);
          setVideoPage(1);
          onTriggerNotificationToast(
            'Đã Cập Nhật Thêm Video Mới!',
            `Đã bổ sung "${newVid.titleVi}" vào kho ${nextList.length} video.`
          );
        }
      } catch {
        onTriggerNotificationToast(
          'Thông báo',
          'Bạn có thể bấm "+ Thêm Video YouTube Mới" để dán trực tiếp bất kỳ link YouTube nào.'
        );
      } finally {
        setIsFetchingAiVideoFeed(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Top Header + Continuous AI Video Updater & Add Custom YouTube Video CTA */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E6E2DA] dark:border-[#263042] pb-5">
          <div className="space-y-1.5">
            <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
              Module 06 · Kho {videoLessons.length}+ Video YouTube (Anime, Hoạt Hình, Phim Điện Ảnh, Học Thuật) · Cập Nhật Liên Tục
            </p>
            <h1 className="text-2xl md:text-3xl font-bold font-serif-editorial">
              {langMode === 'en'
                ? `YouTube Shadowing & Cloze Studio (${videoLessons.length}+ Videos)`
                : `Phòng Luyện ${videoLessons.length}+ Video YouTube: Shadowing & Nghe Điền Từ`}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl">
              {langMode === 'en'
                ? 'Browse 62+ curated short YouTube clips across Anime, Animation, Cinema Movies, and Academic Lectures—continuously updated with AI or your own YouTube links.'
                : `Kho ${videoLessons.length}+ video ngắn đa chủ đề (Anime, Hoạt hình, Phim Điện ảnh, TED/Học thuật) có sẵn phụ đề song ngữ và bài tập Nghe Đoán Từ Điền Chỗ Trống. Bấm nút cập nhật AI để tải thêm video mới liên tục hoặc tự thêm link YouTube của bạn!`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleAutoUpdateNewVideoWithAi}
              disabled={isFetchingAiVideoFeed}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border border-[#991B1B] dark:border-[#D97706] text-[#991B1B] dark:text-[#D97706] hover:bg-[#991B1B] hover:text-white rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingAiVideoFeed ? 'animate-spin' : ''}`} />
              <span>
                {isFetchingAiVideoFeed
                  ? 'Đang Tải Thêm Video Mới...'
                  : '🔄 Cập Nhật Thêm Video Mới (AI)'}
              </span>
            </button>

            <button
              onClick={() => setShowAddVideoModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-[#D97706] dark:text-[#0B0F17] rounded-lg whitespace-nowrap cursor-pointer"
            >
              <Youtube className="w-4 h-4" />
              <span>+ Tự Thêm Link YouTube Mới</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs + Search Input + Paginated Video Selector Cards */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#151C28] p-3.5 rounded-xl border border-[#E6E2DA] dark:border-[#263042]">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'ALL', label: `Tất cả (${videoLessons.length})` },
                  {
                    id: 'Anime',
                    label: `✨ Anime (${videoLessons.filter((v) => v.category === 'Anime').length})`,
                  },
                  {
                    id: 'Animation',
                    label: `🧸 Hoạt hình (${videoLessons.filter((v) => v.category === 'Animation').length})`,
                  },
                  {
                    id: 'Movies',
                    label: `🎬 Phim Điện ảnh (${videoLessons.filter((v) => v.category === 'Movies').length})`,
                  },
                  {
                    id: 'Academic',
                    label: `🎓 Học thuật (${videoLessons.filter((v) => v.category === 'Academic').length})`,
                  },
                  {
                    id: 'User Added',
                    label: `➕ Của Bạn (${videoLessons.filter((v) => v.category === 'User Added').length})`,
                  },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedVideoCat(cat.id);
                    setVideoPage(1);
                    const matching =
                      cat.id === 'ALL'
                        ? videoLessons
                        : videoLessons.filter((v) => v.category === cat.id);
                    if (matching.length > 0) {
                      setActiveVideoId(matching[0].id);
                      setActiveSentenceIdx(0);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedVideoCat === cat.id
                      ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17]'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-[#FAF8F5] dark:hover:bg-[#0B0F17]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Video Search Input + Collapse/Expand Grid Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={videoSearchQuery}
                  onChange={(e) => {
                    setVideoSearchQuery(e.target.value);
                    setVideoPage(1);
                    setShowFullVideoGrid(true);
                  }}
                  placeholder="Tìm trong 62+ video (Tên phim, nhân vật)..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                />
              </div>

              <button
                onClick={() => setShowFullVideoGrid((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] text-[#18181B] dark:text-[#F3F0E6] cursor-pointer"
              >
                <span>
                  {showFullVideoGrid
                    ? '🔼 Thu gọn danh sách video'
                    : `🔽 Mở danh sách (${filteredVideos.length} video)`}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Active Video Switcher Bar (Always visible for instant ergonomics) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2 py-0.5 text-[11px] font-mono-tabular font-bold rounded bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17] shrink-0">
                ĐANG HỌC · {activeShadowLesson.category}
              </span>
              <span className="text-xs md:text-sm font-bold font-serif-editorial truncate">
                {activeShadowLesson.title}
              </span>
              {showVi && activeShadowLesson.titleVi && (
                <span className="hidden md:inline text-xs text-zinc-500 truncate">
                  ({activeShadowLesson.titleVi})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={activeShadowLesson.id}
                onChange={(e) => {
                  setActiveVideoId(e.target.value);
                  setActiveSentenceIdx(0);
                  setIsShadowPlaying(false);
                }}
                aria-label="Chọn nhanh video trong danh mục"
                className="max-w-[220px] px-2.5 py-1 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28]"
              >
                {filteredVideos.map((v, idx) => (
                  <option key={v.id} value={v.id}>
                    #{idx + 1} · [{v.category}] {v.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const curIdx = filteredVideos.findIndex((v) => v.id === activeShadowLesson.id);
                  const prevIdx = curIdx > 0 ? curIdx - 1 : filteredVideos.length - 1;
                  if (filteredVideos[prevIdx]) {
                    setActiveVideoId(filteredVideos[prevIdx].id);
                    setActiveSentenceIdx(0);
                    setIsShadowPlaying(false);
                  }
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] hover:border-[#991B1B] cursor-pointer"
              >
                ⏮ Video Trước
              </button>
              <button
                onClick={() => {
                  const curIdx = filteredVideos.findIndex((v) => v.id === activeShadowLesson.id);
                  const nextIdx = curIdx < filteredVideos.length - 1 ? curIdx + 1 : 0;
                  if (filteredVideos[nextIdx]) {
                    setActiveVideoId(filteredVideos[nextIdx].id);
                    setActiveSentenceIdx(0);
                    setIsShadowPlaying(false);
                  }
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] hover:border-[#991B1B] cursor-pointer"
              >
                Video Tiếp ⏭
              </button>
            </div>
          </div>

          {showFullVideoGrid && (
            <>
              {/* Paginated Video Cards Selector (9 per page) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {paginatedVideos.map((vid) => {
                  const isSelected = vid.id === activeShadowLesson.id;
                  return (
                    <button
                      key={vid.id}
                      onClick={() => {
                        setActiveVideoId(vid.id);
                        setActiveSentenceIdx(0);
                        setIsShadowPlaying(false);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                        isSelected
                          ? 'bg-white dark:bg-[#151C28] border-[#991B1B] dark:border-[#D97706] ring-1 ring-[#991B1B]/20'
                          : 'bg-white/75 dark:bg-[#151C28]/60 border-[#E6E2DA] dark:border-[#263042] hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono-tabular">
                        <span className="px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] font-semibold text-[#991B1B] dark:text-[#D97706]">
                          {vid.category} · Band {vid.bandTarget}
                        </span>
                        <span className="text-zinc-500">
                          {vid.sentences.length} câu · {vid.durationLabel}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold font-serif-editorial line-clamp-1">
                        {vid.title}
                      </h3>
                      {showVi && vid.titleVi && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                          🇻🇳 {vid.titleVi}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Video Library Pagination Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-xl bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] text-xs">
                <span className="font-mono-tabular text-zinc-500">
                  Đang hiển thị {(safeVideoPage - 1) * VIDEOS_PER_PAGE + 1} –{' '}
                  {Math.min(safeVideoPage * VIDEOS_PER_PAGE, filteredVideos.length)} trên tổng số{' '}
                  <strong>{filteredVideos.length} video</strong> (Trang {safeVideoPage}/{totalVideoPages})
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVideoPage((p) => Math.max(1, p - 1))}
                    disabled={safeVideoPage <= 1}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#E6E2DA] dark:border-[#263042] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Trước
                  </button>
                  <span className="font-mono-tabular font-bold px-2">
                    Trang {safeVideoPage} / {totalVideoPages}
                  </span>
                  <button
                    onClick={() => setVideoPage((p) => Math.min(totalVideoPages, p + 1))}
                    disabled={safeVideoPage >= totalVideoPages}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#E6E2DA] dark:border-[#263042] disabled:opacity-40 cursor-pointer"
                  >
                    Tiếp <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Two-Zone Sandbox Layout: YouTube Player & Audio Deck (6 cols) + Dual Mode Practice Stage (6 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: YouTube Embed Player + Synchronized Subtitle Banner + Voice Recorder */}
          <div className="lg:col-span-6 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 space-y-5">
            {/* Embedded YouTube Player or Custom Video */}
            <div className="rounded-xl overflow-hidden border border-[#E6E2DA] dark:border-[#263042] bg-zinc-950 aspect-video relative">
              {customVideoUrl ? (
                <video
                  src={customVideoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  key={`${activeShadowLesson.youtubeId}_${activeSentence.startTime}`}
                  src={`https://www.youtube-nocookie.com/embed/${activeShadowLesson.youtubeId}?start=${activeSentence.startTime}&end=${activeSentence.endTime}&rel=0&modestbranding=1`}
                  title={activeShadowLesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Active Sentence Bilingual Subtitle Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular text-zinc-500">
                <span className="font-semibold text-[#991B1B] dark:text-[#D97706]">
                  {activeShadowLesson.speakerName} · Câu {activeSentenceIdx + 1}/
                  {activeShadowLesson.sentences.length} (00:
                  {String(activeSentence.startTime).padStart(2, '0')} – 00:
                  {String(activeSentence.endTime).padStart(2, '0')})
                </span>
                <button
                  onClick={() => speakText(activeSentence.text, playbackSpeed)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] text-[#991B1B] dark:text-[#D97706] font-sans font-medium cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Phát câu này ({playbackSpeed}x)</span>
                </button>
              </div>

              {videoPracticeMode === 'shadowing' ? (
                <p className="text-base md:text-lg font-serif-editorial font-semibold text-[#18181B] dark:text-[#F3F0E6]">
                  “{activeSentence.text}”
                </p>
              ) : (
                <div className="py-1">{renderClozeSentence(activeSentence)}</div>
              )}

              {showVi && activeSentence.translationVi && (
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  🇻🇳 <strong>Nghĩa câu:</strong> “{activeSentence.translationVi}”
                </p>
              )}

              <p className="text-[11px] font-mono-tabular text-zinc-500">
                IPA: {activeSentence.phoneticFocus} ·{' '}
                {langMode === 'vi' && activeSentence.stressTipVi
                  ? activeSentence.stressTipVi
                  : activeSentence.stressTip}
              </p>
            </div>

            {/* Playback & Speed Control Deck */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShadowPlaying(!isShadowPlaying)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg cursor-pointer"
                >
                  {isShadowPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Đọc Chuỗi Phụ Đề</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsLoopingSentence(!isLoopingSentence)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    isLoopingSentence
                      ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                      : 'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042]'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{isLoopingSentence ? 'Lặp Câu: BẬT' : 'Lặp Câu'}</span>
                </button>
              </div>

              {/* Speed Selector: 0.75x, 1.0x, 1.25x */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#151C28] rounded-lg border border-[#E6E2DA] dark:border-[#263042]">
                {([0.75, 1.0, 1.25] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2.5 py-1 text-xs font-mono-tabular font-medium rounded cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-[#991B1B] text-white dark:bg-[#D97706]'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Active Sentence Voice Recording & Side-by-Side Comparison */}
            <div className="p-4 rounded-xl border border-[#E6E2DA] dark:border-[#263042] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold font-serif-editorial">
                    Thu Âm &amp; So Sánh Giọng Nhại (Shadowing Câu #{activeSentenceIdx + 1})
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Thu âm giọng đọc của bạn và nghe đối chiếu với phát âm gốc:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(activeSentence.text, playbackSpeed)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
                    <span>Nghe Mẫu</span>
                  </button>

                  {!isRecordingShadow ? (
                    <button
                      onClick={() => startShadowRecording(activeSentence.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#991B1B] rounded-lg cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Thu Âm Giọng Tôi</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopShadowRecording}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 rounded-lg cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Dừng Thu</span>
                    </button>
                  )}
                </div>
              </div>

              {shadowRecordings[activeSentence.id] && (
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E6E2DA] dark:border-[#263042]">
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    ✓ Bản Thu Của Bạn:
                  </span>
                  <audio
                    controls
                    src={shadowRecordings[activeSentence.id]}
                    className="h-8 max-w-xs"
                  />
                </div>
              )}

              {/* Optional Custom Video Stream Input */}
              <div className="pt-2 border-t border-[#E6E2DA] dark:border-[#263042]">
                <input
                  type="url"
                  placeholder="Tùy chọn: Dán link file video MP4/WebM trực tiếp nếu không dùng YouTube..."
                  value={customVideoUrl}
                  onChange={(e) => setCustomVideoUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                />
              </div>
            </div>
          </div>

          {/* Right: Dual Practice Mode Stage (1. Nghe Đoán Từ Điền Chỗ Trống vs 2. Phụ Đề Song Ngữ Shadowing) */}
          <div className="lg:col-span-6 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-5">
            {/* Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
              <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] dark:bg-[#0B0F17] rounded-xl border border-[#E6E2DA] dark:border-[#263042]">
                <button
                  onClick={() => setVideoPracticeMode('cloze')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    videoPracticeMode === 'cloze'
                      ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17] font-semibold'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>1. Nghe Đoán Từ &amp; Điền Chỗ Trống</span>
                </button>
                <button
                  onClick={() => setVideoPracticeMode('shadowing')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    videoPracticeMode === 'shadowing'
                      ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17] font-semibold'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>2. Phụ Đề Song Ngữ &amp; Shadowing</span>
                </button>
              </div>

              {videoPracticeMode === 'cloze' && (
                <span className="text-xs font-mono-tabular font-semibold text-[#991B1B] dark:text-[#D97706]">
                  Điền đúng: {correctBlanksCount} / {totalBlanks}
                </span>
              )}
            </div>

            {videoPracticeMode === 'cloze' ? (
              <div className="space-y-4">
                {/* Clickable Word Bank + First-Letter Hint (VoiceTube / Language Reactor style) */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#18181B] dark:text-[#F3F0E6]">
                      Ngân Hàng Từ Vựng Gợi Ý (Chạm vào từ để điền nhanh vào ô đang chọn):
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const nextInputs: Record<string, string> = { ...clozeInputs };
                          activeShadowLesson.sentences.forEach((s) => {
                            if (!(nextInputs[s.id] || '').trim() && s.clozeWord) {
                              nextInputs[s.id] = s.clozeWord.slice(0, 1);
                            }
                          });
                          setClozeInputs(nextInputs);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                        title="Điền chữ cái đầu tiên cho các ô còn trống"
                      >
                        💡 Gợi ý chữ đầu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setClozeInputs({});
                          setClozeChecked((prev) => ({
                            ...prev,
                            [activeShadowLesson.id]: false,
                          }));
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-[#991B1B] cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Làm lại
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wordBankList.map((w, i) => {
                      const isUsed = Object.values(clozeInputs).some(
                        (v) => v.trim().toLowerCase() === w.toLowerCase()
                      );
                      return (
                        <button
                          key={`${w}_${i}`}
                          type="button"
                          onClick={() => {
                            const targetSentId =
                              focusedSentenceId ||
                              activeShadowLesson.sentences.find(
                                (s) => !(clozeInputs[s.id] || '').trim()
                              )?.id ||
                              activeSentence.id;
                            setClozeInputs((prev) => ({
                              ...prev,
                              [targetSentId]: w,
                            }));
                          }}
                          className={`px-2.5 py-1 text-xs font-mono-tabular rounded-md border transition-colors cursor-pointer ${
                            isUsed
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 border-transparent line-through'
                              : 'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042] hover:border-[#991B1B] font-semibold'
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cloze Sentences List */}
                <div className="space-y-3.5 max-h-[540px] overflow-y-auto pr-1">
                  {activeShadowLesson.sentences.map((sent, idx) => {
                    const isCurrent = idx === activeSentenceIdx;
                    const isSub = clozeChecked[activeShadowLesson.id];
                    const showHint = revealedHints[sent.id];
                    const alreadyInSrs = srsCards.some(
                      (c) => c.word.toLowerCase() === sent.clozeWord.toLowerCase()
                    );

                    return (
                      <div
                        key={sent.id}
                        onClick={() => setActiveSentenceIdx(idx)}
                        className={`p-4 rounded-xl border transition-colors space-y-2.5 ${
                          isCurrent
                            ? 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#991B1B] dark:border-[#D97706]'
                            : 'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tabular text-zinc-500">
                          <span>
                            Câu #{idx + 1} · 00:{String(sent.startTime).padStart(2, '0')} – 00:
                            {String(sent.endTime).padStart(2, '0')} · {sent.speaker}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSentenceIdx(idx);
                                speakText(sent.text, playbackSpeed);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] text-[#991B1B] dark:text-[#D97706] cursor-pointer"
                            >
                              <Volume2 className="w-3 h-3" /> Nghe câu
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRevealedHints((prev) => ({
                                  ...prev,
                                  [sent.id]: !prev[sent.id],
                                }));
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] text-amber-700 dark:text-amber-400 cursor-pointer"
                            >
                              <HelpCircle className="w-3 h-3" /> Gợi ý TV
                            </button>
                            <button
                              type="button"
                              disabled={alreadyInSrs}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddSrsWord(
                                  {
                                    word: sent.clozeWord,
                                    phonetic: sent.phoneticFocus,
                                    partOfSpeech: 'vocab',
                                    definition: `Nghĩa TV: ${sent.clozeHintVi} — ${sent.clozeExplanationEn}`,
                                    vietnameseMeaning: sent.clozeHintVi,
                                    exampleSentence: sent.text,
                                    exampleTranslationVi: sent.translationVi,
                                    collocations: [],
                                  },
                                  activeShadowLesson.topic,
                                  'B2',
                                  'custom'
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 cursor-pointer"
                            >
                              {alreadyInSrs ? '✓ Đã lưu SRS' : '+ Lưu SRS'}
                            </button>
                          </div>
                        </div>

                        {renderClozeSentence(sent)}

                        {(showHint || showVi) && (
                          <div className="space-y-1 text-xs">
                            {showHint && (
                              <p className="text-amber-800 dark:text-amber-300 font-medium">
                                💡 <strong>Gợi ý từ cần điền:</strong> {sent.clozeHintVi}
                              </p>
                            )}
                            {showVi && (
                              <p className="text-zinc-500 dark:text-zinc-400">
                                🇻🇳 Dịch câu: “{sent.translationVi}”
                              </p>
                            )}
                          </div>
                        )}

                        {/* Bilingual Explanation when Checked */}
                        {isSub && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E6E2DA] dark:border-[#263042] text-xs">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042]">
                              <strong className="text-[#991B1B] dark:text-[#D97706]">
                                🇬🇧 EN Explanation:
                              </strong>{' '}
                              {sent.clozeExplanationEn}
                            </div>
                            <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                              <strong>🇻🇳 Chữa lỗi Tiếng Việt:</strong> {sent.clozeExplanationVi}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Check Cloze Answers Button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E6E2DA] dark:border-[#263042]">
                  <span className="text-xs text-zinc-500">
                    Điền từ vào chỗ trống rồi bấm nút bên phải để chấm &amp; xem giải thích song ngữ
                  </span>
                  <button
                    onClick={() =>
                      setClozeChecked((prev) => ({
                        ...prev,
                        [activeShadowLesson.id]: true,
                      }))
                    }
                    className="px-5 py-2.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg cursor-pointer shrink-0"
                  >
                    Chấm Điểm Điền Từ &amp; Chữa Lỗi Song Ngữ
                  </button>
                </div>
              </div>
            ) : (
              /* Mode 2: Synchronized Bilingual Transcript for Shadowing */
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                <p className="text-xs text-zinc-500">
                  Nhấn vào bất kỳ câu thoại nào bên dưới để tua video tới đúng giây đó, nghe phát âm chuẩn ở tốc độ {playbackSpeed}x và luyện nói nhại (Shadowing):
                </p>
                {activeShadowLesson.sentences.map((sent, idx) => {
                  const isCurrent = idx === activeSentenceIdx;
                  return (
                    <div
                      key={sent.id}
                      onClick={() => {
                        setActiveSentenceIdx(idx);
                        speakText(sent.text, playbackSpeed);
                      }}
                      className={`p-4 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                        isCurrent
                          ? 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#991B1B] dark:border-[#D97706]'
                          : 'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042] hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono-tabular text-zinc-500">
                        <span>
                          00:{String(sent.startTime).padStart(2, '0')} – 00:
                          {String(sent.endTime).padStart(2, '0')} · {sent.speaker}
                        </span>
                        {shadowRecordings[sent.id] && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            ✓ Đã thu âm
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[#18181B] dark:text-[#F3F0E6]">
                        {sent.text}
                      </p>
                      {showVi && sent.translationVi && (
                        <p className="text-xs text-emerald-800 dark:text-emerald-300">
                          🇻🇳 {sent.translationVi}
                        </p>
                      )}
                      <p className="text-xs font-mono-tabular text-[#991B1B] dark:text-[#D97706]">
                        {sent.phoneticFocus} · Từ trọng tâm: <strong>{sent.clozeWord}</strong>
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {langMode === 'vi' && sent.stressTipVi
                          ? sent.stressTipVi
                          : sent.stressTip}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal: User Add Custom YouTube Video + AI Cloze Generator */}
        {showAddVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-[#FAF8F5] dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 md:p-8 space-y-5 my-8">
              <div className="flex items-start justify-between gap-4 border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
                <div>
                  <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-semibold">
                    Tự Thêm Video YouTube Của Bạn · Tích Hợp AI Tạo Bài Nghe Điền Từ Tự Động
                  </p>
                  <h2 className="text-xl font-bold font-serif-editorial mt-1">
                    Thêm Video YouTube Mới (Anime, Hoạt Hình, Phim, TED...)
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddVideoModal(false)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomYoutubeVideo} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      Link YouTube hoặc YouTube Video ID:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: https://www.youtube.com/watch?v=3fumBcKC6RE"
                      value={newYtUrl}
                      onChange={(e) => setNewYtUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#0B0F17]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Thể loại Video:</label>
                    <select
                      value={newYtCategory}
                      onChange={(e) => setNewYtCategory(e.target.value as VideoCategory)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#0B0F17]"
                    >
                      <option value="Anime">✨ Anime</option>
                      <option value="Animation">🧸 Hoạt hình (Animation)</option>
                      <option value="Movies">🎬 Phim Điện ảnh (Movies)</option>
                      <option value="Academic">🎓 Học thuật (Academic)</option>
                      <option value="User Added">➕ Video Của Bạn</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Tiêu đề Tiếng Anh:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Spirited Away — Train Scene"
                      value={newYtTitle}
                      onChange={(e) => setNewYtTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#0B0F17]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Tiêu đề Tiếng Việt:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Vùng Đất Linh Hồn — Cảnh Tàu Điện"
                      value={newYtTitleVi}
                      onChange={(e) => setNewYtTitleVi(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#0B0F17]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Nhân vật / Diễn giả:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Chihiro & Haku"
                      value={newYtSpeaker}
                      onChange={(e) => setNewYtSpeaker(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#0B0F17]"
                    />
                  </div>
                </div>

                {/* AI Auto-Generator Box */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706]">
                      Tùy chọn: Dán lời thoại (Transcript) hoặc mô tả cảnh phim để AI tự tạo bài Điền Từ:
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerateVideoClozeWithAi}
                      disabled={isGeneratingClozeAi}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-50 rounded-lg cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isGeneratingClozeAi
                          ? 'AI Đang Tạo Phụ Đề & Bài Điền Từ...'
                          : '✨ Tạo Phụ Đề Song Ngữ & Bài Điền Từ Bằng AI'}
                      </span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Dán vài câu thoại tiếng Anh từ video YouTube hoặc nhập chủ đề cảnh phim (VD: Anime Naruto talking about perseverance and never giving up)..."
                    value={newYtRawScript}
                    onChange={(e) => setNewYtRawScript(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#151C28]"
                  />
                </div>

                {/* Editable Draft Sentences & Target Cloze Words */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">
                      Danh sách câu thoại &amp; Từ khuyết cần điền ({draftSentences.length} câu):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftSentences((prev) => [
                          ...prev,
                          {
                            id: `draft_${Date.now()}`,
                            startTime: prev.length * 8,
                            endTime: (prev.length + 1) * 8,
                            speaker: newYtSpeaker || 'Speaker',
                            text: 'True strength comes from protecting the people you cherish most.',
                            translationVi: 'Sức mạnh thực sự đến từ việc bảo vệ những người bạn trân quý nhất.',
                            phoneticFocus: '/ˈtʃerɪʃ/',
                            stressTip: 'Stress CHE-rish.',
                            stressTipVi: 'Nhấn trọng âm vào CHE-rish.',
                            clozeWord: 'cherish',
                            clozeHintVi: 'động từ (7 chữ cái): trân trọng, yêu quý',
                            clozeExplanationEn: '"Cherish" means to protect and care for someone lovingly.',
                            clozeExplanationVi: 'Chữa lỗi: "cherish" (v) nghĩa là trân quý, yêu thương gìn giữ.',
                          },
                        ])
                      }
                      className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706] hover:underline cursor-pointer"
                    >
                      + Thêm 1 câu thoại
                    </button>
                  </div>

                  {draftSentences.map((ds, idx) => (
                    <div
                      key={ds.id}
                      className="p-3 rounded-lg bg-white dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={ds.text}
                          onChange={(e) => {
                            const next = [...draftSentences];
                            next[idx] = { ...ds, text: e.target.value };
                            setDraftSentences(next);
                          }}
                          placeholder="Câu thoại Tiếng Anh..."
                          className="sm:col-span-3 px-2.5 py-1.5 text-xs rounded border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#151C28]"
                        />
                        <input
                          type="text"
                          value={ds.clozeWord}
                          onChange={(e) => {
                            const next = [...draftSentences];
                            next[idx] = { ...ds, clozeWord: e.target.value };
                            setDraftSentences(next);
                          }}
                          placeholder="Từ ẩn (clozeWord)"
                          className="px-2.5 py-1.5 text-xs font-mono-tabular font-bold text-[#991B1B] dark:text-[#D97706] rounded border border-[#991B1B] bg-[#FAF8F5] dark:bg-[#151C28]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={ds.translationVi}
                          onChange={(e) => {
                            const next = [...draftSentences];
                            next[idx] = { ...ds, translationVi: e.target.value };
                            setDraftSentences(next);
                          }}
                          placeholder="Dịch câu sang Tiếng Việt..."
                          className="px-2.5 py-1 text-xs rounded border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#151C28]"
                        />
                        <input
                          type="text"
                          value={ds.clozeHintVi}
                          onChange={(e) => {
                            const next = [...draftSentences];
                            next[idx] = { ...ds, clozeHintVi: e.target.value };
                            setDraftSentences(next);
                          }}
                          placeholder="Gợi ý nghĩa Tiếng Việt cho từ ẩn..."
                          className="px-2.5 py-1 text-xs rounded border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#151C28]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E6E2DA] dark:border-[#263042]">
                  <button
                    type="button"
                    onClick={() => setShowAddVideoModal(false)}
                    className="px-4 py-2 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg cursor-pointer"
                  >
                    Lưu Video Vào Phòng Luyện
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Module 7: Smart Study Reminder & Notification System
  const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const nowIso = new Date().toISOString();
  const dueSrsCount = srsCards.filter((c) => c.nextReviewAt <= nowIso).length;

  const toggleDay = (dayIdx: number) => {
    const exists = profile.reminderDays.includes(dayIdx);
    const nextDays = exists
      ? profile.reminderDays.filter((d) => d !== dayIdx)
      : [...profile.reminderDays, dayIdx].sort();
    onUpdateReminders({ reminderDays: nextDays });
  };

  const handleEnableBrowserNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      onTriggerNotificationToast(
        'Đã Bật Nhắc Học Trong Ứng Dụng',
        `Bạn hiện có ${dueSrsCount} thẻ từ vựng SRS cần ôn tập hôm nay.`
      );
      onUpdateReminders({ browserPushEnabled: true });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onUpdateReminders({ browserPushEnabled: true });
        new Notification('ScholarBand Study Reminder Enabled', {
          body: `Scheduled for ${profile.reminderTime}. You currently have ${dueSrsCount} due SRS flashcards.`,
        });
        onTriggerNotificationToast(
          'Đã Bật Thông Báo Đẩy Trình Duyệt',
          `Hệ thống sẽ nhắc bạn học lúc ${profile.reminderTime}.`
        );
      } else {
        onTriggerNotificationToast(
          'Đã Bật Chuông Thông Báo Trong Web',
          'ScholarBand sẽ nhắc lịch học qua biểu tượng chuông thông báo trên thanh công cụ.'
        );
      }
    } catch {
      onTriggerNotificationToast(
        'Đã Lên Lịch Nhắc Học Hàng Ngày',
        `Giờ học cố định: ${profile.reminderTime}.`
      );
    }
  };

  const handleSendTestAlert = () => {
    const title = `ScholarBand · Chuỗi ${profile.studyStreak} Ngày Học Liên Tiếp`;
    const body = `Đến giờ luyện Band ${profile.currentBandLevel}! Bạn có ${dueSrsCount} thẻ từ vựng SRS cần ôn tập.`;
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, { body });
    }
    onTriggerNotificationToast(title, body);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E6E2DA] dark:border-[#263042] pb-5 space-y-1.5">
        <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
          Module 07 · Daily Study Scheduler, Push Alerts &amp; Standalone PWA Setup
        </p>
        <h1 className="text-2xl md:text-3xl font-bold font-serif-editorial">
          {langMode === 'vi'
            ? 'Hệ Thống Nhắc Lịch Học Thông Minh & Cài Đặt Ứng Dụng Offline'
            : 'Smart Study Reminder & Notification Center'}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
          {langMode === 'en'
            ? 'Configure your preferred daily study time and active days of the week. Receive browser push notifications and in-app alerts for due SRS flashcards and study streak preservation.'
            : 'Thiết lập khung giờ tự học cố định và các ngày học trong tuần. Nhận thông báo đẩy nhắc ôn thẻ từ vựng SRS đến hạn và duy trì chuỗi ngày học liên tiếp (Study Streak).'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Schedule Configuration */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif-editorial">
                {langMode === 'en' ? 'Daily Study Schedule' : 'Lịch Học Cố Định Hàng Ngày'}
              </h2>
              <p className="text-xs text-zinc-500">
                Đồng bộ tự động lên hồ sơ học tập của bạn
              </p>
            </div>
            <button
              onClick={() =>
                onUpdateReminders({ reminderEnabled: !profile.reminderEnabled })
              }
              className={`px-4 py-2 text-xs font-medium rounded-lg cursor-pointer ${
                profile.reminderEnabled
                  ? 'bg-emerald-700 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {profile.reminderEnabled ? 'Nhắc lịch: ĐANG BẬT' : 'Nhắc lịch: TẠM TẮT'}
            </button>
          </div>

          {/* Time Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label htmlFor="study-time-input" className="text-sm font-semibold block">
                {langMode === 'en'
                  ? 'Preferred Daily Study Time (24h)'
                  : 'Giờ Học Hàng Ngày (Định dạng 24h)'}
              </label>
              <p className="text-xs text-zinc-500">
                Hệ thống tự động kiểm tra và gửi thông báo khi đến giờ học.
              </p>
            </div>
            <input
              id="study-time-input"
              type="time"
              value={profile.reminderTime}
              onChange={(e) => onUpdateReminders({ reminderTime: e.target.value })}
              className="px-4 py-2 text-sm font-mono-tabular font-bold rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
            />
          </div>

          {/* Active Days of the Week */}
          <div className="space-y-2">
            <label className="text-sm font-semibold block">
              {langMode === 'en' ? 'Active Study Days' : 'Các Ngày Học Trong Tuần'}
            </label>
            <div className="grid grid-cols-7 gap-2">
              {dayLabels.map((label, idx) => {
                const active = profile.reminderDays.includes(idx);
                return (
                  <button
                    key={label}
                    onClick={() => toggleDay(idx)}
                    className={`py-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#991B1B] text-white border-[#991B1B] dark:bg-[#D97706] dark:border-[#D97706]'
                        : 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#E6E2DA] dark:border-[#263042] text-zinc-500'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Push Notification Permission & Test Trigger */}
          <div className="pt-4 border-t border-[#E6E2DA] dark:border-[#263042] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleEnableBrowserNotifications}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border border-[#18181B] dark:border-[#F3F0E6] rounded-lg cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>
                {profile.browserPushEnabled
                  ? 'Đã Cấp Quyền Thông Báo Trình Duyệt'
                  : 'Bật Thông Báo Đẩy Trình Duyệt'}
              </span>
            </button>

            <button
              onClick={handleSendTestAlert}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Gửi Thử Thông Báo Nhắc Học Ngay</span>
            </button>
          </div>
        </div>

        {/* Right: Live Due Queue Summary & PWA Standalone App Card */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-3">
            <h3 className="text-base font-bold font-serif-editorial">
              Tóm Tắt Nhiệm Vụ Cần Hoàn Thành Hôm Nay
            </h3>
            <div className="p-3.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-1">
              <p className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706]">
                Thẻ Từ Vựng SRS Đến Hạn: {dueSrsCount} thẻ
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Chuỗi ngày học hiện tại: <strong>{profile.studyStreak} ngày liên tiếp</strong> · Khung giờ nhắc: <strong>{profile.reminderTime}</strong>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-3">
            <h3 className="text-base font-bold font-serif-editorial">
              Cài Đặt Ứng Dụng Độc Lập &amp; Học Offline (PWA)
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Cài đặt ScholarBand lên màn hình chính điện thoại iOS/Android hoặc máy tính để ôn tập bộ thẻ từ vựng SRS song ngữ và bài giảng ngữ pháp ngay cả khi mất kết nối mạng.
            </p>
            <div className="pt-1">
              <PWAInstallButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
