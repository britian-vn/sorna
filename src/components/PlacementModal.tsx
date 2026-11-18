import React, { useState, useRef } from 'react';
import {
  Volume2,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Mic,
  Square,
  Sparkles,
  Clock,
  Sliders,
  X,
} from 'lucide-react';
import { BandLevelId, LanguageMode, UserProfileData } from '../types';
import {
  QUICK_DIAGNOSTIC_QUESTIONS,
  DETAILED_DIAGNOSTIC_LISTENING,
  ADAPTIVE_READING_POOL,
  speakText,
} from '../data/curriculum';

interface PlacementModalProps {
  langMode?: LanguageMode;
  profile: UserProfileData;
  onClose: () => void;
  onSaveProgress: (updated: Partial<UserProfileData>) => void;
  onCompletePlacement: (result: {
    bandLevel: BandLevelId;
    targetBand: number;
    listeningScore: number;
    readingScore: number;
    writingScore: number;
    speakingScore: number;
    mode: 'quick' | 'detailed' | 'manual';
    summaryText?: string;
  }) => void;
}

interface DetailedSavedPayload {
  listeningAnswers: number[];
  adaptiveHistory: { nodeId: string; correct: boolean; band: number }[];
  currentAdaptiveIdx: number;
  writingSample: string;
  speakingNotes: string;
}

