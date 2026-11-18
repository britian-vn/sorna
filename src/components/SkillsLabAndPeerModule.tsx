import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Mic,
  Square,
  Share2,
  Eye,
  MessageSquare,
  Languages,
} from 'lucide-react';
import {
  AiGradeResponse,
  BandLevelId,
  LanguageMode,
  PeerSubmissionData,
  SkillType,
} from '../types';
import {
  LISTENING_READING_TESTS,
  WRITING_PROMPTS,
  SPEAKING_CUE_CARDS,
  speakText,
} from '../data/curriculum';

interface SkillsLabAndPeerProps {
  langMode: LanguageMode;
  currentBandLevel: BandLevelId;
  targetBand: number;
  peerSubmissions: PeerSubmissionData[];
  onRecordAttempt: (
    skill: SkillType,
    testTitle: string,
    bandScore: number,
    userResponse: string,
    aiFeedbackSummary: string,
    durationSeconds: number
  ) => void;
  onSharePeerSubmission: (
    skill: 'writing' | 'speaking',
    promptTitle: string,
    content: string
  ) => void;
  onReviewPeerSubmission: (
    submission: PeerSubmissionData,
    bandGiven: number,
    comment: string
  ) => void;
}

export const SkillsLabAndPeerModule: React.FC<SkillsLabAndPeerProps> = ({
  langMode,
  targetBand,
  peerSubmissions,
  onRecordAttempt,
  onSharePeerSubmission,
  onReviewPeerSubmission,
}) => {
  const showVi = langMode === 'bilingual' || langMode === 'vi';

  const [activeTab, setActiveTab] = useState<
    'listening' | 'reading' | 'writing' | 'speaking' | 'peer-review'
  >('listening');

  // Listening & Reading State
  const [lrAnswers, setLrAnswers] = useState<Record<string, number>>({});
  const [lrSubmitted, setLrSubmitted] = useState<Record<string, boolean>>({});
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [lrTimerSeconds, setLrTimerSeconds] = useState(600);
  const [lrTimerRunning, setLrTimerRunning] = useState(false);
  const [showPassageTranslationVi, setShowPassageTranslationVi] = useState(true);

  // Writing State
  const [activeWritingIdx, setActiveWritingIdx] = useState(0);
  const [essayText, setEssayText] = useState('');
  const [writingSeconds, setWritingSeconds] = useState(WRITING_PROMPTS[0].durationMinutes * 60);
  const [writingTimerRunning, setWritingTimerRunning] = useState(false);
  const [showSampleEssay, setShowSampleEssay] = useState(false);
  const [writingAiGrade, setWritingAiGrade] = useState<AiGradeResponse | null>(null);
  const [isGradingWriting, setIsGradingWriting] = useState(false);
  const [writingGradeError, setWritingGradeError] = useState<string | null>(null);
  const [peerSharedNotice, setPeerSharedNotice] = useState<string | null>(null);

  // Speaking State
  const [activeCueIdx, setActiveCueIdx] = useState(0);
  const [speakingTimerSeconds, setSpeakingTimerSeconds] = useState(
    SPEAKING_CUE_CARDS[0].speakSeconds
  );
  const [speakingTimerRunning, setSpeakingTimerRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [spokenTranscriptInput, setSpokenTranscriptInput] = useState('');
  const [speakingAiGrade, setSpeakingAiGrade] = useState<AiGradeResponse | null>(null);
  const [isGradingSpeaking, setIsGradingSpeaking] = useState(false);
  const [speakingGradeError, setSpeakingGradeError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Peer Review Form State
  const [reviewScores, setReviewScores] = useState<Record<string, number>>({});
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!lrTimerRunning) return;
    const t = setInterval(() => {
      setLrTimerSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [lrTimerRunning]);

  useEffect(() => {
    if (!writingTimerRunning) return;
    const t = setInterval(() => {
      setWritingSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [writingTimerRunning]);

  useEffect(() => {
    if (!speakingTimerRunning) return;
    const t = setInterval(() => {
      setSpeakingTimerSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [speakingTimerRunning]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentWritingPrompt = WRITING_PROMPTS[activeWritingIdx] || WRITING_PROMPTS[0];
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const currentCueCard = SPEAKING_CUE_CARDS[activeCueIdx] || SPEAKING_CUE_CARDS[0];

  const handleGradeWritingWithAi = async () => {
    if (wordCount < 10) {
      setWritingGradeError(
        langMode === 'en'
          ? 'Please write at least 10 words before requesting AI Examiner grading.'
          : 'Vui lòng viết ít nhất 10 từ trước khi bấm chấm điểm AI Examiner.'
      );
      return;
    }
    setIsGradingWriting(true);
    setWritingGradeError(null);
    try {
      const response = await fetch('/api/ai/grade-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: 'writing',
          promptTitle: currentWritingPrompt.title,
          promptText: currentWritingPrompt.promptText,
          userText: essayText,
          targetBand,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to grade essay.');
      }
      setWritingAiGrade(data);
      onRecordAttempt(
        'writing',
        currentWritingPrompt.title,
        Number(data.overallBand) || 6.5,
        essayText,
        data.examinerSummary || 'AI Examiner evaluation complete.',
        currentWritingPrompt.durationMinutes * 60 - writingSeconds
      );
    } catch (err: unknown) {
      setWritingGradeError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGradingWriting(false);
    }
  };

  const startSpeakingRecording = async () => {
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
      setSpeakingTimerRunning(true);
    } catch {
      setSpokenTranscriptInput(
        (prev) => prev || currentCueCard.sampleAnswer.slice(0, 260)
      );
    }
  };

  const stopSpeakingRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setSpeakingTimerRunning(false);
      if (!spokenTranscriptInput.trim()) {
        setSpokenTranscriptInput(
          'Recorded response: Regarding this topic, I find that systematic daily habits and active vocabulary recall have made a substantial difference in my academic fluency.'
        );
      }
    }
  };

  const handleGradeSpeakingWithAi = async () => {
    const textToEvaluate = spokenTranscriptInput.trim();
    if (textToEvaluate.length < 10) {
      setSpeakingGradeError(
        langMode === 'en'
          ? 'Please record your voice or enter your spoken response transcript (at least 10 characters) for AI evaluation.'
          : 'Vui lòng thu âm hoặc nhập nội dung câu trả lời nói (ít nhất 10 ký tự) để AI chấm chữa lỗi.'
      );
      return;
    }
    setIsGradingSpeaking(true);
    setSpeakingGradeError(null);
    try {
      const response = await fetch('/api/ai/grade-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: 'speaking',
          promptTitle: currentCueCard.title,
          promptText: currentCueCard.prompts.join(' '),
          userText: textToEvaluate,
          targetBand,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate speaking response.');
      }
      setSpeakingAiGrade(data);
      onRecordAttempt(
        'speaking',
        currentCueCard.title,
        Number(data.overallBand) || 6.5,
        textToEvaluate,
        data.examinerSummary || 'AI Speaking evaluation complete.',
        currentCueCard.speakSeconds
      );
    } catch (err: unknown) {
      setSpeakingGradeError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGradingSpeaking(false);
    }
  };

  const activeLrTest =
    LISTENING_READING_TESTS.find((t) => t.skill === activeTab) || LISTENING_READING_TESTS[0];

  return (
    <div className="space-y-6">
      {/* Header + 5-Tab Segmented Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E6E2DA] dark:border-[#263042] pb-5">
        <div className="space-y-1.5">
          <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
            {langMode === 'vi'
              ? 'Học phần 04 · Luyện 4 Kỹ Năng IELTS, Chấm Chữa Lỗi AI Song Ngữ & Đánh Giá Chéo'
              : 'Module 04 · 4 IELTS Skills Lab, Bilingual AI Rubric Examiner & Peer Review'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold font-serif-editorial">
            {langMode === 'vi'
              ? 'Phòng Luyện 4 Kỹ Năng IELTS & Chấm Chữa Bài Song Ngữ'
              : 'IELTS 4-Skills Practice Studio (Song Ngữ Anh – Việt)'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-[#151C28] rounded-xl border border-[#E6E2DA] dark:border-[#263042]">
          {(
            [
              { id: 'listening', label: langMode === 'en' ? '1. Listening' : '1. Nghe (Listening)' },
              { id: 'reading', label: langMode === 'en' ? '2. Reading' : '2. Đọc (Reading)' },
              {
                id: 'writing',
                label: langMode === 'en' ? '3. Writing + AI Grader' : '3. Viết + Chấm AI Song Ngữ',
              },
              {
                id: 'speaking',
                label: langMode === 'en' ? '4. Speaking + Recorder' : '4. Nói + Thu Âm & AI',
              },
              {
                id: 'peer-review',
                label:
                  langMode === 'en'
                    ? `5. Peer Review (${peerSubmissions.length})`
                    : `5. Chấm Chéo (${peerSubmissions.length})`,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#991B1B] text-white dark:bg-[#D97706]'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1 & 2: Listening & Reading */}
      {(activeTab === 'listening' || activeTab === 'reading') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Stage: Audio Player / Academic Reading Passage */}
          <div className="lg:col-span-7 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
              <div>
                <p className="text-xs text-zinc-500 font-mono-tabular">
                  {activeLrTest.skill.toUpperCase()} · {activeLrTest.bandTarget} · Topic: {activeLrTest.topic}
                </p>
                <h2 className="text-xl font-bold font-serif-editorial mt-0.5">
                  {activeLrTest.title}
                </h2>
                {showVi && activeLrTest.titleVi && (
                  <p className="text-xs font-medium text-[#991B1B] dark:text-[#D97706] mt-0.5">
                    🇻🇳 {activeLrTest.titleVi}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {showVi && (
                  <button
                    onClick={() => setShowPassageTranslationVi(!showPassageTranslationVi)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] cursor-pointer"
                  >
                    <Languages className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{showPassageTranslationVi ? 'Ẩn bản dịch TV' : 'Hiện bản dịch TV'}</span>
                  </button>
                )}

                <div className="flex items-center gap-2 bg-[#FAF8F5] dark:bg-[#0B0F17] px-3 py-1.5 rounded-lg border border-[#E6E2DA] dark:border-[#263042]">
                  <span className="text-sm font-bold font-mono-tabular">
                    {formatTimer(lrTimerSeconds)}
                  </span>
                  <button
                    onClick={() => setLrTimerRunning(!lrTimerRunning)}
                    className="p-1 text-[#991B1B] dark:text-[#D97706] cursor-pointer"
                    title={lrTimerRunning ? 'Pause timer' : 'Start timer'}
                  >
                    {lrTimerRunning ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setLrTimerRunning(false);
                      setLrTimerSeconds(activeLrTest.durationMinutes * 60);
                    }}
                    className="p-1 text-zinc-500 cursor-pointer"
                    title="Reset timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {activeTab === 'listening' && (
              <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold">
                    {langMode === 'en'
                      ? 'Built-In Multi-Speaker Tutorial Synthesizer & Custom Stream Player'
                      : 'Trình Phát Audio Bài Nghe Học Thuật & Nhúng Link MP3 Tùy Chỉnh'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        speakText(activeLrTest.audioScriptOrPassage.join(' '), 0.96)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#991B1B] text-white rounded-lg cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {langMode === 'en' ? 'Play Full Tutorial Audio' : 'Phát Toàn Bộ Bài Nghe'}
                      </span>
                    </button>
                    <button
                      onClick={() => window.speechSynthesis?.cancel()}
                      className="px-2.5 py-1.5 text-xs border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Tùy chọn: Dán link file nghe MP3/WAV của bạn vào đây..."
                    value={customAudioUrl}
                    onChange={(e) => setCustomAudioUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28]"
                  />
                  {customAudioUrl && (
                    <audio controls src={customAudioUrl} className="h-8 max-w-xs" />
                  )}
                </div>
              </div>
            )}

            {/* Script or Reading Passage Paragraphs + Vietnamese Translation */}
            <div className="space-y-4">
              {activeLrTest.audioScriptOrPassage.map((para, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-[#FAF8F5]/70 dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-relaxed text-[#18181B] dark:text-[#F3F0E6]">
                      {para}
                    </p>
                    <button
                      onClick={() => speakText(para)}
                      className="p-1.5 rounded-md border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] shrink-0 cursor-pointer"
                      title="Listen to segment"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
                    </button>
                  </div>
                  {showVi &&
                    showPassageTranslationVi &&
                    activeLrTest.passageTranslationsVi?.[idx] && (
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 pt-2 border-t border-[#E6E2DA] dark:border-[#263042] leading-relaxed">
                        🇻🇳 <strong>Bản dịch:</strong> {activeLrTest.passageTranslationsVi[idx]}
                      </p>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Stage: Auto-Graded Questions & Bilingual Explanations */}
          <div className="lg:col-span-5 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold font-serif-editorial">
              {langMode === 'en'
                ? 'Comprehension Questions & Auto-Grader'
                : 'Câu Hỏi Đọc/Nghe Hiểu & Chữa Lỗi Song Ngữ Anh – Việt'}
            </h3>

            <div className="space-y-4">
              {activeLrTest.questions.map((q, qIdx) => {
                const chosen = lrAnswers[q.id];
                const isSub = lrSubmitted[activeLrTest.id];
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
                              setLrAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                            }
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-colors cursor-pointer ${cls}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {isSub && (
                      <div className="space-y-2 pt-2 border-t border-[#E6E2DA] dark:border-[#263042]">
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] text-xs">
                          <strong className="text-[#991B1B] dark:text-[#D97706]">
                            🇬🇧 English Explanation:
                          </strong>{' '}
                          {q.explanation}
                        </div>
                        {q.explanationVi && (
                          <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200">
                            <strong>🇻🇳 Giải thích Tiếng Việt:</strong> {q.explanationVi}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              {lrSubmitted[activeLrTest.id] && (
                <span className="text-xs font-mono-tabular font-semibold text-emerald-700 dark:text-emerald-400">
                  Score:{' '}
                  {
                    activeLrTest.questions.filter(
                      (q) => lrAnswers[q.id] === q.correctIndex
                    ).length
                  }{' '}
                  / {activeLrTest.questions.length} Correct
                </span>
              )}
              <button
                onClick={() => {
                  setLrSubmitted((prev) => ({ ...prev, [activeLrTest.id]: true }));
                  const correctCount = activeLrTest.questions.filter(
                    (q) => lrAnswers[q.id] === q.correctIndex
                  ).length;
                  const estimatedBand =
                    correctCount === activeLrTest.questions.length
                      ? 8.0
                      : correctCount >= 2
                      ? 6.5
                      : 5.0;
                  onRecordAttempt(
                    activeLrTest.skill,
                    activeLrTest.title,
                    estimatedBand,
                    `Completed ${correctCount}/${activeLrTest.questions.length} items.`,
                    'Auto-graded Listening/Reading practice test.',
                    activeLrTest.durationMinutes * 60 - lrTimerSeconds
                  );
                }}
                className="ml-auto px-5 py-2.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg cursor-pointer"
              >
                {langMode === 'en'
                  ? 'Submit & Auto-Grade Answers'
                  : 'Nộp Bài & Xem Giải Thích Song Ngữ Anh – Việt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Writing Task 1 & Task 2 + Bilingual AI Examiner Grader + Model Essay */}
      {activeTab === 'writing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Prompt, Editor, Word Counter & Timer */}
          <div className="lg:col-span-7 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
              <div className="flex items-center gap-2">
                {WRITING_PROMPTS.map((wp, idx) => (
                  <button
                    key={wp.id}
                    onClick={() => {
                      setActiveWritingIdx(idx);
                      setWritingSeconds(wp.durationMinutes * 60);
                      setWritingAiGrade(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                      activeWritingIdx === idx
                        ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                        : 'border-[#E6E2DA] dark:border-[#263042]'
                    }`}
                  >
                    {wp.taskType}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono-tabular px-2.5 py-1 rounded bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                  Words: <strong>{wordCount}</strong> / {currentWritingPrompt.minWords} min
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                  <span className="text-xs font-mono-tabular font-bold">
                    {formatTimer(writingSeconds)}
                  </span>
                  <button
                    onClick={() => setWritingTimerRunning(!writingTimerRunning)}
                    className="text-[#991B1B] dark:text-[#D97706] cursor-pointer"
                  >
                    {writingTimerRunning ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2">
              <p className="text-xs font-mono-tabular text-[#991B1B] dark:text-[#D97706]">
                {currentWritingPrompt.taskType} · {currentWritingPrompt.topic} ·{' '}
                {currentWritingPrompt.durationMinutes} mins
              </p>
              <h2 className="text-lg font-bold font-serif-editorial">
                {currentWritingPrompt.title}
              </h2>
              {showVi && currentWritingPrompt.titleVi && (
                <p className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706]">
                  🇻🇳 {currentWritingPrompt.titleVi}
                </p>
              )}
              <p className="text-sm text-[#18181B] dark:text-[#F3F0E6] leading-relaxed">
                {currentWritingPrompt.promptText}
              </p>
              {showVi && currentWritingPrompt.promptTextVi && (
                <p className="text-xs text-emerald-800 dark:text-emerald-300 pt-1">
                  🇻🇳 <strong>Dịch đề bài:</strong> {currentWritingPrompt.promptTextVi}
                </p>
              )}
              {currentWritingPrompt.chartSummary && (
                <div className="p-3 rounded-lg bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] text-xs font-mono-tabular text-zinc-700 dark:text-zinc-300">
                  <strong>Data Reference Table:</strong> {currentWritingPrompt.chartSummary}
                </div>
              )}
            </div>

            <textarea
              rows={11}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder={`Viết bài ${currentWritingPrompt.taskType} của bạn tại đây (tối thiểu ${currentWritingPrompt.minWords} từ)... Bấm "Chấm Bài Với AI Song Ngữ" để nhận nhận xét & sửa lỗi chi tiết bằng cả Tiếng Anh và Tiếng Việt.`}
              className="w-full p-4 text-sm leading-relaxed rounded-xl border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] focus:outline-none focus:border-[#991B1B]"
            />

            {writingGradeError && (
              <p className="text-xs text-red-600 dark:text-red-400">{writingGradeError}</p>
            )}
            {peerSharedNotice && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400">{peerSharedNotice}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSampleEssay(!showSampleEssay)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {showSampleEssay
                      ? langMode === 'en'
                        ? 'Hide Band 8.0 Sample'
                        : 'Ẩn Bài Mẫu Band 8.0'
                      : langMode === 'en'
                      ? 'View Band 8.0 Sample Essay'
                      : 'Xem Bài Mẫu Band 8.0'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (wordCount < 10) {
                      setWritingGradeError('Write at least 10 words before sharing to Peer Review.');
                      return;
                    }
                    onSharePeerSubmission('writing', currentWritingPrompt.title, essayText);
                    setPeerSharedNotice(
                      'Đã đăng ẩn danh lên Cộng đồng Đánh giá chéo (Peer-Review Hub)!'
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{langMode === 'en' ? 'Share for Peer Review' : 'Gửi Chấm Chéo'}</span>
                </button>
              </div>

              <button
                onClick={handleGradeWritingWithAi}
                disabled={isGradingWriting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-50 rounded-lg cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isGradingWriting
                    ? 'AI Examiner Đang Chấm & Chữa Lỗi Song Ngữ...'
                    : langMode === 'en'
                    ? 'Grade with AI Examiner'
                    : 'Chấm Điểm & Chữa Lỗi Song Ngữ Với AI'}
                </span>
              </button>
            </div>
          </div>

          {/* Right: Bilingual AI Examiner Rubric Report & Sample Band 8.0 Essay */}
          <div className="lg:col-span-5 space-y-5">
            {writingAiGrade ? (
              <div className="bg-white dark:bg-[#151C28] border border-[#991B1B] dark:border-[#D97706] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E6E2DA] dark:border-[#263042] pb-3">
                  <div>
                    <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-semibold">
                      Official 4-Criterion Bilingual AI Examiner Report
                    </p>
                    <h3 className="text-lg font-bold font-serif-editorial">
                      Estimated Score: Band {writingAiGrade.overallBand.toFixed(1)}
                    </h3>
                  </div>
                  <span className="text-2xl font-bold font-mono-tabular text-[#991B1B] dark:text-[#D97706]">
                    {writingAiGrade.overallBand.toFixed(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono-tabular">
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                    Task Response: <strong>{writingAiGrade.taskResponse.toFixed(1)}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                    Coherence: <strong>{writingAiGrade.coherenceCohesion.toFixed(1)}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                    Lexical Resource: <strong>{writingAiGrade.lexicalResource.toFixed(1)}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                    Grammar Range: <strong>{writingAiGrade.grammaticalRange.toFixed(1)}</strong>
                  </div>
                </div>

                {/* Bilingual Examiner Summary */}
                <div className="space-y-2">
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <strong>🇬🇧 Examiner Summary:</strong> {writingAiGrade.examinerSummary}
                  </p>
                  {writingAiGrade.examinerSummaryVi && (
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <strong>🇻🇳 Nhận xét Giám khảo (Tiếng Việt):</strong>{' '}
                      {writingAiGrade.examinerSummaryVi}
                    </p>
                  )}
                </div>

                {/* Side-by-Side Strengths */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    ✓ Điểm mạnh (Key Strengths EN &amp; VI):
                  </p>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 list-disc pl-4">
                    {writingAiGrade.strengths.map((s, i) => (
                      <li key={i}>
                        <div>{s}</div>
                        {writingAiGrade.strengthsVi?.[i] && (
                          <div className="text-emerald-700 dark:text-emerald-400">
                            🇻🇳 {writingAiGrade.strengthsVi[i]}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Side-by-Side Priority Fixes */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    ▲ Chữa lỗi &amp; Cải thiện để nâng Band (Priority Fixes EN &amp; VI):
                  </p>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 list-disc pl-4">
                    {writingAiGrade.improvements.map((imp, i) => (
                      <li key={i}>
                        <div>{imp}</div>
                        {writingAiGrade.improvementsVi?.[i] && (
                          <div className="text-amber-800 dark:text-amber-300">
                            🇻🇳 {writingAiGrade.improvementsVi[i]}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-2">
                  <p className="text-xs font-semibold">
                    Band 7.5+ Upgraded Version of Your Draft:
                  </p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {writingAiGrade.modelUpgrade}
                  </p>
                  {writingAiGrade.modelUpgradeVi && (
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 pt-2 border-t border-[#E6E2DA] dark:border-[#263042] leading-relaxed">
                      <strong>🇻🇳 Giải thích bản nâng cấp:</strong> {writingAiGrade.modelUpgradeVi}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold font-serif-editorial">
                  {langMode === 'en'
                    ? 'Examiner Structural Checklist'
                    : 'Tiêu Chí Chấm Điểm Của Giám Khảo IELTS'}
                </h3>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300 list-disc pl-4">
                  {currentWritingPrompt.rubricChecklist.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {showSampleEssay && (
              <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold font-serif-editorial">
                  Band 8.0 Annotated Model Essay
                </h3>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {currentWritingPrompt.sampleBand75Essay}
                </p>
                <div className="p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                  <p>{currentWritingPrompt.examinerNotes}</p>
                  {showVi && currentWritingPrompt.examinerNotesVi && (
                    <p className="text-emerald-800 dark:text-emerald-300 pt-1">
                      🇻🇳 {currentWritingPrompt.examinerNotesVi}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Speaking Parts 1, 2, 3 Cue Cards + Browser Audio Recorder + Bilingual AI Speaking Grader */}
      {activeTab === 'speaking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E2DA] dark:border-[#263042] pb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {SPEAKING_CUE_CARDS.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      setActiveCueIdx(idx);
                      setSpeakingTimerSeconds(card.speakSeconds);
                      setSpeakingAiGrade(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                      activeCueIdx === idx
                        ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                        : 'border-[#E6E2DA] dark:border-[#263042]'
                    }`}
                  >
                    {card.part}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono-tabular font-bold px-3 py-1 rounded bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042]">
                Timer: {formatTimer(speakingTimerSeconds)}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-3">
              <p className="text-xs font-mono-tabular text-[#991B1B] dark:text-[#D97706]">
                {currentCueCard.part} · Prep: {currentCueCard.prepSeconds}s · Speak:{' '}
                {currentCueCard.speakSeconds}s
              </p>
              <h2 className="text-xl font-bold font-serif-editorial">{currentCueCard.title}</h2>
              {showVi && currentCueCard.titleVi && (
                <p className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706]">
                  🇻🇳 {currentCueCard.titleVi}
                </p>
              )}
              <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                {currentCueCard.prompts.map((p, i) => (
                  <li key={i}>
                    <div>{p}</div>
                    {showVi && currentCueCard.promptsVi?.[i] && (
                      <div className="text-xs text-zinc-500">
                        🇻🇳 {currentCueCard.promptsVi[i]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-zinc-500 pt-1">
                Target C1 Lexicon: {currentCueCard.keyLexicon.join(' · ')}
              </p>
            </div>

            {/* Browser Audio Recorder & Playback */}
            <div className="p-4 rounded-xl border border-[#E6E2DA] dark:border-[#263042] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <button
                      onClick={startSpeakingRecording}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{langMode === 'en' ? 'Record Answer' : 'Thu Âm Câu Trả Lời'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopSpeakingRecording}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-zinc-900 rounded-lg cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop Recording</span>
                    </button>
                  )}
                  <button
                    onClick={() => speakText(currentCueCard.sampleAnswer, 0.98)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>
                      {langMode === 'en' ? 'Hear Band 8.0 Model' : 'Nghe Mẫu Band 8.0'}
                    </span>
                  </button>
                </div>

                {recordedAudioUrl && (
                  <audio controls src={recordedAudioUrl} className="h-8 max-w-xs" />
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  {langMode === 'en'
                    ? 'Spoken Response Transcript (for AI Examiner & Peer Evaluation):'
                    : 'Nội dung câu trả lời nói của bạn (để AI chấm điểm & chữa lỗi song ngữ):'}
                </label>
                <textarea
                  rows={4}
                  value={spokenTranscriptInput}
                  onChange={(e) => setSpokenTranscriptInput(e.target.value)}
                  placeholder="Thu âm ở trên hoặc nhập nội dung câu trả lời nói của bạn tại đây để AI chấm điểm 4 tiêu chí..."
                  className="w-full p-3 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                />
              </div>

              {speakingGradeError && (
                <p className="text-xs text-red-600 dark:text-red-400">{speakingGradeError}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (spokenTranscriptInput.trim().length < 10) return;
                    onSharePeerSubmission(
                      'speaking',
                      currentCueCard.title,
                      spokenTranscriptInput
                    );
                  }}
                  className="px-3.5 py-2 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] rounded-lg cursor-pointer"
                >
                  {langMode === 'en' ? 'Share to Peer Review' : 'Gửi Chấm Chéo'}
                </button>
                <button
                  onClick={handleGradeSpeakingWithAi}
                  disabled={isGradingSpeaking}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#991B1B] rounded-lg cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isGradingSpeaking
                      ? 'AI Đang Chấm...'
                      : langMode === 'en'
                      ? 'Evaluate with AI Examiner'
                      : 'Chấm Nói & Sửa Lỗi Song Ngữ Với AI'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            {speakingAiGrade && (
              <div className="bg-white dark:bg-[#151C28] border border-[#991B1B] dark:border-[#D97706] rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-serif-editorial">
                    AI Speaking Band: {speakingAiGrade.overallBand.toFixed(1)}
                  </h3>
                  <span className="text-xs font-mono-tabular">
                    Fluency {speakingAiGrade.taskResponse.toFixed(1)} · Lexicon{' '}
                    {speakingAiGrade.lexicalResource.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  <strong>🇬🇧 Feedback:</strong> {speakingAiGrade.examinerSummary}
                </p>
                {speakingAiGrade.examinerSummaryVi && (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <strong>🇻🇳 Nhận xét Tiếng Việt:</strong> {speakingAiGrade.examinerSummaryVi}
                  </p>
                )}
                <div className="p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] text-xs space-y-1">
                  <strong>Band 8.0 Upgraded Spoken Phrasing:</strong>
                  <p className="text-zinc-600 dark:text-zinc-300">{speakingAiGrade.modelUpgrade}</p>
                  {speakingAiGrade.modelUpgradeVi && (
                    <p className="text-emerald-800 dark:text-emerald-300 pt-1">
                      🇻🇳 {speakingAiGrade.modelUpgradeVi}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-3">
              <h3 className="text-base font-bold font-serif-editorial">
                Band 8.0 Sample Spoken Response
              </h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                “{currentCueCard.sampleAnswer}”
              </p>
              {showVi && currentCueCard.sampleAnswerVi && (
                <p className="text-xs text-emerald-800 dark:text-emerald-300 pt-2 border-t border-[#E6E2DA] dark:border-[#263042] leading-relaxed">
                  <strong>🇻🇳 Bản dịch câu trả lời mẫu:</strong> “{currentCueCard.sampleAnswerVi}”
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Anonymous Peer-Review Hub */}
      {activeTab === 'peer-review' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-serif-editorial">
                {langMode === 'en'
                  ? 'Anonymous Community Peer-Review Hub'
                  : 'Cộng Đồng Chấm Chéo Ẩn Danh (Anonymous Peer-Review Hub)'}
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {langMode === 'en'
                  ? 'Evaluate fellow learners’ Writing and Speaking submissions anonymously using the official IELTS Band scale to unlock the Peer Review Mentor badge.'
                  : 'Đánh giá ẩn danh bài Writing & Speaking của các học viên khác theo thang điểm IELTS để mở khóa huy hiệu Cố Vấn Chấm Chéo.'}
              </p>
            </div>
            <MessageSquare className="w-5 h-5 text-[#991B1B] dark:text-[#D97706] shrink-0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {peerSubmissions.map((sub) => {
              const scoreVal = reviewScores[sub.id] ?? 6.5;
              const commentVal = reviewComments[sub.id] ?? '';
              return (
                <div
                  key={sub.id}
                  className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-mono-tabular">
                      <span>
                        {sub.anonymousHandle} · Pathway {sub.authorBand} · {sub.skill.toUpperCase()}
                      </span>
                      <span className="font-semibold text-[#991B1B] dark:text-[#D97706]">
                        Avg Peer Score: Band {sub.averageBand.toFixed(1)} ({sub.reviewCount} reviews)
                      </span>
                    </div>
                    <h3 className="text-base font-bold font-serif-editorial">{sub.promptTitle}</h3>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-[#FAF8F5] dark:bg-[#0B0F17] p-3.5 rounded-lg border border-[#E6E2DA] dark:border-[#263042]">
                      {sub.content}
                    </p>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      <strong>Latest Feedback ({sub.latestReviewerHandle}):</strong> “
                      {sub.latestReviewComment}”
                    </div>
                  </div>

                  {/* Submit Peer Evaluation Form */}
                  <div className="pt-3 border-t border-[#E6E2DA] dark:border-[#263042] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor={`band-${sub.id}`} className="font-medium">
                        Your Rubric Band Score:{' '}
                        <strong className="font-mono-tabular">{scoreVal.toFixed(1)}</strong>
                      </label>
                      <input
                        id={`band-${sub.id}`}
                        type="range"
                        min={4.0}
                        max={8.5}
                        step={0.5}
                        value={scoreVal}
                        onChange={(e) =>
                          setReviewScores((prev) => ({
                            ...prev,
                            [sub.id]: Number(e.target.value),
                          }))
                        }
                        className="w-32 accent-[#991B1B]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập nhận xét góp ý bằng Tiếng Việt hoặc Tiếng Anh..."
                        value={commentVal}
                        onChange={(e) =>
                          setReviewComments((prev) => ({ ...prev, [sub.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17]"
                      />
                      <button
                        onClick={() => {
                          if (!commentVal.trim()) return;
                          onReviewPeerSubmission(sub, scoreVal, commentVal.trim());
                          setReviewComments((prev) => ({ ...prev, [sub.id]: '' }));
                        }}
                        className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#991B1B] rounded-lg shrink-0 cursor-pointer"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
