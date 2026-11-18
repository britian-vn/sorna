import React, { useState } from 'react';
import {
  Volume2,
  Plus,
  Check,
  RotateCcw,
  Download,
  CheckCircle2,
  Trash2,
  BookOpen,
  Languages,
  Search,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Award,
  Layers,
} from 'lucide-react';
import {
  CefrLevel,
  IeltsTopic,
  LanguageMode,
  MasteryLevel,
  SrsCardData,
  SrsRecallRating,
  VocabGrammarLesson,
  VocabWordItem,
} from '../types';
import {
  VOCAB_GRAMMAR_LESSONS,
  speakText,
  getCardBilingualInfo,
} from '../data/curriculum';
import {
  CEFR_VOCAB_BENCHMARKS,
  queryMegaLexicon,
  generate20QuestionQuiz,
} from '../data/megaCatalog';

type MegaVocabEntry = VocabWordItem & {
  id: string;
  cefrLevel: CefrLevel;
  topic: IeltsTopic;
};

interface VocabAndSrsProps {
  mode: 'vocab-grammar' | 'srs-deck';
  langMode: LanguageMode;
  srsCards: SrsCardData[];
  completedLessons: string[];
  offlinePackSyncedAt?: string;
  onAddSrsWord: (
    wordItem: VocabWordItem,
    topic: string,
    cefrLevel: CefrLevel,
    source: 'vocab-hub' | 'news-reader' | 'custom'
  ) => void;
  onReviewSrsCard: (card: SrsCardData, rating: SrsRecallRating) => void;
  onDeleteSrsCard: (cardId: string) => void;
  onCompleteLesson: (lessonId: string) => void;
  onSyncOfflinePack: () => void;
}