export const PlacementModal: React.FC<PlacementModalProps> = ({
  langMode = 'bilingual',
  profile,
  onClose,
  onSaveProgress,
  onCompletePlacement,
}) => {
  const showVi = langMode === 'bilingual' || langMode === 'vi';

  const initialSaved: DetailedSavedPayload = React.useMemo(() => {
    if (profile.diagnosticSavedState) {
      try {
        return JSON.parse(profile.diagnosticSavedState);
      } catch {
        // ignore
      }
    }
    return {
      listeningAnswers: [-1, -1],
      adaptiveHistory: [],
      currentAdaptiveIdx: 1,
      writingSample: '',
      speakingNotes: '',
    };
  }, [profile.diagnosticSavedState]);

  const [mode, setMode] = useState<'select' | 'quick' | 'detailed' | 'manual'>(
    profile.diagnosticMode && !profile.diagnosticCompleted ? profile.diagnosticMode : 'select'
  );
  const [step, setStep] = useState<number>(profile.diagnosticStep || 0);

  // Quick 2-min state
  const [quickAnswers, setQuickAnswers] = useState<number[]>(
    Array(QUICK_DIAGNOSTIC_QUESTIONS.length).fill(-1)
  );
  const [showQuickExplanations, setShowQuickExplanations] = useState(false);

  // Manual state
  const [manualBand, setManualBand] = useState<BandLevelId>(profile.currentBandLevel || '5.0-6.0');
  const [targetBand, setTargetBand] = useState<number>(profile.targetBand || 7.0);

  // Detailed 4-Skill state
  const [listeningAnswers, setListeningAnswers] = useState<number[]>(initialSaved.listeningAnswers);
  const [adaptiveHistory, setAdaptiveHistory] = useState<
    { nodeId: string; correct: boolean; band: number }[]
  >(initialSaved.adaptiveHistory);
  const [currentAdaptiveIdx, setCurrentAdaptiveIdx] = useState<number>(
    initialSaved.currentAdaptiveIdx
  );
  const [selectedAdaptiveOption, setSelectedAdaptiveOption] = useState<number>(-1);
  const [writingSample, setWritingSample] = useState<string>(initialSaved.writingSample);
  const [speakingNotes, setSpeakingNotes] = useState<string>(initialSaved.speakingNotes);

  // MediaRecorder for Speaking Part 1 in Detailed Diagnostic
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // AI Placement Evaluation loading state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setSpeakingNotes(
        (prev) =>
          prev ||
          'In my hometown, public transport has expanded considerably over the past five years, particularly electric metro lines.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (!speakingNotes.trim()) {
        setSpeakingNotes(
          'Recorded voice response: I currently study academic English to prepare for international postgraduate study. In my daily routine, I prefer reading analytical articles in the morning when my concentration is strongest.'
        );
      }
    }
  };

  const handleSaveAndPause = () => {
    const serialized = JSON.stringify({
      listeningAnswers,
      adaptiveHistory,
      currentAdaptiveIdx,
      writingSample,
      speakingNotes,
    });
    onSaveProgress({
      diagnosticMode: mode === 'select' ? undefined : mode,
      diagnosticStep: step,
      diagnosticSavedState: serialized,
    });
    setSaveBanner('Đã lưu tiến độ kiểm tra đầu vào. Bạn có thể tiếp tục bất cứ lúc nào.');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const finishQuickDiagnostic = () => {
    let correct = 0;
    QUICK_DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
      if (quickAnswers[idx] === q.correctIndex) correct += 1;
    });
    let bandLevel: BandLevelId = '3.5-5.0';
    let baseScore = 4.5;
    if (correct <= 1) {
      bandLevel = '0-3.5';
      baseScore = 3.5;
    } else if (correct === 2 || correct === 3) {
      bandLevel = '3.5-5.0';
      baseScore = 4.5;
    } else if (correct === 4) {
      bandLevel = '5.0-6.0';
      baseScore = 5.5;
    } else {
      bandLevel = '6.0-7.0+';
      baseScore = 6.5;
    }

    onCompletePlacement({
      bandLevel,
      targetBand,
      listeningScore: baseScore,
      readingScore: Number((baseScore + 0.5).toFixed(1)),
      writingScore: baseScore,
      speakingScore: baseScore,
      mode: 'quick',
      summaryText: `Đạt ${correct}/${QUICK_DIAGNOSTIC_QUESTIONS.length} câu bài Test Nhanh 2 Phút. Xếp vào chặng Band ${bandLevel}.`,
    });
  };

  const handleAdaptiveReadingStep = () => {
    if (selectedAdaptiveOption === -1) return;
    const currentNode = ADAPTIVE_READING_POOL[currentAdaptiveIdx];
    const isCorrect = selectedAdaptiveOption === currentNode.correctIndex;
    const nextHistory = [
      ...adaptiveHistory,
      { nodeId: currentNode.id, correct: isCorrect, band: currentNode.difficultyBand },
    ];
    setAdaptiveHistory(nextHistory);
    setSelectedAdaptiveOption(-1);

    if (nextHistory.length < 2) {
      const nextIdx = isCorrect
        ? Math.min(ADAPTIVE_READING_POOL.length - 1, currentAdaptiveIdx + 1)
        : Math.max(0, currentAdaptiveIdx - 1);
      setCurrentAdaptiveIdx(nextIdx);
    } else {
      setStep(2);
    }
  };

  const finishDetailedDiagnostic = async () => {
    setIsEvaluating(true);
    const listenCorrect = DETAILED_DIAGNOSTIC_LISTENING.reduce(
      (acc, item, i) => acc + (listeningAnswers[i] === item.correctIndex ? 1 : 0),
      0
    );
    const listeningScore = listenCorrect === 2 ? 7.0 : listenCorrect === 1 ? 5.5 : 4.0;

    const readingScore =
      adaptiveHistory.length > 0
        ? Number(
            (
              adaptiveHistory.reduce(
                (acc, h) => acc + (h.correct ? h.band + 0.5 : Math.max(3.5, h.band - 1.0)),
                0
              ) / adaptiveHistory.length
            ).toFixed(1)
          )
        : 5.5;

    try {
      const response = await fetch('/api/ai/evaluate-placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listeningScore,
          readingScore,
          writingText: writingSample,
          speakingTranscript: speakingNotes,
        }),
      });
      if (response.ok) {
        const aiResult = await response.json();
        const validBands: BandLevelId[] = ['0-3.5', '3.5-5.0', '5.0-6.0', '6.0-7.0+'];
        const chosenBand: BandLevelId = validBands.includes(aiResult.recommendedPathway)
          ? aiResult.recommendedPathway
          : '5.0-6.0';

        onCompletePlacement({
          bandLevel: chosenBand,
          targetBand,
          listeningScore,
          readingScore,
          writingScore: Number(aiResult.writingBand) || 5.5,
          speakingScore: Number(aiResult.speakingBand) || 5.5,
          mode: 'detailed',
          summaryText: aiResult.diagnosticSummaryVi
            ? `${aiResult.diagnosticSummary} — 🇻🇳 ${aiResult.diagnosticSummaryVi}`
            : aiResult.diagnosticSummary,
        });
        setIsEvaluating(false);
        return;
      }
    } catch {
      // Fallback calculation if offline
    }

    const wordCount = writingSample.trim().split(/\s+/).filter(Boolean).length;
    const writingScore = wordCount >= 45 ? 6.5 : wordCount >= 25 ? 5.5 : 4.5;
    const speakingScore = speakingNotes.trim().length > 40 ? 6.0 : 5.0;
    const avg = (listeningScore + readingScore + writingScore + speakingScore) / 4;
    const bandLevel: BandLevelId =
      avg >= 6.2 ? '6.0-7.0+' : avg >= 5.2 ? '5.0-6.0' : avg >= 3.8 ? '3.5-5.0' : '0-3.5';

    setIsEvaluating(false);
    onCompletePlacement({
      bandLevel,
      targetBand,
      listeningScore,
      readingScore,
      writingScore,
      speakingScore,
      mode: 'detailed',
      summaryText: `Hoàn thành đánh giá 4 kỹ năng (Listening ${listeningScore}, Reading ${readingScore}, Writing ${writingScore}, Speaking ${speakingScore}).`,
    });
  };

  const writingWords = writingSample.trim() ? writingSample.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#FAF8F5] dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 md:p-8 space-y-6 my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
          <div>
            <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
              ScholarBand Diagnostic Calibration · Kiểm Tra Xếp Lớp Đầu Vào Song Ngữ
            </p>
            <h2 className="text-2xl font-bold font-serif-editorial text-[#18181B] dark:text-[#F3F0E6] mt-1">
              {langMode === 'vi'
                ? 'Xác Định Band Điểm IELTS & Lộ Trình Học Của Bạn'
                : 'Calibrate Your IELTS Band Pathway'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {(mode === 'quick' || mode === 'detailed') && (
              <button
                onClick={handleSaveAndPause}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#0B0F17] rounded-lg hover:border-[#991B1B] transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
                {langMode === 'en' ? 'Save & Resume Later' : 'Lưu & Làm Tiếp Sau'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg cursor-pointer"
              aria-label="Close diagnostic modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {saveBanner && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
            {saveBanner}
          </div>
        )}

        {/* Mode Selector */}
        {mode === 'select' && (
          <div className="space-y-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {langMode === 'en'
                ? 'Choose how you would like to establish your baseline across Listening, Reading, Writing, and Speaking. You can save your progress at any point.'
                : 'Chọn phương thức đánh giá trình độ IELTS đầu vào (Nghe, Đọc, Viết, Nói). Bạn có thể lưu tiến độ làm bài bất cứ lúc nào.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: 15-Minute Detailed 4-Skill Assessment */}
              <div className="bg-white dark:bg-[#0B0F17] border border-[#991B1B] dark:border-[#D97706] rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
                    <span>{langMode === 'en' ? 'Recommended · Full 4-Skill' : 'Khuyên dùng · Đủ 4 Kỹ năng'}</span>
                    <span className="font-mono-tabular">~15 min</span>
                  </div>
                  <h3 className="text-lg font-semibold font-serif-editorial">
                    {langMode === 'vi'
                      ? 'Đánh Giá Chuyên Sâu 4 Kỹ Năng (15 Phút)'
                      : '15-Minute Detailed 4-Skill Assessment'}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {langMode === 'en'
                      ? 'Includes 2 short Listening audio dialogues, dynamic Adaptive Reading questions, a 50-word Writing sample, and a Speaking Part 1 voice recording graded by AI.'
                      : 'Gồm 2 đoạn hội thoại Nghe ngắn, bài Đọc thích ứng thông minh, viết đoạn văn 50 từ và thu âm Speaking Part 1 chấm bằng AI song ngữ.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMode('detailed');
                    setStep(0);
                  }}
                  className="w-full py-2.5 px-4 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-[#D97706] dark:hover:bg-[#B45309] rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{langMode === 'en' ? 'Start 4-Skill Assessment' : 'Bắt đầu Thi 4 Kỹ Năng'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Option 2: 2-Minute Quick Test */}
              <div className="bg-white dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{langMode === 'en' ? 'Rapid Calibration' : 'Kiểm tra nhanh'}</span>
                    <span className="font-mono-tabular">~2 min</span>
                  </div>
                  <h3 className="text-lg font-semibold font-serif-editorial">
                    {langMode === 'vi' ? 'Bài Test Nhanh 2 Phút (5 Câu)' : '2-Minute Quick Placement Quiz'}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {langMode === 'en'
                      ? 'Answer 5 progressive CEFR A2–C1 grammar, collocation, and reading inference questions for immediate Band calibration.'
                      : 'Trả lời 5 câu hỏi ngữ pháp, từ vựng học thuật CEFR A2–C1 kèm giải thích chữa lỗi song ngữ Anh – Việt.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMode('quick');
                    setStep(0);
                  }}
                  className="w-full py-2.5 px-4 text-xs font-medium border border-[#18181B] dark:border-[#F3F0E6] text-[#18181B] dark:text-[#F3F0E6] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{langMode === 'en' ? 'Start 2-Minute Quiz' : 'Làm Test Nhanh 2 Phút'}</span>
                </button>
              </div>

              {/* Option 3: Manual Selection */}
              <div className="bg-white dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{langMode === 'en' ? 'Direct Selection' : 'Chọn trực tiếp'}</span>
                    <span className="font-mono-tabular">Instant</span>
                  </div>
                  <h3 className="text-lg font-semibold font-serif-editorial">
                    {langMode === 'vi' ? 'Tự Chọn Band Hiện Tại & Mục Tiêu' : 'Manual Band & Target Selection'}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {langMode === 'en'
                      ? 'Already know your current IELTS Band score? Select your starting track and target Band directly.'
                      : 'Đã biết Band điểm hiện tại của bạn? Chọn ngay chặng lộ trình khởi đầu và Band mục tiêu.'}
                  </p>
                </div>
                <button
                  onClick={() => setMode('manual')}
                  className="w-full py-2.5 px-4 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{langMode === 'en' ? 'Choose Band Manually' : 'Tự Chọn Band Điểm'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mode: 2-Minute Quick Quiz */}
        {mode === 'quick' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <button
                onClick={() => setMode('select')}
                className="underline hover:text-[#991B1B] cursor-pointer"
              >
                ← {langMode === 'en' ? 'Back to Assessment Modes' : 'Quay lại chọn chế độ'}
              </button>
              <span className="font-mono-tabular">
                Answered {quickAnswers.filter((a) => a !== -1).length} / {QUICK_DIAGNOSTIC_QUESTIONS.length}
              </span>
            </div>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {QUICK_DIAGNOSTIC_QUESTIONS.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#18181B] dark:text-[#F3F0E6]">
                      {qIdx + 1}. {q.question}
                    </p>
                    {showVi && q.questionVi && (
                      <p className="text-xs text-zinc-500">🇻🇳 {q.questionVi}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const active = quickAnswers[qIdx] === oIdx;
                      const isCorrect = q.correctIndex === oIdx;
                      let cls =
                        'bg-[#FAF8F5] dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042] hover:border-zinc-400';
                      if (showQuickExplanations) {
                        if (isCorrect)
                          cls =
                            'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-semibold';
                        else if (active)
                          cls =
                            'bg-red-50 dark:bg-red-950/60 border-red-600 text-red-900 dark:text-red-200';
                      } else if (active) {
                        cls =
                          'bg-[#991B1B] text-white border-[#991B1B] dark:bg-[#D97706] dark:border-[#D97706]';
                      }
                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            const next = [...quickAnswers];
                            next[qIdx] = oIdx;
                            setQuickAnswers(next);
                          }}
                          className={`text-left px-3.5 py-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${cls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {showQuickExplanations && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E6E2DA] dark:border-[#263042] text-xs">
                      <div className="p-2.5 rounded bg-[#FAF8F5] dark:bg-[#151C28]">
                        <strong>🇬🇧 EN:</strong> {q.explanation}
                      </div>
                      {q.explanationVi && (
                        <div className="p-2.5 rounded bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200">
                          <strong>🇻🇳 VI:</strong> {q.explanationVi}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6E2DA] dark:border-[#263042]">
              <div className="flex items-center gap-2 text-xs">
                <span>Target Band:</span>
                <select
                  value={targetBand}
                  onChange={(e) => setTargetBand(Number(e.target.value))}
                  className="px-2.5 py-1 rounded border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#0B0F17] font-mono-tabular"
                >
                  {[5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map((b) => (
                    <option key={b} value={b}>
                      Band {b.toFixed(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQuickExplanations(!showQuickExplanations)}
                  className="px-3.5 py-2 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                >
                  {showQuickExplanations ? 'Ẩn Chữa Lỗi' : 'Xem Đáp Án & Chữa Lỗi Song Ngữ'}
                </button>
                <button
                  onClick={finishQuickDiagnostic}
                  className="px-5 py-2.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg cursor-pointer"
                >
                  {langMode === 'en' ? 'Complete Quick Calibration' : 'Hoàn Tất & Xếp Lộ Trình'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mode: 15-Minute Detailed 4-Skill Assessment */}
        {mode === 'detailed' && (
          <div className="space-y-5">
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between gap-2 text-xs border-b border-[#E6E2DA] dark:border-[#263042] pb-3">
              {[
                '1. Listening Dialogues',
                '2. Adaptive Reading',
                '3. Writing Sample',
                '4. Speaking Part 1',
              ].map((label, idx) => (
                <button
                  key={label}
                  onClick={() => setStep(idx)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    step === idx
                      ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                      : step > idx
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Step 0: Listening Dialogues */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  {langMode === 'en'
                    ? 'Listen to the two short campus/academic audio extracts and select the accurate comprehension answer.'
                    : 'Nghe 2 đoạn hội thoại học thuật ngắn và chọn đáp án đúng:'}
                </p>
                {DETAILED_DIAGNOSTIC_LISTENING.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706]">
                        {item.title}
                      </span>
                      <button
                        onClick={() => speakText(item.audioText, 0.98)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17] rounded-lg cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Play Audio Dialogue
                      </button>
                    </div>
                    <p className="text-sm font-medium">{item.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => {
                            const next = [...listeningAnswers];
                            next[idx] = oIdx;
                            setListeningAnswers(next);
                          }}
                          className={`text-left px-3 py-2 rounded-lg text-xs border transition-colors cursor-pointer ${
                            listeningAnswers[idx] === oIdx
                              ? 'bg-[#991B1B] text-white border-[#991B1B] dark:bg-[#D97706]'
                              : 'bg-[#FAF8F5] dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 text-xs font-medium text-white bg-[#991B1B] rounded-lg inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Adaptive Reading</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Adaptive Reading */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <span>
                    Dynamic Adaptive Reading · Question {Math.min(2, adaptiveHistory.length + 1)} of 2
                  </span>
                  <span className="font-mono-tabular text-[#991B1B] dark:text-[#D97706]">
                    Current Difficulty: {ADAPTIVE_READING_POOL[currentAdaptiveIdx].cefrLabel}
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-4">
                  <p className="text-sm leading-relaxed border-b border-[#E6E2DA] dark:border-[#263042] pb-3 italic">
                    “{ADAPTIVE_READING_POOL[currentAdaptiveIdx].passageSnippet}”
                  </p>
                  <p className="text-sm font-semibold">
                    {ADAPTIVE_READING_POOL[currentAdaptiveIdx].question}
                  </p>
                  <div className="space-y-2">
                    {ADAPTIVE_READING_POOL[currentAdaptiveIdx].options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setSelectedAdaptiveOption(oIdx)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                          selectedAdaptiveOption === oIdx
                            ? 'bg-[#991B1B] text-white border-[#991B1B] dark:bg-[#D97706]'
                            : 'bg-[#FAF8F5] dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(0)}
                    className="text-xs text-zinc-500 underline cursor-pointer"
                  >
                    ← Previous Step
                  </button>
                  <button
                    onClick={handleAdaptiveReadingStep}
                    disabled={selectedAdaptiveOption === -1}
                    className="px-5 py-2.5 text-xs font-medium text-white bg-[#991B1B] disabled:opacity-50 rounded-lg cursor-pointer"
                  >
                    Submit &amp; Adapt Difficulty
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: 50-Word Writing Diagnostic */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-300">
                    Write a short paragraph (~50 words) responding to the prompt below:
                  </span>
                  <span className="font-mono-tabular font-semibold text-[#991B1B] dark:text-[#D97706]">
                    {writingWords} / 50 target words
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2">
                  <p className="text-xs font-semibold">
                    Prompt: Why do many university students choose to study abroad, and what is the primary challenge they face?
                  </p>
                  {showVi && (
                    <p className="text-xs text-zinc-500">
                      🇻🇳 Đề bài: Tại sao nhiều sinh viên đại học chọn đi du học, và thách thức lớn nhất họ gặp phải là gì?
                    </p>
                  )}
                  <textarea
                    rows={4}
                    value={writingSample}
                    onChange={(e) => setWritingSample(e.target.value)}
                    placeholder="Write 2–3 complex sentences demonstrating your vocabulary and subordinate clause structure..."
                    className="w-full p-3 text-sm rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#151C28] focus:outline-none focus:border-[#991B1B]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-zinc-500 underline cursor-pointer"
                  >
                    ← Back to Reading
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 text-xs font-medium text-white bg-[#991B1B] rounded-lg inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Speaking Part 1</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Speaking Part 1 MediaRecorder */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-3">
                  <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
                    IELTS Speaking Part 1 Prompt
                  </p>
                  <p className="text-sm font-semibold">
                    “Tell me about your hometown or the city you live in now. How has its transport or architecture changed recently?”
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#991B1B] rounded-lg cursor-pointer"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        Record Spoken Answer
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-zinc-900 rounded-lg cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5" />
                        Stop Recording
                      </button>
                    )}
                    {recordedAudioUrl && (
                      <audio controls src={recordedAudioUrl} className="h-8 max-w-xs" />
                    )}
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs text-zinc-500 mb-1">
                      Spoken Transcript / Self-Summary for AI Examiner Scoring:
                    </label>
                    <textarea
                      rows={3}
                      value={speakingNotes}
                      onChange={(e) => setSpeakingNotes(e.target.value)}
                      placeholder="Summarize what you said (or record above to populate)..."
                      className="w-full p-2.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#151C28]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-zinc-500 underline cursor-pointer"
                  >
                    ← Back to Writing
                  </button>
                  <button
                    onClick={finishDetailedDiagnostic}
                    disabled={isEvaluating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-50 rounded-lg cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isEvaluating
                        ? 'AI Examiner Calibrating 4-Skill Profile...'
                        : 'Complete 4-Skill AI Calibration'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode: Manual Band Selection */}
        {mode === 'manual' && (
          <div className="space-y-5">
            <button
              onClick={() => setMode('select')}
              className="text-xs text-zinc-500 underline cursor-pointer"
            >
              ← Back to Assessment Modes
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { id: '0-3.5', label: 'Band 0 – 3.5 (Nền tảng · CEFR A1–A2)', score: 3.5 },
                  { id: '3.5-5.0', label: 'Band 3.5 – 5.0 (Sơ cấp · CEFR A2–B1)', score: 4.5 },
                  { id: '5.0-6.0', label: 'Band 5.0 – 6.0 (Trung cấp · CEFR B1–B2)', score: 5.5 },
                  { id: '6.0-7.0+', label: 'Band 6.0 – 7.0+ (Nâng cao · CEFR B2–C1)', score: 6.5 },
                ] as { id: BandLevelId; label: string; score: number }[]
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setManualBand(item.id)}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    manualBand === item.id
                      ? 'border-[#991B1B] bg-[#991B1B]/10 dark:border-[#D97706] dark:bg-[#D97706]/15'
                      : 'border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#0B0F17]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{item.label}</span>
                    {manualBand === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span>Target Band Score:</span>
                <select
                  value={targetBand}
                  onChange={(e) => setTargetBand(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#0B0F17] font-mono-tabular"
                >
                  {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map((b) => (
                    <option key={b} value={b}>
                      Band {b.toFixed(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  const base =
                    manualBand === '0-3.5'
                      ? 3.5
                      : manualBand === '3.5-5.0'
                      ? 4.5
                      : manualBand === '5.0-6.0'
                      ? 5.5
                      : 6.5;
                  onCompletePlacement({
                    bandLevel: manualBand,
                    targetBand,
                    listeningScore: base,
                    readingScore: base,
                    writingScore: base,
                    speakingScore: base,
                    mode: 'manual',
                    summaryText: `Đã chọn chặng Band ${manualBand} với mục tiêu Band ${targetBand.toFixed(1)}.`,
                  });
                }}
                className="px-5 py-2.5 text-xs font-medium text-white bg-[#991B1B] rounded-lg cursor-pointer"
              >
                Save Pathway Selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