export const VocabAndSrsModules: React.FC<VocabAndSrsProps> = ({
  mode,
  langMode,
  srsCards,
  completedLessons,
  offlinePackSyncedAt,
  onAddSrsWord,
  onReviewSrsCard,
  onDeleteSrsCard,
  onCompleteLesson,
  onSyncOfflinePack,
}) => {
  const showVi = langMode === 'bilingual' || langMode === 'vi';
  const showEn = langMode === 'bilingual' || langMode === 'en';

  // Module 2 Sub-Tab: 'lessons-quiz' (Bài Giảng & 20 Câu Bài Tập) vs 'mega-lexicon' (Kho Đại Từ Điển 16.750 Từ A1-C1)
  const [hubSubTab, setHubSubTab] = useState<'lessons-quiz' | 'mega-lexicon'>('lessons-quiz');

  // Lesson 3-Step Scientific Workflow: 'theory' | 'words' | 'quiz' | 'all'
  const [lessonStepTab, setLessonStepTab] = useState<'theory' | 'words' | 'quiz' | 'all'>('all');

  // 20-Question Quiz Ergonomic Controls
  const [quizDisplayMode, setQuizDisplayMode] = useState<'single' | 'list'>('single');
  const [focusedQuestionIdx, setFocusedQuestionIdx] = useState<number>(0);
  const [quizResultFilter, setQuizResultFilter] = useState<'all' | 'wrong'>('all');

  // Module 2 State: Vocabulary & Grammar Hub
  const [selectedCefr, setSelectedCefr] = useState<'ALL' | CefrLevel>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<'ALL' | IeltsTopic>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Vocabulary' | 'Grammar'>('ALL');
  const [activeLesson, setActiveLesson] = useState<VocabGrammarLesson>(VOCAB_GRAMMAR_LESSONS[0]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [quizVariantSeeds, setQuizVariantSeeds] = useState<Record<string, number>>({});

  // Mega Lexicon (16,750 Words A1-C1) State
  const [lexiconSearch, setLexiconSearch] = useState('');
  const [lexiconPage, setLexiconPage] = useState(1);
  const [lexiconViewLayout, setLexiconViewLayout] = useState<'cards' | 'table'>('cards');
  const [aiGeneratedWords, setAiGeneratedWords] = useState<MegaVocabEntry[]>([]);
  const [isGeneratingAiVocab, setIsGeneratingAiVocab] = useState(false);

  // Module 3 State: SRS Flashcard Arena
  const [masteryFilter, setMasteryFilter] = useState<'DUE' | 'ALL' | MasteryLevel>('DUE');
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Custom Card Form State
  const [customWord, setCustomWord] = useState('');
  const [customPhonetic, setCustomPhonetic] = useState('');
  const [customPos, setCustomPos] = useState('noun');
  const [customViMeaning, setCustomViMeaning] = useState('');
  const [customDef, setCustomDef] = useState('');
  const [customExample, setCustomExample] = useState('');
  const [customCefr, setCustomCefr] = useState<CefrLevel>('B2');
  const [customTopic, setCustomTopic] = useState<IeltsTopic>('Education');

  if (mode === 'vocab-grammar') {
    const filteredLessons = VOCAB_GRAMMAR_LESSONS.filter((lesson) => {
      if (selectedCefr !== 'ALL' && lesson.cefrLevel !== selectedCefr) return false;
      if (selectedTopic !== 'ALL' && lesson.topic !== selectedTopic) return false;
      if (selectedCategory !== 'ALL' && lesson.category !== selectedCategory) return false;
      return true;
    });

    const currentLesson =
      filteredLessons.find((l) => l.id === activeLesson.id) ||
      filteredLessons[0] ||
      VOCAB_GRAMMAR_LESSONS[0];

    const isLessonDone = completedLessons.includes(currentLesson.id);
    const currentVariantSeed = quizVariantSeeds[currentLesson.id] || 0;
    const twentyQuestions = generate20QuestionQuiz(currentLesson, currentVariantSeed);
    const isCurrentQuizSubmitted = Boolean(
      quizSubmitted[`${currentLesson.id}_v${currentVariantSeed}`]
    );

    const answeredCount = twentyQuestions.filter((q) => quizAnswers[q.id] !== undefined).length;
    const correctCount = twentyQuestions.filter(
      (q) => quizAnswers[q.id] === q.correctIndex
    ).length;
    const scorePercentage = Math.round((correctCount / twentyQuestions.length) * 100);
    const safeQuestionIdx = Math.min(Math.max(0, focusedQuestionIdx), twentyQuestions.length - 1);
    const activeSingleQuestion = twentyQuestions[safeQuestionIdx];

    const handleRefresh20Questions = () => {
      const nextSeed = currentVariantSeed + 1;
      setQuizVariantSeeds((prev) => ({ ...prev, [currentLesson.id]: nextSeed }));
      setFocusedQuestionIdx(0);
      setQuizResultFilter('all');
    };

    // Query the 16,750-word CEFR Mega Lexicon
    const PAGE_SIZE = 24;
    const lexiconRaw = queryMegaLexicon({
      cefrLevel: selectedCefr,
      topic: selectedTopic,
      searchQuery: lexiconSearch,
      page: lexiconPage,
      pageSize: PAGE_SIZE,
    });
    const totalLexiconPages = Math.max(1, Math.ceil(lexiconRaw.filteredCount / PAGE_SIZE));
    const currentLexiconPage = Math.min(Math.max(1, lexiconPage), totalLexiconPages);
    const lexiconResult = {
      items: lexiconRaw.items.map((item) => ({
        ...item,
        id: `${item.cefrLevel}_${item.word}_${item.entryIndex}`,
      })),
      totalCount: lexiconRaw.filteredCount,
      currentPage: currentLexiconPage,
      totalPages: totalLexiconPages,
    };

    const filteredAiWords = aiGeneratedWords.filter((w) => {
      if (selectedCefr !== 'ALL' && w.cefrLevel !== selectedCefr) return false;
      if (selectedTopic !== 'ALL' && w.topic !== selectedTopic) return false;
      if (lexiconSearch.trim()) {
        const q = lexiconSearch.trim().toLowerCase();
        return (
          w.word.toLowerCase().includes(q) ||
          (w.vietnameseMeaning || '').toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q)
        );
      }
      return true;
    });
    const combinedPageWords =
      lexiconPage === 1 ? [...filteredAiWords, ...lexiconResult.items] : lexiconResult.items;

    const handleGenerateAiVocabBatch = async () => {
      setIsGeneratingAiVocab(true);
      try {
        const res = await fetch('/api/ai/generate-vocab-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cefrLevel: selectedCefr === 'ALL' ? 'B2' : selectedCefr,
            topic: selectedTopic === 'ALL' ? 'Education' : selectedTopic,
            count: 8,
          }),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.words)) {
          const targetCefr: CefrLevel = selectedCefr === 'ALL' ? 'B2' : selectedCefr;
          const targetTopic: IeltsTopic = selectedTopic === 'ALL' ? 'Education' : selectedTopic;
          const mapped: MegaVocabEntry[] = data.words.map(
            (
              w: {
                word: string;
                phonetic: string;
                partOfSpeech: string;
                vietnameseMeaning: string;
                definition: string;
                exampleSentence: string;
                exampleTranslationVi: string;
                collocations?: string[];
              },
              idx: number
            ) => ({
              id: `ai_vocab_${Date.now()}_${idx}`,
              word: w.word,
              phonetic: w.phonetic,
              partOfSpeech: w.partOfSpeech,
              vietnameseMeaning: w.vietnameseMeaning,
              definition: w.definition,
              exampleSentence: w.exampleSentence,
              exampleTranslationVi: w.exampleTranslationVi,
              collocations: Array.isArray(w.collocations) ? w.collocations : [],
              cefrLevel: targetCefr,
              topic: targetTopic,
            })
          );
          setAiGeneratedWords((prev) => [...mapped, ...prev]);
          setLexiconPage(1);
        }
      } catch {
        // fallback handled gracefully
      } finally {
        setIsGeneratingAiVocab(false);
      }
    };

    const handleSaveEntirePageToSrs = () => {
      combinedPageWords.forEach((w) => {
        const alreadySaved = srsCards.some(
          (c) => c.word.toLowerCase() === w.word.toLowerCase()
        );
        if (!alreadySaved) {
          onAddSrsWord(w, w.topic, w.cefrLevel, 'vocab-hub');
        }
      });
    };

    const renderSingleQuizQuestionCard = (q: (typeof twentyQuestions)[0], idx: number) => {
      const chosen = quizAnswers[q.id];
      return (
        <div
          key={q.id}
          className="p-5 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-tabular text-zinc-500">
              <span>
                Câu {idx + 1} / 20 · Đề #{currentVariantSeed + 1} · CEFR {currentLesson.cefrLevel}
              </span>
              {isCurrentQuizSubmitted && (
                <span
                  className={
                    chosen === q.correctIndex
                      ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'text-red-600 dark:text-red-400 font-bold'
                  }
                >
                  {chosen === q.correctIndex ? '✓ CHÍNH XÁC' : '✗ SAI / CẦN CHỮA LỖI'}
                </span>
              )}
            </div>
            <p className="text-base font-semibold text-[#18181B] dark:text-[#F3F0E6] leading-snug">
              {idx + 1}. {q.question}
            </p>
            {showVi && q.questionVi && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">🇻🇳 {q.questionVi}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.options.map((opt, oIdx) => {
              const isSelected = chosen === oIdx;
              const isCorrect = q.correctIndex === oIdx;
              let styleClass =
                'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042] hover:border-zinc-400';
              if (isCurrentQuizSubmitted) {
                if (isCorrect)
                  styleClass =
                    'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-semibold';
                else if (isSelected)
                  styleClass =
                    'bg-red-50 dark:bg-red-950/60 border-red-600 text-red-900 dark:text-red-200';
              } else if (isSelected) {
                styleClass =
                  'bg-[#991B1B] text-white border-[#991B1B] dark:bg-[#D97706] dark:text-[#0B0F17] font-semibold';
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => {
                    setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                  }}
                  className={`text-left px-4 py-3 rounded-lg text-xs border transition-colors cursor-pointer ${styleClass}`}
                >
                  <span className="font-mono-tabular mr-1.5 opacity-75">
                    {String.fromCharCode(65 + oIdx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Side-by-Side Bilingual Error Correction */}
          {isCurrentQuizSubmitted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#E6E2DA] dark:border-[#263042]">
              <div className="p-3.5 rounded-lg bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] space-y-1">
                <p className="text-[11px] font-mono-tabular font-semibold text-[#991B1B] dark:text-[#D97706]">
                  🇬🇧 English Correction &amp; Rule:
                </p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {q.explanation}
                </p>
              </div>
              {q.explanationVi && (
                <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-1">
                  <p className="text-[11px] font-mono-tabular font-semibold text-emerald-800 dark:text-emerald-300">
                    🇻🇳 Giải Thích &amp; Chữa Lỗi Tiếng Việt:
                  </p>
                  <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                    {q.explanationVi}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-5">
        {/* Header + Sub-View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
          <div className="space-y-1">
            <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
              Học phần 02 · Kho Đại Từ Điển CEFR (16.750+ Từ A1–C1) &amp; Phòng Luyện Ngữ Pháp 20 Câu Đổi Đề Mới
            </p>
            <h1 className="text-2xl md:text-3xl font-bold font-serif-editorial">
              {hubSubTab === 'lessons-quiz'
                ? 'Bài Giảng Ngữ Pháp & Đề Thi 20 Câu Đa Phương Án'
                : 'Kho Đại Từ Điển Chuẩn CEFR A1 – C1 (16.750+ Từ Vựng)'}
            </h1>
          </div>

          {/* Primary Switcher: 1. Bài Giảng & Đề 20 Câu vs 2. Kho Đại Từ Điển 16.750 Từ */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#151C28] rounded-xl border border-[#E6E2DA] dark:border-[#263042] shrink-0">
            <button
              onClick={() => setHubSubTab('lessons-quiz')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                hubSubTab === 'lessons-quiz'
                  ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17]'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-[#FAF8F5] dark:hover:bg-[#0B0F17]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Bài Giảng &amp; Làm Đề 20 Câu</span>
            </button>
            <button
              onClick={() => setHubSubTab('mega-lexicon')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                hubSubTab === 'mega-lexicon'
                  ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17]'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-[#FAF8F5] dark:hover:bg-[#0B0F17]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Kho Từ Điển 16.750 Từ (A1–C1)</span>
            </button>
          </div>
        </div>

        {/* Scientific Compact 5-Tier CEFR Benchmark Selector Bar (Click any tier to filter) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => {
              setSelectedCefr('ALL');
              setLexiconPage(1);
            }}
            className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
              selectedCefr === 'ALL'
                ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17] border-transparent'
                : 'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042] hover:border-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono-tabular opacity-80">
              <span>TẤT CẢ CẤP ĐỘ</span>
              <span>A1–C1</span>
            </div>
            <p className="text-sm font-bold font-mono-tabular mt-0.5">16.750+ từ</p>
            <p className="text-[11px] opacity-75 truncate">Toàn bộ kho từ &amp; bài học</p>
          </button>

          {CEFR_VOCAB_BENCHMARKS.map((b) => {
            const isSelected = selectedCefr === b.level;
            return (
              <button
                key={b.level}
                onClick={() => {
                  setSelectedCefr(isSelected ? 'ALL' : b.level);
                  setLexiconPage(1);
                }}
                className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17] border-transparent'
                    : 'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042] hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono-tabular">
                  <span className="font-bold">CEFR {b.level}</span>
                  <span className="opacity-80">{b.bandEquivalent}</span>
                </div>
                <p className="text-sm font-bold font-mono-tabular mt-0.5">
                  {b.targetRangeLabel}
                </p>
                <p className="text-[11px] opacity-80 truncate">
                  Đã nạp: {b.targetCount.toLocaleString()} từ
                </p>
              </button>
            );
          })}
        </div>

        {/* SUB-VIEW B: KHO ĐẠI TỪ ĐIỂN CEFR 16.750 TỪ (A1: 500 -> C1: 8.500) */}
        {hubSubTab === 'mega-lexicon' ? (
          <div className="space-y-4">
            {/* Unified Search, Topic Filter, View Mode Toggle & Batch Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lexiconSearch}
                    onChange={(e) => {
                      setLexiconSearch(e.target.value);
                      setLexiconPage(1);
                    }}
                    placeholder="Tra cứu nhanh trong 16.750 từ (Tiếng Anh hoặc Tiếng Việt)..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                  />
                </div>

                <select
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value as 'ALL' | IeltsTopic);
                    setLexiconPage(1);
                  }}
                  className="px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                >
                  <option value="ALL">Tất cả Chủ đề IELTS</option>
                  <option value="Education">Education (Giáo dục)</option>
                  <option value="Environment">Environment (Môi trường)</option>
                  <option value="Technology">Technology (Công nghệ)</option>
                  <option value="Health">Health (Y tế &amp; Sức khỏe)</option>
                  <option value="Society">Society (Xã hội)</option>
                  <option value="Economy">Economy (Kinh tế)</option>
                </select>

                {/* View Mode Toggle: Card Grid vs Scientific Compact Table */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                  <button
                    onClick={() => setLexiconViewLayout('cards')}
                    className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                      lexiconViewLayout === 'cards'
                        ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Dạng Thẻ
                  </button>
                  <button
                    onClick={() => setLexiconViewLayout('table')}
                    className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                      lexiconViewLayout === 'table'
                        ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Dạng Bảng Khoa Học
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleGenerateAiVocabBatch}
                  disabled={isGeneratingAiVocab}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isGeneratingAiVocab ? 'Đang tạo...' : '✨ AI Thêm 8 Từ Mới'}
                  </span>
                </button>
                <button
                  onClick={handleSaveEntirePageToSrs}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17] rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Lưu Trang Này Vào SRS</span>
                </button>
              </div>
            </div>

            {/* Lexicon Display: Card Grid vs Scientific Table */}
            {lexiconViewLayout === 'table' ? (
              <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] text-zinc-500 font-mono-tabular">
                        <th className="py-3 px-4">Từ Vựng &amp; IPA</th>
                        <th className="py-3 px-3">Cấp độ</th>
                        <th className="py-3 px-4">Nghĩa Tiếng Việt</th>
                        <th className="py-3 px-4">Ví Dụ Học Thuật Song Ngữ</th>
                        <th className="py-3 px-4 text-right">Thẻ SRS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E2DA] dark:divide-[#263042]">
                      {combinedPageWords.map((w) => {
                        const alreadySaved = srsCards.some(
                          (c) => c.word.toLowerCase() === w.word.toLowerCase()
                        );
                        return (
                          <tr
                            key={w.id}
                            className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#0B0F17]/40"
                          >
                            <td className="py-3 px-4 align-top">
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-serif-editorial text-sm text-[#18181B] dark:text-[#F3F0E6]">
                                  {w.word}
                                </span>
                                <button
                                  onClick={() => speakText(w.word)}
                                  className="p-1 rounded border border-[#E6E2DA] dark:border-[#263042] hover:border-[#991B1B] cursor-pointer"
                                >
                                  <Volume2 className="w-3 h-3 text-[#991B1B] dark:text-[#D97706]" />
                                </button>
                              </div>
                              <span className="text-[11px] font-mono-tabular text-zinc-500">
                                {w.phonetic} · {w.partOfSpeech}
                              </span>
                            </td>
                            <td className="py-3 px-3 align-top font-mono-tabular">
                              <span className="font-semibold text-[#991B1B] dark:text-[#D97706]">
                                {w.cefrLevel}
                              </span>
                              <div className="text-[11px] text-zinc-400">{w.topic}</div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                                🇻🇳 {w.vietnameseMeaning}
                              </p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">{w.definition}</p>
                            </td>
                            <td className="py-3 px-4 align-top max-w-md">
                              <p className="italic text-zinc-700 dark:text-zinc-300">
                                “{w.exampleSentence}”
                              </p>
                              {w.exampleTranslationVi && (
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                                  🇻🇳 “{w.exampleTranslationVi}”
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 align-top text-right">
                              <button
                                onClick={() =>
                                  onAddSrsWord(w, w.topic, w.cefrLevel, 'vocab-hub')
                                }
                                disabled={alreadySaved}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md cursor-pointer ${
                                  alreadySaved
                                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-[#991B1B] text-white hover:bg-[#7F1D1D] dark:bg-[#D97706] dark:text-[#0B0F17]'
                                }`}
                              >
                                {alreadySaved ? '✓ Đã lưu' : '+ Lưu SRS'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Paginated 24-Word Card Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {combinedPageWords.map((w) => {
                  const alreadySaved = srsCards.some(
                    (c) => c.word.toLowerCase() === w.word.toLowerCase()
                  );
                  return (
                    <div
                      key={w.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] flex flex-col justify-between space-y-2.5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold font-serif-editorial text-[#18181B] dark:text-[#F3F0E6]">
                                {w.word}
                              </span>
                              <button
                                onClick={() => speakText(w.word)}
                                className="p-1 rounded border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] hover:border-[#991B1B] cursor-pointer"
                                title="Nghe phát âm"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
                              </button>
                            </div>
                            <p className="text-[11px] font-mono-tabular text-zinc-500">
                              {w.phonetic} · <em>{w.partOfSpeech}</em> · CEFR {w.cefrLevel} ·{' '}
                              {w.topic}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              onAddSrsWord(w, w.topic, w.cefrLevel, 'vocab-hub')
                            }
                            disabled={alreadySaved}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md shrink-0 cursor-pointer ${
                              alreadySaved
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-[#991B1B] text-white hover:bg-[#7F1D1D] dark:bg-[#D97706] dark:text-[#0B0F17]'
                            }`}
                          >
                            {alreadySaved ? '✓ Trong SRS' : '+ Lưu SRS'}
                          </button>
                        </div>

                        {w.vietnameseMeaning && (
                          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            🇻🇳 {w.vietnameseMeaning}
                          </p>
                        )}

                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          {w.definition}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E6E2DA] dark:border-[#263042] space-y-0.5 text-[11px]">
                        <p className="text-zinc-600 dark:text-zinc-400 italic">
                          “{w.exampleSentence}”
                        </p>
                        {w.exampleTranslationVi && (
                          <p className="text-emerald-800 dark:text-emerald-400">
                            🇻🇳 “{w.exampleTranslationVi}”
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Footer with Quick Page Jumps */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-4">
              <span className="text-xs font-mono-tabular text-zinc-500">
                Trang {lexiconResult.currentPage} / {lexiconResult.totalPages} · Tổng số:{' '}
                <strong>{lexiconResult.totalCount.toLocaleString()} từ vựng</strong>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setLexiconPage(1)}
                  disabled={lexiconResult.currentPage <= 1}
                  className="px-2.5 py-1.5 text-xs font-mono-tabular rounded-lg border border-[#E6E2DA] dark:border-[#263042] disabled:opacity-40 cursor-pointer"
                >
                  Đầu
                </button>
                <button
                  onClick={() => setLexiconPage((p) => Math.max(1, p - 1))}
                  disabled={lexiconResult.currentPage <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E6E2DA] dark:border-[#263042] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Trước
                </button>
                <span className="px-3 py-1.5 text-xs font-mono-tabular font-bold rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                  {lexiconResult.currentPage} / {lexiconResult.totalPages}
                </span>
                <button
                  onClick={() =>
                    setLexiconPage((p) => Math.min(lexiconResult.totalPages, p + 1))
                  }
                  disabled={lexiconResult.currentPage >= lexiconResult.totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E6E2DA] dark:border-[#263042] disabled:opacity-40 cursor-pointer"
                >
                  Tiếp <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLexiconPage(lexiconResult.totalPages)}
                  disabled={lexiconResult.currentPage >= lexiconResult.totalPages}
                  className="px-2.5 py-1.5 text-xs font-mono-tabular rounded-lg border border-[#E6E2DA] dark:border-[#263042] disabled:opacity-40 cursor-pointer"
                >
                  Cuối
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* SUB-VIEW A: Scientific Two-Zone Layout: Lesson Selector on Left (4 cols) + Active Lesson & 3-Step Workspace on Right (8 cols) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Compact Filter + Lesson Selector */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">
                    Chuyên Đề Bài Học ({filteredLessons.length})
                  </span>
                  <button
                    onClick={() => setHubSubTab('mega-lexicon')}
                    className="text-[#991B1B] dark:text-[#D97706] font-semibold hover:underline cursor-pointer"
                  >
                    Mở Kho 16.750 Từ →
                  </button>
                </div>

                {/* Category & Topic Filters right above the lesson list */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as 'ALL' | 'Vocabulary' | 'Grammar')
                    }
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                  >
                    <option value="ALL">Từ vựng &amp; Ngữ pháp</option>
                    <option value="Grammar">Chuyên đề Ngữ pháp</option>
                    <option value="Vocabulary">Chuyên đề Từ vựng</option>
                  </select>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value as 'ALL' | IeltsTopic)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                  >
                    <option value="ALL">Tất cả Chủ đề</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Technology">Technology</option>
                    <option value="Health">Health</option>
                    <option value="Society">Society</option>
                    <option value="Economy">Economy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                {filteredLessons.map((lesson) => {
                  const selected = lesson.id === currentLesson.id;
                  const done = completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(lesson);
                        setFocusedQuestionIdx(0);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                        selected
                          ? 'bg-white dark:bg-[#151C28] border-[#991B1B] dark:border-[#D97706]'
                          : 'bg-white/70 dark:bg-[#151C28]/60 border-[#E6E2DA] dark:border-[#263042] hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="font-mono-tabular font-semibold text-[#991B1B] dark:text-[#D97706]">
                          CEFR {lesson.cefrLevel} · {lesson.category} · 20 Câu
                        </span>
                        {done && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      {showEn && (
                        <h3 className="text-sm font-bold font-serif-editorial">
                          {lesson.title}
                        </h3>
                      )}
                      {showVi && lesson.titleVi && (
                        <p className="text-xs font-medium text-[#991B1B] dark:text-[#D97706]">
                          🇻🇳 {lesson.titleVi}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Lesson Stage with Scientific 3-Step Sub-Tabs */}
            <div className="lg:col-span-8 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-5">
              {/* Lesson Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
                <div>
                  <p className="text-xs text-zinc-500 font-mono-tabular">
                    CEFR {currentLesson.cefrLevel} · {currentLesson.category} · Topic:{' '}
                    {currentLesson.topic} · Đề #{currentVariantSeed + 1} (20 câu)
                  </p>
                  {showEn && (
                    <h2 className="text-xl md:text-2xl font-bold font-serif-editorial mt-0.5">
                      {currentLesson.title}
                    </h2>
                  )}
                  {showVi && currentLesson.titleVi && (
                    <p className="text-sm font-semibold text-[#991B1B] dark:text-[#D97706]">
                      🇻🇳 {currentLesson.titleVi}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onCompleteLesson(currentLesson.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    isLessonDone
                      ? 'bg-emerald-700 text-white'
                      : 'border border-[#18181B] dark:border-[#F3F0E6] text-[#18181B] dark:text-[#F3F0E6]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isLessonDone ? 'Đã Hoàn Thành' : 'Đánh Dấu Hoàn Thành'}</span>
                </button>
              </div>

              {/* Scientific 3-Step Lesson Navigation Bar (Reduces scrolling & keeps study organized) */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      { id: 'all', label: 'Xem Toàn Bộ Bài' },
                      { id: 'theory', label: 'Bước 1: Lý Thuyết & Công Thức' },
                      {
                        id: 'words',
                        label: `Bước 2: Từ Vựng Trọng Tâm (${currentLesson.words.length})`,
                      },
                      {
                        id: 'quiz',
                        label: `Bước 3: Làm Đề 20 Câu (${answeredCount}/20)`,
                      },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setLessonStepTab(st.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        lessonStepTab === st.id
                          ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 1: Bilingual Grammar & Lexical Theory Callout */}
              {(lessonStepTab === 'all' || lessonStepTab === 'theory') && (
                <div className="p-5 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#991B1B] dark:text-[#D97706]">
                      <BookOpen className="w-4 h-4" />
                      <span>Bước 1 · Lý Thuyết Ngữ Pháp &amp; Công Thức Học Thuật Song Ngữ</span>
                    </div>
                    {lessonStepTab === 'theory' && (
                      <button
                        onClick={() => setLessonStepTab('words')}
                        className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706] hover:underline cursor-pointer"
                      >
                        Sang Bước 2: Từ Vựng →
                      </button>
                    )}
                  </div>

                  {showEn && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-mono-tabular text-zinc-500">
                        🇬🇧 English Principle &amp; Formula:
                      </p>
                      <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {currentLesson.grammarRuleOrNote}
                      </p>
                    </div>
                  )}

                  {showVi && currentLesson.grammarTheoryVi && (
                    <div className="pt-2 border-t border-[#E6E2DA] dark:border-[#263042] space-y-1">
                      <p className="text-[11px] font-mono-tabular text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Languages className="w-3.5 h-3.5" />
                        <span>🇻🇳 Giảng Giải Lý Thuyết &amp; Công Thức Bằng Tiếng Việt:</span>
                      </p>
                      <p className="text-sm text-[#18181B] dark:text-[#F3F0E6] leading-relaxed whitespace-pre-line">
                        {currentLesson.grammarTheoryVi}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Headwords & Collocations with Vietnamese Translations */}
              {(lessonStepTab === 'all' || lessonStepTab === 'words') && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold font-serif-editorial">
                      Bước 2 · Từ Vựng Trọng Tâm Trong Bài
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedCefr(currentLesson.cefrLevel);
                          setHubSubTab('mega-lexicon');
                        }}
                        className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706] hover:underline cursor-pointer"
                      >
                        Mở toàn bộ kho từ CEFR {currentLesson.cefrLevel} →
                      </button>
                      {lessonStepTab === 'words' && (
                        <button
                          onClick={() => setLessonStepTab('quiz')}
                          className="px-3 py-1 text-xs font-semibold text-white bg-[#991B1B] rounded-lg cursor-pointer"
                        >
                          Sang Bước 3: Làm Đề 20 Câu →
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentLesson.words.map((w) => {
                      const alreadySaved = srsCards.some(
                        (c) => c.word.toLowerCase() === w.word.toLowerCase()
                      );
                      return (
                        <div
                          key={w.word}
                          className="p-4 rounded-xl border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5]/70 dark:bg-[#0B0F17] flex flex-col justify-between space-y-2.5"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-bold font-serif-editorial">
                                    {w.word}
                                  </span>
                                  <button
                                    onClick={() =>
                                      speakText(`${w.word}. ${w.exampleSentence}`)
                                    }
                                    className="p-1 rounded bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] hover:border-[#991B1B] cursor-pointer"
                                    title="Nghe phát âm"
                                  >
                                    <Volume2 className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
                                  </button>
                                </div>
                                <p className="text-[11px] font-mono-tabular text-zinc-500">
                                  {w.phonetic} · <em>{w.partOfSpeech}</em>
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  onAddSrsWord(
                                    w,
                                    currentLesson.topic,
                                    currentLesson.cefrLevel,
                                    'vocab-hub'
                                  )
                                }
                                disabled={alreadySaved}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md shrink-0 cursor-pointer ${
                                  alreadySaved
                                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-[#991B1B] text-white hover:bg-[#7F1D1D] dark:bg-[#D97706] dark:text-[#0B0F17]'
                                }`}
                              >
                                {alreadySaved ? '✓ Đã lưu SRS' : '+ Lưu SRS'}
                              </button>
                            </div>

                            {showVi && w.vietnameseMeaning && (
                              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                🇻🇳 {w.vietnameseMeaning}
                              </p>
                            )}

                            {showEn && (
                              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                                {w.definition}
                              </p>
                            )}
                          </div>

                          <div className="p-2.5 rounded-lg bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] space-y-0.5 text-[11px]">
                            <p className="text-zinc-700 dark:text-zinc-300 italic">
                              “{w.exampleSentence}”
                            </p>
                            {showVi && w.exampleTranslationVi && (
                              <p className="text-emerald-800 dark:text-emerald-300">
                                🇻🇳 “{w.exampleTranslationVi}”
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: 20-QUESTION SCIENTIFIC MULTI-FORMAT QUIZ WITH NUMBERED NAVIGATOR (1-20) */}
              {(lessonStepTab === 'all' || lessonStepTab === 'quiz') && (
                <div className="space-y-4 pt-3 border-t border-[#E6E2DA] dark:border-[#263042]">
                  {/* Quiz Top Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base md:text-lg font-bold font-serif-editorial">
                        Bước 3 · Đề Thực Hành 20 Câu Đa Phương Án (Đề #{currentVariantSeed + 1})
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Chạm vào bảng số câu 1–20 để chuyển nhanh, hoặc đổi sang chế độ Xem danh sách 20 câu.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* View Toggle: Single Focus vs Full List */}
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                        <button
                          onClick={() => setQuizDisplayMode('single')}
                          className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                            quizDisplayMode === 'single'
                              ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          Từng Câu Tập Trung
                        </button>
                        <button
                          onClick={() => setQuizDisplayMode('list')}
                          className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                            quizDisplayMode === 'list'
                              ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          Danh Sách 20 Câu
                        </button>
                      </div>

                      <button
                        onClick={handleRefresh20Questions}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#991B1B] dark:border-[#D97706] text-[#991B1B] dark:text-[#D97706] hover:bg-[#991B1B] hover:text-white transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Đổi Đề 20 Câu Mới (Đề #{currentVariantSeed + 2})</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive 20-Question Numbered Palette (1..20) */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold">
                        Bảng Điều Hướng 20 Câu Hỏi (Đã làm: {answeredCount}/20):
                      </span>
                      {isCurrentQuizSubmitted && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setQuizDisplayMode('list');
                              setQuizResultFilter(
                                quizResultFilter === 'wrong' ? 'all' : 'wrong'
                              );
                            }}
                            className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706] underline cursor-pointer"
                          >
                            {quizResultFilter === 'wrong'
                              ? 'Hiện tất cả 20 câu'
                              : `Chỉ lọc xem ${20 - correctCount} câu Sai cần chữa`}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-20 gap-1.5">
                      {twentyQuestions.map((q, idx) => {
                        const isAnswered = quizAnswers[q.id] !== undefined;
                        const isCorrect = quizAnswers[q.id] === q.correctIndex;
                        const isFocused =
                          quizDisplayMode === 'single' && safeQuestionIdx === idx;

                        let pillCls =
                          'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042] text-zinc-600 dark:text-zinc-400';
                        if (isCurrentQuizSubmitted) {
                          pillCls = isCorrect
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'bg-red-600 text-white border-red-600 font-bold';
                        } else if (isAnswered) {
                          pillCls =
                            'bg-[#991B1B]/15 dark:bg-[#D97706]/25 border-[#991B1B] dark:border-[#D97706] text-[#991B1B] dark:text-[#D97706] font-bold';
                        }

                        if (isFocused) {
                          pillCls += ' ring-2 ring-[#18181B] dark:ring-white';
                        }

                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              setFocusedQuestionIdx(idx);
                              setQuizDisplayMode('single');
                            }}
                            className={`h-8 rounded-md text-xs font-mono-tabular border transition-all cursor-pointer flex items-center justify-center ${pillCls}`}
                            title={`Câu ${idx + 1}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Score & Evaluation Banner when Submitted */}
                  {isCurrentQuizSubmitted && (
                    <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border-2 border-[#991B1B] dark:border-[#D97706] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17] flex items-center justify-center font-mono-tabular font-bold text-base">
                          {correctCount}/20
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
                            <h4 className="text-sm md:text-base font-bold font-serif-editorial">
                              Đánh Giá Đề #{currentVariantSeed + 1}: Đạt {scorePercentage}% (
                              {correctCount} Đúng · {20 - correctCount} Sai)
                            </h4>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {scorePercentage >= 85
                              ? 'Xuất sắc! Bạn đã nắm chắc cấu trúc ngữ pháp và từ vựng bài này.'
                              : 'Hãy bấm vào các ô màu đỏ trên bảng 1–20 để xem giải thích chữa lỗi song ngữ Anh – Việt, sau đó bấm làm Đề mới!'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleRefresh20Questions}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-[#D97706] dark:text-[#0B0F17] rounded-lg cursor-pointer shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>🔄 Làm Bộ 20 Câu Hỏi Mới (Đề #{currentVariantSeed + 2})</span>
                      </button>
                    </div>
                  )}

                  {/* Quiz Body: Either Single Focused Question (with Prev/Next) OR Full Filtered List */}
                  {quizDisplayMode === 'single' ? (
                    <div className="space-y-3">
                      {renderSingleQuizQuestionCard(activeSingleQuestion, safeQuestionIdx)}

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() =>
                            setFocusedQuestionIdx((i) => Math.max(0, i - 1))
                          }
                          disabled={safeQuestionIdx <= 0}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#E6E2DA] dark:border-[#263042] disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Câu trước
                        </button>

                        <span className="text-xs font-mono-tabular text-zinc-500">
                          Câu {safeQuestionIdx + 1} / 20
                        </span>

                        <button
                          onClick={() =>
                            setFocusedQuestionIdx((i) =>
                              Math.min(twentyQuestions.length - 1, i + 1)
                            )
                          }
                          disabled={safeQuestionIdx >= twentyQuestions.length - 1}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#E6E2DA] dark:border-[#263042] disabled:opacity-40 cursor-pointer"
                        >
                          Câu tiếp theo <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
                      {twentyQuestions.map((q, idx) => {
                        if (
                          isCurrentQuizSubmitted &&
                          quizResultFilter === 'wrong' &&
                          quizAnswers[q.id] === q.correctIndex
                        ) {
                          return null;
                        }
                        return renderSingleQuizQuestionCard(q, idx);
                      })}
                    </div>
                  )}

                  {/* Bottom Submit & Refresh Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E6E2DA] dark:border-[#263042]">
                    <button
                      onClick={handleRefresh20Questions}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border border-[#18181B] dark:border-[#F3F0E6] text-[#18181B] dark:text-[#F3F0E6] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>🔄 Đổi Bộ 20 Câu Hỏi Mới (Đề #{currentVariantSeed + 2})</span>
                    </button>

                    <button
                      onClick={() => {
                        setQuizSubmitted((prev) => ({
                          ...prev,
                          [`${currentLesson.id}_v${currentVariantSeed}`]: true,
                        }));
                        onCompleteLesson(currentLesson.id);
                      }}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg cursor-pointer"
                    >
                      Chấm Điểm 20 Câu &amp; Xem Đánh Giá Đúng/Sai Song Ngữ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Module 3: Spaced Repetition System (SRS) & Mastery Levels
  const nowIso = new Date().toISOString();
  const dueDeck = srsCards.filter((c) => c.nextReviewAt <= nowIso);
  const newCount = srsCards.filter((c) => c.masteryLevel === 'New').length;
  const learningCount = srsCards.filter((c) => c.masteryLevel === 'Learning').length;
  const reviewingCount = srsCards.filter((c) => c.masteryLevel === 'Reviewing').length;
  const masteredCount = srsCards.filter((c) => c.masteryLevel === 'Mastered').length;

  const activeDeck =
    masteryFilter === 'DUE'
      ? dueDeck
      : masteryFilter === 'ALL'
      ? srsCards
      : srsCards.filter((c) => c.masteryLevel === masteryFilter);

  const safeIdx = activeDeck.length > 0 ? currentCardIdx % activeDeck.length : 0;
  const activeCard = activeDeck[safeIdx] || null;
  const activeCardBilingual = activeCard ? getCardBilingualInfo(activeCard) : null;

  const handleGrade = (rating: SrsRecallRating) => {
    if (!activeCard) return;
    onReviewSrsCard(activeCard, rating);
    setIsFlipped(false);
    setCurrentCardIdx((prev) => prev + 1);
  };

  const handleCreateCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWord.trim() || !customDef.trim()) return;
    const formattedDef = customViMeaning.trim()
      ? `Nghĩa TV: ${customViMeaning.trim()} — ${customDef.trim()}`
      : customDef.trim();

    onAddSrsWord(
      {
        word: customWord.trim(),
        phonetic: customPhonetic.trim() || `/${customWord.trim().toLowerCase()}/`,
        partOfSpeech: customPos,
        definition: formattedDef,
        vietnameseMeaning: customViMeaning.trim() || undefined,
        exampleSentence:
          customExample.trim() || `Academic usage of ${customWord.trim()} in IELTS Writing.`,
        collocations: [],
      },
      customTopic,
      customCefr,
      'custom'
    );
    setCustomWord('');
    setCustomPhonetic('');
    setCustomViMeaning('');
    setCustomDef('');
    setCustomExample('');
  };

  return (
    <div className="space-y-8">
      {/* Header + Offline Pack Sync */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E2DA] dark:border-[#263042] pb-5">
        <div className="space-y-1.5">
          <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
            {langMode === 'vi'
              ? 'Học phần 03 · Hệ Thống Thẻ Ghi Nhớ Ngắt Quãng SM-2 Song Ngữ Anh – Việt'
              : 'Module 03 · SM-2 Spaced Repetition System & Bilingual Flashcards'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold font-serif-editorial">
            {langMode === 'vi'
              ? 'Thẻ Từ Vựng SRS Song Ngữ & 4 Cấp Độ Thuộc Lòng'
              : 'Spaced Repetition Flashcard Deck (EN – VI)'}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            {langMode === 'en'
              ? 'Every word saved from the Vocabulary Hub, News Reader, or Video Studio enters your SM-2 queue with bilingual definitions.'
              : 'Mọi từ vựng lưu từ Kho Từ Vựng, Báo Tiếng Anh hoặc Video YouTube đều hiển thị đầy đủ Nghĩa Tiếng Việt + Định nghĩa Tiếng Anh và tự động lên lịch ôn tập theo thuật toán SM-2.'}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <button
            onClick={onSyncOfflinePack}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17] rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {langMode === 'en'
                ? `Download Offline Study Pack (${srsCards.length} Cards)`
                : `Tải Bộ Thẻ Học Offline (${srsCards.length} Thẻ)`}
            </span>
          </button>
          {offlinePackSyncedAt && (
            <span className="text-[11px] font-mono-tabular text-emerald-700 dark:text-emerald-400">
              ✓ Cached Offline ·{' '}
              {new Date(offlinePackSyncedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>

      {/* 4 Mastery Level Visual Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(
          [
            {
              level: 'New',
              labelVi: 'Từ Mới (New)',
              count: newCount,
              desc: langMode === 'en' ? 'Unseen headwords awaiting initial encoding' : 'Từ mới thêm vào chờ học lần đầu',
              accent: 'text-zinc-700 dark:text-zinc-300',
              barColor: 'bg-zinc-500',
            },
            {
              level: 'Learning',
              labelVi: 'Đang Học (Learning)',
              count: learningCount,
              desc: langMode === 'en' ? 'Short-interval active acquisition (< 3 days)' : 'Đang ghi nhớ ngắn hạn (< 3 ngày)',
              accent: 'text-amber-700 dark:text-amber-400',
              barColor: 'bg-amber-500',
            },
            {
              level: 'Reviewing',
              labelVi: 'Đang Ôn (Reviewing)',
              count: reviewingCount,
              desc: langMode === 'en' ? 'Medium-term consolidation (3 – 13 days)' : 'Củng cố trí nhớ trung hạn (3 – 13 ngày)',
              accent: 'text-sky-700 dark:text-sky-400',
              barColor: 'bg-sky-600',
            },
            {
              level: 'Mastered',
              labelVi: 'Đã Thuộc Lòng (Mastered)',
              count: masteredCount,
              desc: langMode === 'en' ? 'Long-term lexical retention (14+ days)' : 'Ghi nhớ dài hạn bền vững (14+ ngày)',
              accent: 'text-emerald-700 dark:text-emerald-400',
              barColor: 'bg-emerald-600',
            },
          ] as const
        ).map((stat) => {
          const pct = srsCards.length > 0 ? Math.round((stat.count / srsCards.length) * 100) : 0;
          return (
            <button
              key={stat.level}
              onClick={() => {
                setMasteryFilter(stat.level);
                setCurrentCardIdx(0);
                setIsFlipped(false);
              }}
              className={`text-left p-5 rounded-xl border transition-colors cursor-pointer space-y-2 ${
                masteryFilter === stat.level
                  ? 'bg-white dark:bg-[#151C28] border-[#991B1B] dark:border-[#D97706]'
                  : 'bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono-tabular">
                <span className={`font-semibold ${stat.accent}`}>
                  {langMode === 'en' ? `${stat.level} Tier` : stat.labelVi}
                </span>
                <span>{pct}%</span>
              </div>
              <p className="text-2xl font-bold font-mono-tabular">{stat.count} Cards</p>
              <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div className={`h-full ${stat.barColor}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[11px] text-zinc-500">{stat.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Two-Column Arena: Active Flashcard Drill (7 cols) + Custom Card Creator & Deck Table (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Flashcard Review Stage */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E2DA] dark:border-[#263042] pb-3">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF8F5] dark:bg-[#0B0F17] rounded-lg border border-[#E6E2DA] dark:border-[#263042]">
              {(['DUE', 'ALL', 'New', 'Learning', 'Reviewing', 'Mastered'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setMasteryFilter(f);
                    setCurrentCardIdx(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    masteryFilter === f
                      ? 'bg-[#991B1B] text-white dark:bg-[#D97706]'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {f === 'DUE'
                    ? `${langMode === 'en' ? 'Due Now' : 'Cần ôn'} (${dueDeck.length})`
                    : f === 'ALL'
                    ? `${langMode === 'en' ? 'All' : 'Tất cả'} (${srsCards.length})`
                    : f}
                </button>
              ))}
            </div>

            {activeDeck.length > 0 && (
              <span className="text-xs font-mono-tabular text-zinc-500">
                Card {safeIdx + 1} / {activeDeck.length}
              </span>
            )}
          </div>

          {activeCard ? (
            <div className="space-y-5">
              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[280px] rounded-xl border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] p-6 md:p-8 flex flex-col justify-between cursor-pointer select-none transition-colors hover:border-[#991B1B]"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500 font-mono-tabular">
                  <span>
                    CEFR {activeCard.cefrLevel} · {activeCard.topic} · {activeCard.masteryLevel}
                  </span>
                  <span>
                    Interval: {activeCard.intervalDays}d · Ease: {activeCard.easeFactor.toFixed(2)}
                  </span>
                </div>

                <div className="my-6 text-center space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <h2 className="text-3xl md:text-4xl font-bold font-serif-editorial">
                      {activeCard.word}
                    </h2>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(activeCard.word);
                      }}
                      className="p-2 rounded-lg bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] hover:border-[#991B1B] cursor-pointer"
                      title="Pronounce word"
                    >
                      <Volume2 className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
                    </button>
                  </div>
                  <p className="text-sm font-mono-tabular text-zinc-500">
                    {activeCard.phonetic} · <span className="italic">{activeCard.partOfSpeech}</span>
                  </p>

                  {isFlipped ? (
                    <div className="pt-4 border-t border-[#E6E2DA] dark:border-[#263042] space-y-2.5 max-w-xl mx-auto">
                      {activeCardBilingual?.vietnameseMeaning && (
                        <div className="inline-block px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-sm font-bold text-emerald-900 dark:text-emerald-300">
                          🇻🇳 Nghĩa Tiếng Việt: {activeCardBilingual.vietnameseMeaning}
                        </div>
                      )}
                      <p className="text-sm font-medium text-[#18181B] dark:text-[#F3F0E6]">
                        {activeCard.definition}
                      </p>
                      {activeCard.exampleSentence && (
                        <div className="space-y-1 pt-1">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                            “{activeCard.exampleSentence}”
                          </p>
                          {activeCardBilingual?.exampleTranslationVi && (
                            <p className="text-xs text-emerald-800 dark:text-emerald-400">
                              🇻🇳 “{activeCardBilingual.exampleTranslationVi}”
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[#991B1B] dark:text-[#D97706] pt-4">
                      {langMode === 'en'
                        ? 'Click card to reveal bilingual definition & contextual usage →'
                        : 'Nhấn vào thẻ để lật xem Nghĩa Tiếng Việt, Định nghĩa Anh & Câu ví dụ →'}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Source: {activeCard.source}</span>
                  <span className="inline-flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />{' '}
                    {langMode === 'en' ? 'Tap anywhere to flip' : 'Chạm để lật thẻ'}
                  </span>
                </div>
              </div>

              {/* SM-2 Recall Rating Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    {
                      rating: 'Again',
                      labelVi: 'Học lại (Again)',
                      intervalLabel: '< 10 mins',
                      desc: langMode === 'en' ? 'Forgot / Reset' : 'Quên từ này',
                      btnStyle:
                        'border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-800 dark:text-red-300',
                    },
                    {
                      rating: 'Hard',
                      labelVi: 'Khó nhớ (Hard)',
                      intervalLabel: '1 day',
                      desc: langMode === 'en' ? 'Recalled with effort' : 'Nhớ mang máng',
                      btnStyle:
                        'border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-800 dark:text-amber-300',
                    },
                    {
                      rating: 'Good',
                      labelVi: 'Nhớ tốt (Good)',
                      intervalLabel: `${Math.max(1, Math.round((activeCard.intervalDays || 1) * activeCard.easeFactor))} days`,
                      desc: langMode === 'en' ? 'Solid recall' : 'Nhớ chính xác',
                      btnStyle:
                        'border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-sky-800 dark:text-sky-300',
                    },
                    {
                      rating: 'Easy',
                      labelVi: 'Quá dễ (Easy)',
                      intervalLabel: `${Math.max(4, Math.round((activeCard.intervalDays || 2) * activeCard.easeFactor * 1.3))} days`,
                      desc: langMode === 'en' ? 'Instant mastery' : 'Thuộc lòng ngay',
                      btnStyle:
                        'border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300',
                    },
                  ] as const
                ).map((btn) => (
                  <button
                    key={btn.rating}
                    onClick={() => handleGrade(btn.rating)}
                    className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${btn.btnStyle}`}
                  >
                    <p className="text-xs font-bold">
                      {langMode === 'en' ? btn.rating : btn.labelVi}
                    </p>
                    <p className="text-[11px] font-mono-tabular mt-0.5">{btn.intervalLabel}</p>
                    <p className="text-[10px] opacity-75">{btn.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-[#FAF8F5] dark:bg-[#0B0F17] rounded-xl border border-[#E6E2DA] dark:border-[#263042]">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-base font-semibold font-serif-editorial">
                {langMode === 'en'
                  ? 'All Cards in This Filter Are Up to Date!'
                  : 'Bạn Đã Ôn Tập Xong Toàn Bộ Thẻ Đến Hạn!'}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                {langMode === 'en'
                  ? `Switch to All (${srsCards.length}) to practice ahead of schedule, or add new words from the News Reader.`
                  : `Chuyển sang mục Tất cả (${srsCards.length}) để ôn tập trước lịch, hoặc lưu thêm từ mới từ Báo Tiếng Anh và Video YouTube.`}
              </p>
              <button
                onClick={() => setMasteryFilter('ALL')}
                className="px-4 py-2 text-xs font-medium text-white bg-[#991B1B] rounded-lg cursor-pointer"
              >
                {langMode === 'en'
                  ? `Practice All ${srsCards.length} Cards`
                  : `Ôn tập toàn bộ ${srsCards.length} thẻ`}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Add Custom Flashcard & Manage Deck */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleCreateCustomCard}
            className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 space-y-3"
          >
            <h3 className="text-base font-bold font-serif-editorial">
              {langMode === 'en'
                ? 'Add Custom Word to SRS Deck'
                : 'Thêm Từ Vựng Song Ngữ Mới Vào Bộ Thẻ SRS'}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                placeholder="Từ tiếng Anh (VD: paradigm)"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
              />
              <input
                type="text"
                placeholder="Phiên âm IPA (VD: /ˈpærədaɪm/)"
                value={customPhonetic}
                onChange={(e) => setCustomPhonetic(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={customPos}
                onChange={(e) => setCustomPos(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
              >
                <option value="noun">noun (danh từ)</option>
                <option value="verb">verb (động từ)</option>
                <option value="adjective">adjective (tính từ)</option>
                <option value="adverb">adverb (trạng từ)</option>
                <option value="idiom">idiom (thành ngữ)</option>
              </select>
              <select
                value={customCefr}
                onChange={(e) => setCustomCefr(e.target.value as CefrLevel)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
              >
                {(['A1', 'A2', 'B1', 'B2', 'C1'] as CefrLevel[]).map((c) => (
                  <option key={c} value={c}>
                    CEFR {c}
                  </option>
                ))}
              </select>
              <select
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value as IeltsTopic)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
              >
                {(['Education', 'Environment', 'Technology', 'Health', 'Society', 'Economy'] as IeltsTopic[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
              </select>
            </div>
            <input
              type="text"
              placeholder="🇻🇳 Nghĩa Tiếng Việt (VD: mô hình, hệ tư tưởng chuẩn mực)..."
              value={customViMeaning}
              onChange={(e) => setCustomViMeaning(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
            />
            <input
              type="text"
              required
              placeholder="🇬🇧 Định nghĩa Tiếng Anh (English definition)..."
              value={customDef}
              onChange={(e) => setCustomDef(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
            />
            <input
              type="text"
              placeholder="Câu ví dụ ngữ cảnh (Contextual example sentence)..."
              value={customExample}
              onChange={(e) => setCustomExample(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
            />
            <button
              type="submit"
              className="w-full py-2 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg cursor-pointer"
            >
              {langMode === 'en'
                ? '+ Add Flashcard to SM-2 Deck'
                : '+ Thêm Thẻ Từ Vựng Song Ngữ Vào SRS'}
            </button>
          </form>

          {/* Compact Deck Table with Vietnamese Meaning */}
          <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold font-serif-editorial">
              {langMode === 'en'
                ? `Saved Vocabulary Inventory (${srsCards.length})`
                : `Danh Sách Từ Vựng Đã Lưu (${srsCards.length})`}
            </h3>
            <div className="max-h-72 overflow-y-auto divide-y divide-[#E6E2DA] dark:divide-[#263042]">
              {srsCards.map((c) => {
                const bi = getCardBilingualInfo(c);
                return (
                  <div key={c.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div>
                        <span className="font-semibold">{c.word}</span>{' '}
                        <span className="text-zinc-500 font-mono-tabular">
                          · {c.cefrLevel} · {c.masteryLevel} ({c.intervalDays}d)
                        </span>
                      </div>
                      {showVi && bi.vietnameseMeaning && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          🇻🇳 {bi.vietnameseMeaning}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => speakText(c.word)}
                        className="p-1 text-zinc-500 hover:text-[#991B1B] cursor-pointer"
                        title="Pronounce"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSrsCard(c.id)}
                        className="p-1 text-zinc-400 hover:text-red-600 cursor-pointer"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
